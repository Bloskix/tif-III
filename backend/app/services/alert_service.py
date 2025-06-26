from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.opensearch.client import opensearch_client
from app.schemas.alert import Alert, AlertResponse, AlertFilters
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
        1. Si no hay fechas: usar el índice del día actual
        2. Si hay una fecha inicial pero no final: usar patrón general
        3. Si el rango es mayor a 31 días: usar patrón general
        4. Si el rango es corto: listar los índices específicos
        """
        # Caso 1: Sin fechas, usar solo el día actual
        if not from_date and not to_date:
            return f"wazuh-alerts-{datetime.now().strftime('%Y.%m.%d')}"
        
        # Caso 2: Solo from_date sin to_date
        if from_date and not to_date:
            return self.index_pattern
        
        # Caso 3: Rango completo
        if from_date and to_date:
            # Si el rango es mayor a 31 días, usar patrón general
            if (to_date - from_date).days > 31:
                return self.index_pattern
            
            # Para rangos cortos, listar los índices específicos
            indices = []
            current_date = from_date
            while current_date <= to_date:
                indices.append(f"wazuh-alerts-{current_date.strftime('%Y.%m.%d')}")
                current_date += timedelta(days=1)
            return ",".join(indices)
        
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
            index_pattern = self._get_index_pattern(
                from_date=filters.from_date if filters else None,
                to_date=filters.to_date if filters else None
            )

            # Ejecutar la consulta
            response = self.client.search(
                index=index_pattern,
                body=query
            )

            # Procesar resultados
            total = response["hits"]["total"]["value"]
            alerts = []

            for hit in response["hits"]["hits"]:
                source = hit["_source"]

                # Verificar que los campos obligatorios existan
                if "rule" not in source or "agent" not in source or "@timestamp" not in source:
                    continue  # O puedes loguear el caso para depuración

                # Convertir el timestamp a datetime
                if isinstance(source.get("@timestamp"), str):
                    source["timestamp"] = datetime.fromisoformat(
                        source["@timestamp"].replace("Z", "+00:00")
                    )
                
                # Crear objeto Alert
                alert = Alert(
                    id=hit["_id"],  # Agregamos el ID de OpenSearch
                    timestamp=source["timestamp"],
                    agent=source["agent"],
                    rule=source["rule"],
                    full_log=source.get("full_log", ""),
                    location=source.get("location"),
                    decoder=source.get("decoder"),
                    data=source.get("data")
                )
                alerts.append(alert)

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
            # Calcular fechas para la última semana
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