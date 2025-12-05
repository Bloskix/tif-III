import sys
import os
import random
from datetime import datetime, timedelta
import uuid

# Agregar el directorio raíz al path para poder importar app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.opensearch.client import opensearch_client

def populate_alerts(num_alerts=50):
    print(f"Generando {num_alerts} alertas de prueba...")
    
    # Datos de prueba
    agents = [
        {"id": "001", "name": "ubuntu-server", "ip": "192.168.1.10"},
        {"id": "002", "name": "windows-db", "ip": "192.168.1.20"},
        {"id": "003", "name": "nginx-proxy", "ip": "192.168.1.30"}
    ]
    
    rules = [
        {"id": "5710", "level": 5, "description": "SSHD: Attempt to login using a non-existent user", "groups": ["syslog", "sshd", "authentication_failed"]},
        {"id": "5716", "level": 5, "description": "SSHD: Authentication failed", "groups": ["syslog", "sshd", "authentication_failed"]},
        {"id": "1002", "level": 2, "description": "Unknown problem somewhere in the system.", "groups": ["syslog", "errors"]},
        {"id": "31101", "level": 7, "description": "Web server 400 error code.", "groups": ["web", "accesslog"]},
        {"id": "550", "level": 7, "description": "Integrity checksum changed.", "groups": ["ossec", "syscheck"]},
    ]

    # Cliente de OpenSearch
    client = opensearch_client.client
    
    # Nombre del índice (usamos la fecha de hoy)
    today = datetime.now()
    index_name = f"wazuh-alerts-{today.strftime('%Y.%m.%d')}"

    count = 0
    for _ in range(num_alerts):
        # Seleccionar datos aleatorios
        agent = random.choice(agents)
        rule = random.choice(rules)
        
        # Generar timestamp aleatorio en los últimos 7 días
        days_ago = random.randint(0, 7)
        seconds_ago = random.randint(0, 86400)
        timestamp = today - timedelta(days=days_ago, seconds=seconds_ago)
        
        # Estructura del documento (imitando a Wazuh)
        alert_doc = {
            "agent": {
                "id": agent["id"],
                "name": agent["name"],
                "ip": agent["ip"]
            },
            "rule": {
                "id": rule["id"],
                "level": rule["level"],
                "description": rule["description"],
                "groups": rule["groups"],
                "firedtimes": random.randint(1, 10),
                "mail": False,
                "pci_dss": ["10.2.4", "10.2.5"]
            },
            "full_log": f"Fake log entry generated for testing rule {rule['id']}",
            "decoder": {
                "name": "test-decoder"
            },
            "location": "/var/log/auth.log",
            "id": str(uuid.uuid4()),
            "timestamp": timestamp.isoformat(),
            "@timestamp": timestamp.isoformat()
        }

        try:
            client.index(index=index_name, body=alert_doc)
            count += 1
            if count % 10 == 0:
                print(f"Insertadas {count} alertas...")
        except Exception as e:
            print(f"Error insertando alerta: {e}")

    print(f"¡Listo! Se insertaron {count} alertas en el índice '{index_name}'")

if __name__ == "__main__":
    # Puedes pasar el número de alertas como argumento
    num = 50
    if len(sys.argv) > 1:
        try:
            num = int(sys.argv[1])
        except ValueError:
            pass
    
    populate_alerts(num)
