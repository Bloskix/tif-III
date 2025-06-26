from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.opensearch.client import opensearch_client
from app.schemas.alert import Alert, AlertResponse, AlertFilters, WazuhAgent, WazuhRule
from opensearchpy.exceptions import NotFoundError

class AlertService:
    def __init__(self):
        self.client = opensearch_client.client
        self.index_pattern = "wazuh-alerts-*"

    def _get_index_pattern(self, from_date: Optional[datetime] = None, to_date: Optional[datetime] = None) -> str:
        """
        Genera el patrón de índice basado en el rango de fechas.
        
        Args:
            from_date: Fecha inicial opcional
            to_date: Fecha final opcional
        
        Returns:
            str: Patrón de índice para la consulta
            
        Estrategia:
        1. Si no hay fechas: usar el patrón general
        2. Si hay fechas: generar un patrón que incluya todos los meses en el rango
        """
        # Caso 1: Sin fechas, usar patrón general
        if not from_date and not to_date:
            return self.index_pattern
        
        # Caso 2: Solo from_date sin to_date
        if from_date and not to_date:
            year_month = from_date.strftime('%Y.%m')
            return f"wazuh-alerts-{year_month}.*"
        
        # Caso 3: Solo to_date sin from_date
        if to_date and not from_date:
            year_month = to_date.strftime('%Y.%m')
            return f"wazuh-alerts-{year_month}.*"
        
        # Caso 4: Ambas fechas
        if from_date and to_date:
            # Si son del mismo mes
            if from_date.strftime('%Y.%m') == to_date.strftime('%Y.%m'):
                year_month = from_date.strftime('%Y.%m')
                return f"wazuh-alerts-{year_month}.*"
            
            # Si son meses diferentes, usar patrón general
            # Esto asegura que obtengamos todas las alertas en el rango
            return self.index_pattern
        
        # Caso por defecto: usar patrón general
        return self.index_pattern

    def _build_query(self, filters: Optional[AlertFilters] = None) -> Dict[str, Any]:
        """Construye la consulta de OpenSearch basada en los filtros proporcionados"""
        must_conditions = []

        if filters:
            if filters.agent_ids:
                must_conditions.append({"terms": {"agent.id": filters.agent_ids}})
            
            if filters.rule_levels:
                must_conditions.append({"terms": {"rule.level": filters.rule_levels}})
            
            if filters.rule_groups:
                must_conditions.append({"terms": {"rule.groups": filters.rule_groups}})
            
            if filters.from_date or filters.to_date:
                range_query = {"@timestamp": {}}
                if filters.from_date:
                    range_query["@timestamp"]["gte"] = filters.from_date.isoformat()
                if filters.to_date:
                    range_query["@timestamp"]["lte"] = filters.to_date.isoformat()
                must_conditions.append({"range": range_query})
            
            if filters.search_term:
                must_conditions.append({
                    "multi_match": {
                        "query": filters.search_term,
                        "fields": ["rule.description", "full_log", "agent.name"]
                    }
                })

            if filters.alert_id:
                must_conditions.append({"term": {"_id": filters.alert_id}})

        return {
            "query": {
                "bool": {
                    "must": must_conditions if must_conditions else [{"match_all": {}}]
                }
            }
        }

    async def get_alerts(
        self,
        page: int = 1,
        size: int = 10,
        filters: Optional[AlertFilters] = None
    ) -> AlertResponse:
        """
        Obtiene las alertas de Wazuh desde OpenSearch con paginación y filtros
        """
        try:
            # Construir la consulta base
            query = self._build_query(filters)
            
            # Agregar paginación
            from_idx = (page - 1) * size
            query["size"] = size
            query["from"] = from_idx
            
            # Agregar ordenamiento por timestamp
            query["sort"] = [{"@timestamp": {"order": "desc"}}]

            # Obtener el patrón de índice basado en las fechas de filtro
            try:
                index_pattern = self._get_index_pattern(
                    from_date=filters.from_date if filters else None,
                    to_date=filters.to_date if filters else None
                )


                # Ejecutar la consulta
                response = self.client.search(
                    index=index_pattern,
                    body=query
                )

            except NotFoundError:
                return AlertResponse(
                    total=0,
                    alerts=[],
                    page=page,
                    size=size
                )

            # Procesar resultados
            total = response["hits"]["total"]["value"]
            alerts = []

            for hit in response["hits"]["hits"]:
                try:
                    source = hit["_source"]
                    
                    # Verificar y estructurar los datos del agente
                    if "agent" not in source:
                        continue

                    # Crear objeto WazuhAgent
                    agent = WazuhAgent(
                        id=str(source["agent"].get("id", "")),
                        name=source["agent"].get("name", "Unknown"),
                        ip=source["agent"].get("ip")
                    )

                    # Verificar y estructurar los datos de la regla
                    if "rule" not in source:
                        continue

                    # Crear objeto WazuhRule
                    rule = WazuhRule(
                        id=str(source["rule"].get("id", "")),
                        level=int(source["rule"].get("level", 0)),
                        description=source["rule"].get("description", "No description available"),
                        groups=source["rule"].get("groups", [])
                    )

                    # Convertir el timestamp
                    if "@timestamp" in source:
                        timestamp = datetime.fromisoformat(
                            source["@timestamp"].replace("Z", "+00:00")
                        )
                    else:
                        continue

                    # Crear objeto Alert con los objetos validados
                    alert = Alert(
                        id=hit["_id"],
                        timestamp=timestamp,
                        agent=agent,
                        rule=rule,
                        full_log=source.get("full_log", "No log available"),
                        location=source.get("location"),
                        decoder=source.get("decoder"),
                        data=source.get("data")
                    )
                    alerts.append(alert)
                except Exception as e:
                    continue

            return AlertResponse(
                total=total,
                alerts=alerts,
                page=page,
                size=size
            )

        except Exception as e:
            raise Exception(f"Error al obtener alertas: {str(e)}")

    async def get_weekly_alert_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas de las alertas de la última semana.
        """
        try:
            now = datetime.now()
            start_of_week = now - timedelta(days=7)
            
            query = {
                "size": 0,
                "query": {
                    "range": {
                        "@timestamp": {
                            "gte": start_of_week.isoformat(),
                            "lte": now.isoformat()
                        }
                    }
                },
                "aggs": {
                    "rule_levels": {
                        "terms": {
                            "field": "rule.level",
                            "size": 15
                        }
                    },
                    "top_rules": {
                        "terms": {
                            "field": "rule.description.keyword",
                            "size": 10
                        }
                    },
                    "alerts_over_time": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "fixed_interval": "1d",
                            "format": "yyyy-MM-dd",
                            "min_doc_count": 0,
                            "extended_bounds": {
                                "min": start_of_week.strftime("%Y-%m-%d"),
                                "max": now.strftime("%Y-%m-%d")
                            }
                        }
                    }
                }
            }

            response = self.client.search(
                index="wazuh-alerts-*",
                body=query
            )
            
            if response["hits"]["total"]["value"] == 0:
                return {
                    "rule_levels": [],
                    "top_rules": [],
                    "alerts_over_time": []
                }

            return {
                "rule_levels": response["aggregations"]["rule_levels"]["buckets"],
                "top_rules": response["aggregations"]["top_rules"]["buckets"],
                "alerts_over_time": response["aggregations"]["alerts_over_time"]["buckets"]
            }

        except Exception as e:
            raise Exception(f"Error al obtener estadísticas semanales: {str(e)}")

    async def get_monthly_alert_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas básicas de las alertas del mes actual hasta hoy.
        """
        try:
            # Configurar rango de fechas para el mes actual
            now = datetime.now()
            first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Usar un patrón de índice más flexible para el mes actual
            current_month = now.strftime('%Y.%m')
            index_pattern = f"wazuh-alerts-{current_month}.*"
            
            # Verificar si existen índices para el patrón
            indices_exist = self.client.indices.exists(index=index_pattern)
            if not indices_exist:
                return {
                    "message": "No existen alertas para el mes actual.",
                    "error": "index_not_found_exception"
                }
            
            query = {
                "size": 0,
                "query": {
                    "range": {
                        "@timestamp": {
                            "gte": first_day.isoformat(),
                            "lte": now.isoformat()
                        }
                    }
                },
                "aggs": {
                    "rule_levels": {
                        "terms": {
                            "field": "rule.level",
                            "size": 15
                        }
                    },
                    "top_rules": {
                        "terms": {
                            "field": "rule.description.keyword",
                            "size": 10
                        }
                    },
                    "alerts_over_time": {
                        "date_histogram": {
                            "field": "@timestamp",
                            "calendar_interval": "day",
                            "format": "yyyy-MM-dd",
                            "min_doc_count": 0,
                            "extended_bounds": {
                                "min": first_day.strftime("%Y-%m-%d"),
                                "max": now.strftime("%Y-%m-%d")
                            }
                        }
                    }
                }
            }

            response = self.client.search(
                index=index_pattern,
                body=query
            )

            # Verificar si hay resultados
            total_hits = response["hits"]["total"]["value"]
            if total_hits == 0:
                return {
                    "message": "No existen alertas para el mes actual.",
                    "error": "no_alerts_found"
                }

            return {
                "total_alerts": total_hits,
                "rule_levels": response["aggregations"]["rule_levels"]["buckets"],
                "top_rules": response["aggregations"]["top_rules"]["buckets"],
                "alerts_over_time": response["aggregations"]["alerts_over_time"]["buckets"]
            }

        except Exception as e:
            raise Exception(f"Error al obtener estadísticas: {str(e)}")

# Instancia global del servicio
alert_service = AlertService() 