import sys
import os
import random
from datetime import datetime, timedelta
import uuid

# Agregar el directorio raíz al path para poder importar app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.opensearch.client import opensearch_client

def populate_critical_alerts(num_alerts=10):
    print(f"Generando {num_alerts} ALERTAS CRÍTICAS de prueba...")
    
    # Datos de prueba
    agents = [
        {"id": "001", "name": "ubuntu-server", "ip": "192.168.1.10"},
        {"id": "002", "name": "windows-db", "ip": "192.168.1.20"},
        {"id": "003", "name": "nginx-proxy", "ip": "192.168.1.30"}
    ]
    
    # Solo reglas de nivel >= 10
    critical_rules = [
        {"id": "5720", "level": 10, "description": "SSHD: Multiple authentication failures", "groups": ["syslog", "sshd", "authentication_failures"]},
        {"id": "554", "level": 10, "description": "File added to the system.", "groups": ["ossec", "syscheck"]},
        {"id": "5763", "level": 12, "description": "SSHD: Brute force attack detected.", "groups": ["syslog", "sshd", "authentication_failures"]},
        {"id": "9221", "level": 11, "description": "User account added to the system", "groups": ["syslog", "account_management"]},
        {"id": "80790", "level": 13, "description": "Audit: High severity audit event", "groups": ["audit", "high_severity"]}
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
        rule = random.choice(critical_rules)
        
        # Generar timestamp MUY RECIENTE (últimas 24 horas) para que sean más visibles
        hours_ago = random.randint(0, 24)
        minutes_ago = random.randint(0, 60)
        timestamp = today - timedelta(hours=hours_ago, minutes=minutes_ago)
        
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
                "firedtimes": random.randint(5, 50), # Más ocurrencias para parecer más crítico
                "mail": True, # Las críticas suelen enviar mail
                "pci_dss": ["10.2.4", "10.2.5", "11.4"]
            },
            "full_log": f"CRITICAL SECURITY EVENT: {rule['description']} detected on {agent['name']}",
            "decoder": {
                "name": "test-decoder-critical"
            },
            "location": "/var/log/secure",
            "id": str(uuid.uuid4()),
            "timestamp": timestamp.isoformat(),
            "@timestamp": timestamp.isoformat()
        }

        try:
            client.index(index=index_name, body=alert_doc)
            count += 1
            print(f" [CRITICAL] Insertada alerta {rule['id']} (Nivel {rule['level']})")
        except Exception as e:
            print(f"Error insertando alerta crítica: {e}")

    print(f"¡Listo! Se insertaron {count} ALERTAS CRÍTICAS en el índice '{index_name}'")

if __name__ == "__main__":
    # Puedes pasar el número de alertas como argumento
    num = 10
    if len(sys.argv) > 1:
        try:
            num = int(sys.argv[1])
        except ValueError:
            pass
    
    populate_critical_alerts(num)
