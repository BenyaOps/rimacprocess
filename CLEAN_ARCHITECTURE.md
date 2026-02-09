# Clean Architecture para Servicio RIMAC

## 📐 Estructura del Proyecto

```
src/
├── domain/                          # Capa de Dominio (Lógica de Negocio)
│   ├── entities/
│   │   └── Appointment.js            # Entidad de Cita
│   └── repositories/
│       ├── IAppointmentRepository.js  # Interfaz de Repositorio
│       └── IPublishRepository.js      # Interfaz de Publicación
│
├── application/                     # Capa de Aplicación (Casos de Uso)
│   ├── usecases/
│   │   ├── RegisterAppointmentUseCase.js    # Registrar cita
│   │   ├── ConsultAppointmentUseCase.js     # Consultar citas
│   │   └── ProcessAppointmentUseCase.js     # Procesar en BD regional
│   └── dtos/
│       └── AppointmentDTO.js         # Transfer Object
│
├── infrastructure/                  # Capa de Infraestructura
│   ├── dynamodb/
│   │   └── DynamoDBRepository.js     # Implementación DynamoDB
│   ├── postgres/
│   │   └── PostgresRepository.js     # Implementación PostgreSQL
│   ├── mysql/
│   │   └── MySQLRepository.js     # Implementación MySQL
│   ├── sns/
│   │   └── SNSPublisher.js           # Implementación SNS
│   └── config/
│       └── database.js               # Configuración de BDs
│
├── interfaces/                      # Capa de Adapters (Controladores)
│   ├── http/
│   │   └── HTTPController.js         # Controlador HTTP
│   └── sqs/
│       └── SQSHandler.js             # Manejador SQS
│
├── di/
│   └── container.js                  # Contenedor de Inyección de Dependencias
│
├── handler_new.mjs                   # Entry Point HTTP (reemplaza handler.mjs)
└── workers_new.mjs                   # Entry Point Workers (reemplaza workers.mjs)
```

## 🏗️ Capas de Clean Architecture

### 1. **Domain (Dominio)** 
- **Ubicación**: `src/domain/`
- **Responsabilidad**: Contiene la lógica de negocio central, independiente de tecnología
- **Incluye**: Entities e Interfaces de Repositorio
- **NO depende de**: Ninguna otra capa

### 2. **Application (Aplicación)**
- **Ubicación**: `src/application/`
- **Responsabilidad**: Orquestación de casos de uso
- **Incluye**: Use Cases y DTOs
- **Depende de**: Domain

### 3. **Infrastructure (Infraestructura)**
- **Ubicación**: `src/infrastructure/`
- **Responsabilidad**: Implementaciones concretas (BDs, APIs externas)
- **Incluye**: Repositorios implementados, configuraciones
- **Depende de**: Domain, Application

### 4. **Interfaces/Adapters**
- **Ubicación**: `src/interfaces/`
- **Responsabilidad**: Convertir solicitudes externas en casos de uso
- **Incluye**: Controladores HTTP, Handlers SQS
- **Depende de**: Application

## 🔄 Flujo de Datos

### POST /registrar (Crear Cita)
```
HTTP Request 
  → handler_new.mjs 
  → HTTPController.registerAppointment() 
  → RegisterAppointmentUseCase.execute()
  → DynamoDBRepository.save()
  → SNSPublisher.publish()
  → HTTP Response
```

### GET /consultar/{userId} (Consultar Citas)
```
HTTP Request
  → handler_new.mjs
  → HTTPController.consultAppointment()
  → ConsultAppointmentUseCase.execute()
  → DynamoDBRepository.findAll()
  → HTTP Response
```

### SQS Message Processing (Worker)
```
SQS Event
  → workers_new.mjs (appointment_pe/appointment_cl)
  → SQSHandler.handleSQSEvent()
  → ProcessAppointmentUseCase.execute()
  → PostgresRepository.save()
  → Success/Error
```

## 🔧 Inyección de Dependencias

El contenedor (`src/di/container.js`) gestiona todas las dependencias:

```javascript
import { createContainer } from './src/di/container.js';

const container = createContainer();
const controller = container.get('httpController');
const sqsHandler = container.get('sqsHandler');
```

**Ventajas**:
- Fácil de testear (mockear dependencias)
- Centralizado: un solo lugar para cambiar configuraciones
- Desacoplado: cambiar implementaciones sin afectar el resto

## 📝 Migración desde el Código Antiguo

### Paso 1: Actualizar `serverless.yml`

Cambiar los handlers:
```yaml
functions:
  consultarDynamo:
    handler: handler_new.consultarDynamo  # Cambiar de handler.consultarDynamo
    
  appointment_pe:
    handler: workers_new.appointment_pe   # Cambiar de workers.appointment_pe
    
  appointment_cl:
    handler: workers_new.appointment_cl   # Cambiar de workers.appointment_cl
```

### Paso 2: Instalar dependencias necesarias
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-sns pg
```

### Paso 3: Actualizar Variables de Entorno (si es necesario)
Las variables de entorno permanecen igual:
- `TABLE_NAME`
- `TOPIC_ARN`
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

## 🧪 Testing (Cómo testear)

Con Clean Architecture, testear es fácil porque las dependencias están inyectadas:

```javascript
// test/RegisterAppointmentUseCase.test.js
import { RegisterAppointmentUseCase } from '../src/application/usecases/RegisterAppointmentUseCase.js';

class MockDynamoDBRepository {
    async save(appointment) {
        return appointment.toPlainObject();
    }
}

class MockSNSPublisher {
    async publish(topic, message, attributes) {
        return { MessageId: 'test-123' };
    }
}

test('RegisterAppointmentUseCase debe guardar y publicar', async () => {
    const dynamoRepo = new MockDynamoDBRepository();
    const snsPublisher = new MockSNSPublisher();
    
    const useCase = new RegisterAppointmentUseCase(dynamoRepo, snsPublisher);
    
    const dto = new AppointmentDTO({
        userId: 'user123',
        nombre: 'Juan Pérez',
        countryISO: 'PE'
    });
    
    const result = await useCase.execute(dto, 'arn:aws:sns:...');
    expect(result.message).toBe('Cita registrada exitosamente');
});
```

## ✅ Ventajas de Clean Architecture

1. **Independencia de Frameworks**: El core del negocio no depende de AWS/Express/etc
2. **Testabilidad**: Fácil de testear cada capa de forma aislada
3. **Mantenibilidad**: Cambios en BD/API no afectan la lógica de negocio
4. **Escalabilidad**: Fácil agregar nuevos use cases y adapters
5. **Claridad**: Código más legible y organizado

## 🚀 Próximos Pasos

1. Reemplazar referencias en `serverless.yml`
2. Crear tests unitarios para cada use case
3. Agregar validaciones más robustas
4. Implementar logging centralizado
5. Crear documentação de API (OpenAPI/Swagger)
