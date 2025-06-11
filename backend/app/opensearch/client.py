from opensearchpy import OpenSearch, RequestsHttpConnection
from app.core.config import settings
from typing import Optional
import ssl

class OpenSearchClient:
    _instance: Optional['OpenSearchClient'] = None
    _client: Optional[OpenSearch] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OpenSearchClient, cls).__new__(cls)
            cls._instance._initialize_client()
        return cls._instance

    def _initialize_client(self):
        """Inicializa el cliente de OpenSearch con la configuración del .env"""
        ssl_context = ssl.create_default_context()
        if not settings.OPENSEARCH_VERIFY_CERTS:
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE

        self._client = OpenSearch(
            hosts=[{
                'host': settings.OPENSEARCH_HOST,
                'port': settings.OPENSEARCH_PORT
            }],
            http_auth=(settings.OPENSEARCH_USER, settings.OPENSEARCH_PASSWORD),
            use_ssl=settings.OPENSEARCH_USE_SSL,
            verify_certs=settings.OPENSEARCH_VERIFY_CERTS,
            ssl_context=ssl_context,
            connection_class=RequestsHttpConnection
        )

    @property
    def client(self) -> OpenSearch:
        """Retorna la instancia del cliente de OpenSearch"""
        if self._client is None:
            self._initialize_client()
        return self._client

    def check_connection(self) -> bool:
        """Verifica la conexión con OpenSearch"""
        try:
            return self.client.ping()
        except Exception:
            return False

    def get_cluster_info(self) -> dict:
        """Obtiene información del cluster de OpenSearch"""
        try:
            return self.client.info()
        except Exception as e:
            raise Exception(f"Error al obtener información del cluster: {str(e)}")

# Instancia global del cliente
opensearch_client = OpenSearchClient() 