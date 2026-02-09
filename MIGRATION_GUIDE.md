# 🔄 Guía de Migración a Clean Architecture

## Checklist de Migración

### 1. Preparación
- [ ] Backup del código actual (los archivos antiguos siguen existiendo)
- [ ] Revisar `CLEAN_ARCHITECTURE.md` para entender la estructura
- [ ] Instalar dependencias nuevas: `npm install`

### 2. Actualizar `serverless.yml`

**ANTES:**
```yaml
functions:
  consultarDynamo:
    handler: handler.consultarDynamo
    
  appointment_pe:
    handler: workers.appointment_pe
    
  appointment_cl:
    handler: workers.appointment_cl
```

**DESPUÉS:**
```yaml
functions:
  consultarDynamo:
    handler: handler_new.consultarDynamo    # ← Cambiar a handler_new
    
  appointment_pe:
    handler: workers_new.appointment_pe      # ← Cambiar a workers_new
    
  appointment_cl:
    handler: workers_new.appointment_cl      # ← Cambiar a workers_new
```

### 3. Cambiar en `package.json`

Asegurar que `main` apunte al nuevo handler:
```json
{
  "main": "handler_new.mjs"
}
```

### 4. Verificar Variables de Entorno

No se necesita cambiar nada, pero verificar que sigan siendo:
```bash
TABLE_NAME=RimacTable
TOPIC_ARN=arn:aws:sns:us-east-1:851725266862:...
DB_HOST=ep-spring-hat-ajpgkw66-pooler.c-3.us-east-2.aws.neon.tech
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASS=npg_5MpucoayHAF8
```

### 5. Desplegar

```bash
npm install
serverless deploy --stage prod
```

## 🧪 Testear la Nueva Arquitectura

### Test Local - Crear Cita (POST)

```bash
curl -X POST http://localhost:3000/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "nombre": "Juan Pérez",
    "countryISO": "PE",
    "insuredId": "aseg456",
    "scheduleId": "sched789"
  }'
```

**Respuesta Esperada:**
```json
{
  "message": "Cita registrada exitosamente",
  "data": {
    "userId": "user123",
    "nombre": "Juan Pérez",
    "countryISO": "PE",
    "insuredId": "aseg456",
    "scheduleId": "sched789",
    "timestamp": "2024-02-08T10:30:00.000Z",
    "status": "pending",
    "createdAt": "2024-02-08T10:30:00.000Z"
  }
}
```

### Test Local - Consultar Citas (GET)

```bash
curl -X GET http://localhost:3000/consultar/user123
```

**Respuesta Esperada:**
```json
{
  "total": 1,
  "items": [
    {
      "userId": "user123",
      "nombre": "Juan Pérez",
      "countryISO": "PE",
      "timestamp": "2024-02-08T10:30:00.000Z",
      "status": "pending",
      "createdAt": "2024-02-08T10:30:00.000Z"
    }
  ]
}
```

## 🐛 Troubleshooting

### Error: "Cannot find module '@aws-sdk/client-dynamodb'"

**Solución**: Instalar dependencias
```bash
npm install
```

### Error: "Servicio X no registrado"

**Causa**: El contenedor DI no reconoce un servicio
**Solución**: Verificar que esté registrado en `src/di/container.js`

### No funciona la conexión a Postgres

**Verificar**:
1. Credenciales en variables de entorno
2. La BD está ejecutándose
3. Firewall permite la conexión

### SNS no publica mensajes

**Verificar**:
1. IAM permissions están configuradas en `serverless.yml`
2. El Topic ARN es correcto
3. Credenciales AWS están disponibles

## 📊 Comparación: Antes vs Después

### ANTES (handler.mjs monoíltico)
```javascript
export const consultarDynamo = async (event) => {
    const metodo = event.requestContext.http.method;
    try {
        if (metodo === 'POST') {
            const body = JSON.parse(event.body);
            const { countryISO, userId, nombre, ... } = body;
            
            // TODO directamente en el handler
            await docClient.send(new PutCommand({...}));
            await snsClient.send(new PublishCommand({...}));
            
            return { ... };
        }
        // ... más lógica acá
    } catch (error) {
        return { ... };
    }
};
```

**Problemas**:
- Lógica mezclada (HTTP + Negocio + BD)
- Difícil testear
- Difícil de mantener
- Acoplado a AWS SDK

### DESPUÉS (Clean Architecture)
```javascript
export const consultarDynamo = async (event) => {
    const container = createContainer();
    const controller = container.get('httpController');
    return await controller.registerAppointment(event);
};
```

**Beneficios**:
- Separación de responsabilidades
- Fácil testear
- Fácil mantener
- Desacoplado

## 🚀 Próximas Mejoras

1. **Tests Automatizados**
   ```bash
   npm test
   ```

2. **Logging Centralizado**
   - Logger como dependencia inyectada
   - CloudWatch integration

3. **Validación Robusta**
   - Usar Joi o Zod para DTOs
   - Mensajes de error claros

4. **Error Handling**
   - Custom exceptions
   - Error codes estandarizados

5. **Documentación OpenAPI**
   - Swagger/OpenAPI specs
   - Auto-generada del código

## ❓ Preguntas Frecuentes

**¿Puedo mantener el código antiguo?**
Sí, los archivos `handler.mjs`, `workers.mjs`, `handler_cl.mjs`, `handler_pe.mjs` siguen ahí para referencia.

**¿Necesito actualizar la BD?**
No, la estructura de BDs sigue igual.

**¿Cambió el parsing de eventos?**
No, los eventos de AWS sigue siendo igual, solo están mejor organizados.

**¿Es más lento?**
No, el rendimiento es similar o mejor por uso de singletons en DI.

**¿Puedo tener dos versiones corriendo?**
Sí, pero se recomienda migrar completamente para evitar confusión.
