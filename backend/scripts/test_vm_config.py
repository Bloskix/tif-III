import requests
from requests.auth import HTTPBasicAuth
import json

# Configuración de conexión
OPENSEARCH_URL = "https://localhost:9200"
INDEX = "wazuh-alerts-*"
USER = "admin"
PASSWORD = "43131797Coello."

# Consulta simple: las últimas 5 alertas
query = {
    "size": 5,
    "sort": [
        {"@timestamp": {"order": "desc"}}
    ],
    "query": {
        "match_all": {}
    }
}

# Realizar la solicitud
response = requests.get(
    f"{OPENSEARCH_URL}/{INDEX}/_search",
    auth=HTTPBasicAuth(USER, PASSWORD),
    headers={"Content-Type": "application/json"},
    json=query,
    verify=False  #Desactiva verificación SSL solo si usás certs autofirmados
)

# Mostrar resultados
if response.status_code == 200:
    result = response.json()
    print("✅ Conexión exitosa. Últimas alertas:")
    for hit in result["hits"]["hits"]:
        source = hit["_source"]
        print(f"- [{source.get('@timestamp')}] Agent: {source.get('agent', {}).get('name')} | Rule: {source.get('rule', {}).get('description')}")
else:
    print("❌ Error al consultar OpenSearch:", response.status_code, response.text)
