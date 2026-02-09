# 🏗️ Diagrama de Clean Architecture - Servicio RIMAC

## Estructura de Capas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRAMEWORKS & DRIVERS                               │
│                  (AWS Lambda, HTTP, SQS)                               │
│                                                                         │
│   handler_new.mjs  (HTTP Entry Point)    workers_new.mjs (SQS Entry)  │
└────────┬────────────────────────────────────────────────┬──────────────┘
         │                                                 │
         ▼                                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   INTERFACE ADAPTERS                                     │
│          (Controllers, Handlers, Presenters)                             │
│                                                                          │
│    ┌─────────────────┐                    ┌──────────────────┐          │
│    │ HTTPController  │                    │  SQSHandler      │          │
│    │                 │                    │                  │          │
│    │ • register()    │                    │ • handleEvent()  │          │
│    │ • consult()     │                    └──────────────────┘          │
│    └────────┬────────┘                                                  │
│             │                                           │                │
└─────────────┼───────────────────────────────────────────┼────────────────┘
              │                                           │
              ▼                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                                     │
│             (USE CASES / BUSINESS LOGIC)                                │
│                                                                          │
│    ┌──────────────────────────┐  ┌──────────────────────────┐           │
│    │  RegisterAppointment     │  │  ConsultAppointment      │           │
│    │  UseCase                 │  │  UseCase                 │           │
│    │                          │  │                          │           │
│    │ 1. Validate DTO          │  │ 1. Validate userId       │           │
│    │ 2. Create Entity         │  │ 2. Query Repository      │           │
│    │ 3. Save Repository       │  │ 3. Return Response       │           │
│    │ 4. Publish SNS           │  │                          │           │
│    └──────────────┬───────────┘  └────────────┬─────────────┘           │
│                   │                           │                         │
│    ┌──────────────┴───────────────────────────┴──────────────┐          │
│    │         ProcessAppointment UseCase                      │          │
│    │                                                         │          │
│    │  1. Validate appointment data                          │          │
│    │  2. Save to regional database (Postgres)               │          │
│    │  3. Return confirmation                                │          │
│    └────────────────┬────────────────────────────────────────┘          │
│                     │                                                   │
│    ┌────────────────────────────────────────┐                          │
│    │      DTOs (Data Transfer Objects)      │                          │
│    │  • AppointmentDTO                      │                          │
│    │  • Validation logic                    │                          │
│    └────────────────────────────────────────┘                          │
└────────┬────────────────────────────────────────┬───────────────────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                                        │
│                  (BUSINESS RULES)                                        │
│                                                                          │
│    ┌──────────────────┐         ┌───────────────────────────────┐       │
│    │  ENTITIES        │         │  REPOSITORY INTERFACES         │       │
│    │                  │         │                               │       │
│    │ Appointment      │         │ ┌─────────────────────────┐  │       │
│    │ • userId         │         │ │IAppointmentRepository   │  │       │
│    │ • nombre         │         │ │ • save()                │  │       │
│    │ • countryISO     │         │ │ • findAll()             │  │       │
│    │ • status         │         │ │ • findById()            │  │       │
│    │ • timestamp      │         │ │ • update()              │  │       │
│    │                  │         │ └─────────────────────────┘  │       │
│    │ Methods:         │         │                               │       │
│    │ • isValid()      │         │ ┌─────────────────────────┐  │       │
│    │ • toPlainObject()│         │ │IPublishRepository       │  │       │
│    └──────────────────┘         │ │ • publish()             │  │       │
│                                 │ └─────────────────────────┘  │       │
│    (NO DEPENDENCIES)            │                               │       │
│    (PURE BUSINESS LOGIC)         │  (PURE ABSTRACTIONS)         │       │
│                                 └───────────────────────────────┘       │
└────────┬────────────────────────────────────────┬───────────────────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                                   │
│           (IMPLEMENTATION DETAILS)                                       │
│                                                                          │
│    ┌─────────────────────────┐  ┌──────────────────────┐               │
│    │  DynamoDBRepository     │  │  PostgresRepository  │               │
│    │  (implements IAppointment)  │ (implements IAppointment)           │
│    │                         │  │                      │               │
│    │ • save()                │  │ • save()             │               │
│    │ • findAll()             │  │ • findAll()          │               │
│    │ • findById()            │  │ • findById()         │               │
│    │ • update()              │  │ • update()           │               │
│    └─────────────────────────┘  └──────────────────────┘               │
│                                                                         │
│    ┌──────────────────────────┐                                        │
│    │    SNSPublisher          │                                        │
│    │  (implements IPublisher) │                                        │
│    │                          │                                        │
│    │ • publish()              │                                        │
│    └──────────────────────────┘                                        │
│                                                                         │
│    ┌──────────────────────────┐                                        │
│    │   DatabaseConfig         │                                        │
│    │                          │                                        │
│    │ • createPostgresPool()   │                                        │
│    │ • getPostgresPool()      │                                        │
│    └──────────────────────────┘                                        │
└────────┬────────────────────────────────────────┬───────────────────────┘
         │                                        │
         ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                     │
│                                                                          │
│   AWS DynamoDB    AWS SNS      PostgreSQL Database     AWS SQS          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                 DEPENDENCY INJECTION CONTAINER                          │
│                    (src/di/container.js)                                │
│                                                                         │
│  Crea y gestiona todas las dependencias de forma centralizada          │
│                                                                         │
│  • Singletons (una instancia por aplicación)                          │
│  • Inyección automática de dependencias                               │
│  • Fácil de testear (moclear repositorios)                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Flujos de Datos

### 1️⃣ Flujo POST /registrar

```
HTTP Request
    │
    ├─ Path: POST /registrar
    ├─ Body: { userId, nombre, countryISO, ... }
    │
    ▼
handler_new.mjs
    │
    ├─ createContainer()
    ├─ get('httpController')
    │
    ▼
HTTPController.registerAppointment()
    │
    ├─ Parse body → AppointmentDTO
    │
    ▼
RegisterAppointmentUseCase.execute(dto, topicArn)
    │
    ├─ Validate DTO
    ├─ Create Appointment Entity
    ├─ Call dynamoDbRepository.save()
    │   │
    │   ▼
    │   DynamoDBRepository.save()
    │   - AWS DynamoDB PutCommand
    │
    ├─ Call snsPublisher.publish()
    │   │
    │   ▼
    │   SNSPublisher.publish()
    │   - AWS SNS PublishCommand
    │   - Attributes: { countryISO: 'pe'/'cl' }
    │
    ▼
HTTP Response 200
{
  "message": "Cita registrada exitosamente",
  "data": { ... }
}
```

### 2️⃣ Flujo GET /consultar/{userId}

```
HTTP Request
    │
    ├─ Path: GET /consultar/user123
    │
    ▼
handler_new.mjs
    │
    ├─ createContainer()
    ├─ get('httpController')
    │
    ▼
HTTPController.consultAppointment(event)
    │
    ├─ Extract userId from pathParameters
    │
    ▼
ConsultAppointmentUseCase.execute(userId)
    │
    ├─ Validate userId
    ├─ Call dynamoDbRepository.findAll(userId)
    │   │
    │   ▼
    │   DynamoDBRepository.findAll()
    │   - AWS DynamoDB QueryCommand
    │   - Filter: userId = :id
    │
    ▼
HTTP Response 200
{
  "total": 2,
  "items": [ ... ]
}
```

### 3️⃣ Flujo SQS (Workers)

```
SNS Topic
    │
    ├─ Message Attributes: { countryISO: "pe" }
    │
    ▼
SQS Subscription Filter
    │
    ├─ IF countryISO == "pe" → ColaPE
    ├─ IF countryISO == "cl" → ColaCL
    │
    ▼
CloudWatch Event Trigger
    │
    ├─ workers_new.appointment_pe()
    ├─ workers_new.appointment_cl()
    │
    ▼
createContainer()
    │
    ├─ get('sqsHandler')
    │
    ▼
SQSHandler.handleSQSEvent(event)
    │
    ├─ Loop Records
    │ ├─ Parse SNS Message from SQS Body
    │ ├─ Extract appointmentData
    │
    ▼
ProcessAppointmentUseCase.execute(appointmentData)
    │
    ├─ Validate data
    ├─ Call postgresRepository.save()
    │   │
    │   ▼
    │   PostgresRepository.save()
    │   - AWS Postgres INSERT query
    │   - INSERT INTO appointments (user_id, nombre, ...)
    │
    ▼
Lambda Response 200
{
  "message": "Cita procesada exitosamente",
  "data": { ... }
}
```

## Principios Aplicados

### 🎯 Dependency Inversion
```
Application Layer
    ↓ (depende)
Domain Layer (Interfaces)
    ↑ (implementa)
Infrastructure Layer
```

### 🎯 Single Responsibility
- **Appointment**: Solo conoce sus propias propiedades
- **RegisterUseCase**: Solo orquesta el caso de uso
- **HTTPController**: Solo convierte HTTP ↔ Use Cases
- **DynamoDBRepository**: Solo interactúa con DynamoDB

### 🎯 Open/Closed
```
RegisterUseCase no conoce si es DynamoDB o PostgreSQL
Porque depende de la interfaz IAppointmentRepository
Podemos cambiar implementaciones sin tocar el use case
```

### 🎯 Liskov Substitution
```
class DynamoDBRepository extends IAppointmentRepository { }
class PostgresRepository extends IAppointmentRepository { }

// Ambas pueden ser usadas intercambiablemente
```

### 🎯 Interface Segregation
```
IAppointmentRepository → findAll, save, update
IPublishRepository → publish

(No una mega-interfaz con todo)
```

## Testabilidad

```javascript
// Sin Clean Architecture (difícil de testear)
export const consultarDynamo = async (event) => {
    const docClient = new DynamoDBDocumentClient(...);  // ← Dependencia hardcodeada
    // ...
}

// Con Clean Architecture (fácil de testear)
export const consultarDynamo = async (event) => {
    const container = createContainer();
    const controller = container.get('httpController');  // ← Dependencia inyectada
    // ...
}

// En tests:
const mockRepository = new MockRepository();
const useCase = new RegisterAppointmentUseCase(mockRepository, mockPublisher);
// ✅ Podemos testear sin DynamoDB real
```

## Mantenibilidad

| Aspecto | Sin Clean Arch | Con Clean Arch |
|---------||---|
| Cambiar BD | Modificar handler | Cambiar DynamoDBRepository |
| Agregar validación | En handler | En AppointmentDTO o UseCase |
| Agregar logging | En varios lugares | En un lugar (Container) |
| Testear | Necesita AWS mock | Fácil con mocks locales |
| Entender flujo | Código spaghetti | Claro y predecible |
