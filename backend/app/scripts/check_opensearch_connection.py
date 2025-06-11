from app.opensearch.client import opensearch_client

def check_opensearch_connection():
    is_connected = opensearch_client.check_connection()
    if is_connected:
        print("INFO:     Conexión exitosa a OpenSearch.")
        try:
            cluster_info = opensearch_client.get_cluster_info()
            print("INFO:     Información del cluster:", cluster_info)
        except Exception as e:
            print("ERROR:    No se pudo obtener información del cluster:", e)
    else:
        print("ERROR:    No se pudo conectar a OpenSearch.")
