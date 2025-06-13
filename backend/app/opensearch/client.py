from opensearchpy import OpenSearch, RequestsHttpConnection, OpenSearchException
from app.core.config import settings
from typing import Optional
import ssl
import logging
import requests
import json
from urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class OpenSearchClient:
    _instance: Optional['OpenSearchClient'] = None
    _client: Optional[OpenSearch] = None
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OpenSearchClient, cls).__new__(cls)
        return cls._instance

    def _initialize_client(self):
        """Inicializa el cliente de OpenSearch con la configuración del .env"""
        if self._initialized:
            return

        try:
            ssl_context = ssl.create_default_context(cafile=settings.OPENSEARCH_CA_CERTS)
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_REQUIRED
            
            if not settings.OPENSEARCH_VERIFY_CERTS:
                ssl_context.verify_mode = ssl.CERT_NONE

            self._client = OpenSearch(
                hosts=[{
                    'host': settings.OPENSEARCH_HOST,
                    'port': settings.OPENSEARCH_PORT
                }],
                http_auth=(settings.OPENSEARCH_USER, settings.OPENSEARCH_PASSWORD),
                use_ssl=settings.OPENSEARCH_USE_SSL,
                verify_certs=settings.OPENSEARCH_VERIFY_CERTS,
                ssl_assert_hostname=False,
                ssl_show_warn=False,
                ca_certs=settings.OPENSEARCH_CA_CERTS,
                connection_class=RequestsHttpConnection,
                timeout=30,
                ssl_context=ssl_context
            )
            self._initialized = True
            print("INFO:     Cliente OpenSearch inicializado")
        except Exception as e:
            print(f"ERROR:    Error al inicializar el cliente OpenSearch: {str(e)}")
            raise

    @property
    def client(self) -> OpenSearch:
        """Retorna la instancia del cliente de OpenSearch"""
        if not self._initialized:
            self._initialize_client()
        return self._client

    def check_connection(self) -> bool:
        """Verifica la conexión con OpenSearch"""
        if not self._initialized:
            self._initialize_client()

        try:
            protocol = "https" if settings.OPENSEARCH_USE_SSL else "http"
            url = f"{protocol}://{settings.OPENSEARCH_HOST}:{settings.OPENSEARCH_PORT}"
            
            session = requests.Session()
            if settings.OPENSEARCH_USE_SSL:
                if settings.OPENSEARCH_VERIFY_CERTS:
                    session.verify = settings.OPENSEARCH_CA_CERTS
                else:
                    session.verify = False
            
            response = session.get(
                url,
                auth=(settings.OPENSEARCH_USER, settings.OPENSEARCH_PASSWORD),
                timeout=30
            )
            
            try:
                result = self.client.ping()
                if result:
                    print("INFO:     Conexión exitosa a OpenSearch")
                    try:
                        info = self.client.info()
                        print(f"INFO:     Cluster: {info.get('cluster_name')} ({info.get('version', {}).get('distribution')} {info.get('version', {}).get('number')})")
                    except Exception:
                        pass
                return result
            except Exception as e:
                if isinstance(e, OpenSearchException) and "SSLError" in str(e) and response.status_code == 200:
                    return True
                return False
            
        except Exception:
            print("ERROR:    No se pudo establecer conexión con OpenSearch")
            return False

    def get_cluster_info(self) -> dict:
        """Obtiene información del cluster de OpenSearch"""
        if not self._initialized:
            self._initialize_client()
            
        try:
            return self.client.info()
        except Exception as e:
            raise Exception(f"Error al obtener información del cluster: {str(e)}")

# Instancia global del cliente
opensearch_client = OpenSearchClient() 