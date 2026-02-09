# 🚀 agendar-rimac-api

Este proyecto implementa una arquitectura **Serverless orientada a eventos** para el agendamiento de citas de seguros en múltiples regiones (Perú y Chile). Utiliza un flujo desacoplado para garantizar alta disponibilidad y resiliencia.



## 🏗️ Arquitectura del Sistema

El flujo de datos está diseñado bajo el patrón de **Fan-out** con filtrado de mensajes:

1.  **API Gateway (HTTP API)**: Punto de entrada para las peticiones REST.
2.  **Lambda Producer (consultarDynamo)**: 
    * Persiste la auditoría y el registro inicial en **DynamoDB**.
    * Publica un mensaje en **SNS** inyectando atributos de filtrado (`countryISO`).
3.  **SNS Topic**: Actúa como bus de eventos, distribuyendo el mensaje según el país.
4.  **SQS Queues (Regional)**: Colas de mensajería que aseguran que ningún registro se pierda si la base de datos final está saturada o caída.
5.  **Lambda Workers (Regional)**: Procesan los mensajes de sus respectivas colas e insertan la información en **PostgreSQL**.

---

## 🛠️ Requisitos Previos

* **Node.js**: v20.x o superior.
* **Serverless Framework**: v4 (Soporte nativo para TypeScript y ESBuild).
* **AWS CLI**: Configurado con credenciales de acceso (accessKey y SecretKey).
* **Bases de Datos**: Instancias de PostgreSQL (PE y CL) accesibles desde la red de la Lambda.

---

## 📥 Instalación y Setup

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/BenyaOps/agendar-rimac-api.git
   cd agendar-rimac-api

---

## Flujo textual

- Al hacer deploy, se genera un API Gateway, con dos servicios (consultar y registrar)
- Estos servicios estan dentro de un lambda function.
- Al disparar el lambda, hace un insert o consulta datos a la tabla de un DynamoDB.
- Al disparar el lambda, se comunica con el servicio SNS
- El servicio SNS, recibe dentro de sus paranetros el valor **countryISO**, dependiendo si es "pe" o "cl", se comunica con el serviciio sqs (sqs_pe o sqs_cl).
- Cada sqs esta conectado aun lambda function para el appointment (appointment_pe o appointment_cl).
- Cada lambda appointment se comunica con una base de datos RDS (por efectos de la prueba tecnica se comunica a una sola base de datos).

---

## 📑 API Endpoints

### 1. Registrar Cita (POST)

Crea una cita, la guarda en DynamoDB con estado pending y dispara el proceso regional.

- URL: /registrar

- Payload:

```json
{
  "insuredId": "INS-163",
  "scheduleId": 63,
  "countryISO": "pe",
  "userId": "rimac_user63",
  "nombre": "testnombre63"
}
```

### 2. Consultar Asegurado (GET)

Consulta registros históricos desde la tabla de auditoría en DynamoDB.

- URL: /consultar/{insuredId}

---

## 🧪 Pruebas de Integración

### Test de Registro:

```bash
curl -X POST https://m2i02b459j.execute-api.us-east-1.amazonaws.com/registrar \
     -H "Content-Type: application/json" \
     -d '{"insuredId": "INS-001", "scheduleId": 1, "countryISO": "pe", "userId":"user_01", "nombre": "Brais"}'
```
---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| --- | --- |
| **Lenguaje** | TypeScript |
| **Framework** | Serverless Framework v4 |
| **Bundler** | ESBuild (Nativo) |
| **NoSQL** | Amazon DynamoDB |
| **Messaging** | Amazon SNS & SQS |
| **Relational DB** | Mysql - PostgreSQL |

**nota:** Para lograr el insert a la base de datos relacional, se uso postgresql, sin embargo, dentro de la arquitectura, tambien incluye integracion con MySQL.

--- 

## 🛡️ IAM & Seguridad

El proyecto utiliza el principio de Privilegio Mínimo. Los permisos están limitados a las acciones dynamodb:PutItem, dynamodb:Query y sns:Publish sobre los recursos específicos del stack.

---

## Perspectiva Personal

La prueba técnica ha incluido múltiples servicios de AWS y tecnologías serverless, lo cual es muy impactante y entretenido poder integrar para lograr, en base al Well Architected Framework, alta disponibilidad, reducción de costos y optimización operativa.