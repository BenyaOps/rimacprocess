# 🛠️ Guía de Ejecución: TypeScript + Clean Architecture

## 1️⃣ Antes de Empezar

### Verificar que tengas Node.js instalado
```bash
node --version
npm --version
```

Deberías ver versiones de Node 18+ y npm 9+.

---

## 2️⃣ Instalar Dependencias

```bash
npm install
```

**¿Qué instala?**
```
- @aws-sdk/client-dynamodb
- @aws-sdk/client-sns
- @aws-sdk/lib-dynamodb
- pg                           (PostgreSQL driver)
- typescript                   (Compilador)
- @types/node                  (Tipos de Node.js)
- @types/pg                    (Tipos de PostgreSQL)
```

---

## 3️⃣ Compilar TypeScript

```bash
npm run build
```

**¿Qué pasa?**
```
TypeScript Compiler (tsc)
    ↓
Lee: src/**/*.ts
     handlers/**/*.ts
    ↓
Compila a: dist/**/*.js
    ↓
Crea: dist/
├── handlers/
│   ├── http.js
│   └── sqs.js
├── src/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── interfaces/
│   ├── shared/
│   └── di/
```

**Verifica que no haya errores.** Si ves:
```
error TS2307: Cannot find module '@aws-sdk/client-dynamodb'
```

Significa que npm install no terminó bien. Intenta:
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 4️⃣ Verificar Tipos (Opcional)

```bash
npm run lint
```

Esto ejecuta: `tsc --noEmit`

**¿Qué hace?**
- Compila TypeScript
- Verifica que TODO esté tipado
- NO genera archivos .js
- Útil para verificar errores sin sobrescribir dist/

Si ves errores:
```
error TS2322: Type 'unknown' is not assignable to type 'string'
```

Significa que hay un error de tipo. Corrígelo en el archivo .ts

---

## 5️⃣ Actualizar serverless.yml

### IMPORTANTE: Sin esto NO funcionará el deploy

**Busca esto en serverless.yml:**
```yaml
functions:
  consultarDynamo:
    handler: handler_new.consultarDynamo

  appointment_pe:
    handler: workers_new.appointment_pe

  appointment_cl:
    handler: workers_new.appointment_cl
```

**Cambia a esto:**
```yaml
functions:
  consultarDynamo:
    handler: dist/handlers/http.consultarDynamo

  appointment_pe:
    handler: dist/handlers/sqs.appointment_pe

  appointment_cl:
    handler: dist/handlers/sqs.appointment_cl
```

**¿Por qué?**
- `dist/` = carpeta donde está el JS compilado
- `handlers/` = subcarpeta dentro de dist
- `http` / `sqs` = nombre del archivo (sin .js)
- `.consultarDynamo` = nombre de la función exportada

---

## 6️⃣ Verificar Variables de Entorno

En `serverless.yml`, busca esta sección:
```yaml
environment:
  TOPIC_ARN: !Ref TopicCentral
  TABLE_NAME: RimacTable
  DB_HOST: "ep-spring-hat..."
  DB_NAME: "neondb"
  DB_USER: "neondb_owner"
  DB_PASS: "npg_..."
```

**Verifica que estén correctas o agrégalas si faltan.**

---

## 7️⃣ Desplegar a AWS

```bash
npm run deploy
```

**¿Qué pasa?**
```
npm run build       (Compila TypeScript)
    ↓
serverless deploy   (Despliega a AWS)
    ↓
Sube archivos de dist/
    ↓
Lambda comienza a procesar requests
```

**Esperado: Verás algo como:**
```
Deploying servicio-rimac to stage dev (us-east-1)

✔ Service deployed to Stack flujo-ApDbSnsSqs6-rimac-dev
✔ Functions:
    consultarDynamo: flujo-ApDbSnsSqs6-rimac-dev-consultarDynamo
    appointment_pe: flujo-ApDbSnsSqs6-rimac-dev-appointment_pe
    appointment_cl: flujo-ApDbSnsSqs6-rimac-dev-appointment_cl
```

---

## 🧪 Testear que Funciona

### Test 1: Verificar compilación sin errores
```bash
npm run build
```

Si ves algo rojo, hay un error. Corrígelo.

### Test 2: Verificar tipos TypeScript
```bash
npm run lint
```

Si no ves "error", está bien.

### Test 3: Desplegar a AWS
```bash
npm run deploy
```

Si ves ✔, está desplegado.

### Test 4: Hacer request HTTP (POST)

```bash
curl -X POST https://TU_URL_AWS.execute-api.us-east-1.amazonaws.com/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "nombre": "Juan Pérez",
    "countryISO": "PE"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Cita registrada exitosamente",
  "data": {
    "userId": "user123",
    "nombre": "Juan Pérez",
    "countryISO": "PE",
    "status": "pending",
    "timestamp": "2024-02-09T10:30:00.000Z",
    "createdAt": "2024-02-09T10:30:00.000Z"
  }
}
```

### Test 5: Hacer request HTTP (GET)

```bash
curl -X GET https://TU_URL_AWS.execute-api.us-east-1.amazonaws.com/consultar/user123
```

**Respuesta esperada:**
```json
{
  "message": "Se encontraron 1 citas",
  "data": [
    {
      "userId": "user123",
      "nombre": "Juan Pérez",
      "countryISO": "PE",
      "status": "pending",
      "timestamp": "2024-02-09T10:30:00.000Z",
      "createdAt": "2024-02-09T10:30:00.000Z"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### ❌ Error: `Cannot find module`

```
Error: Cannot find module 'pg'
```

**Solución:**
```bash
npm install
npm run build
```

### ❌ Error: `Incorrect handler configuration`

```
The handler for the code was not found.
```

**Causa:** Errores en serverless.yml

**Solución:** Verifica:
1. ¿`dist/handlers/http.ts` existe?
2. ¿`dist/handlers/sqs.ts` existe?
3. ¿`serverless.yml` apunta a `dist/handlers/`?
4. ¿Compilaste con `npm run build`?

### ❌ Error TypeScript: `Type 'X' is not assignable to type 'Y'`

**Causa:** Tipo incorrecto

**Solución:**
1. Lee el archivo en cuestión
2. Busca la línea del error
3. Asegúrate que el tipo sea correcto

Ejemplo:
```typescript
// ❌ Error
const id: number = "123";

// ✅ Correcto
const id: string = "123";
```

### ❌ AWS Lambda timeout

**Causa:** Posiblemente el código tarda mucho

**Solución:**
1. Verifica que DB_HOST/credentials sean correctas
2. Intenta aumentar timeout en serverless.yml:
```yaml
environment:
  timeout: 30  # segundos
```

### ❌ DynamoDB error: `ResourceNotFoundException`

```
ResourceNotFoundException: Requested resource not found
```

**Causa:** Tabla no existe

**Solución:**
1. Verifica `TABLE_NAME` en variables de entorno
2. Verifica que la tabla exista en AWS Console

---

## 📝 Verificar Deployment Exitoso

Una vez desplegado, verifica en AWS Console:

1. **CloudFormation Stack**
   - Nombre: `flujo-ApDbSnsSqs6-rimac-XXX`
   - Status: `CREATE_COMPLETE` verdes

2. **Lambda Functions**
   - `flujo-ApDbSnsSqs6-rimac-XXX-consultarDynamo` ✓
   - `flujo-ApDbSnsSqs6-rimac-XXX-appointment_pe` ✓
   - `flujo-ApDbSnsSqs6-rimac-XXX-appointment_cl` ✓

3. **API Gateway**
   - Rutas `POST /registrar`
   - Rutas `GET /consultar/{userId}`

4. **CloudWatch Logs**
   - Ver logs cuando llamen las funciones
   - Buscar errores

---

## 🔄 Workflow de Desarrollo

Si necesitas hacer cambios:

```bash
# 1. Hacer cambios en src/*.ts
# 2. Compilar
npm run build

# 3. Verificar tipos (opcional)
npm run lint

# 4. Desplegar
npm run deploy

# 5. Testear
curl ...
```

O usa watch mode:
```bash
npm run dev
# Recompila automáticamente cuando cambias un archivo
```

---

## 📊 Resumen de Comandos

| Comando | Qué hace |
|---------|----------|
| `npm install` | Instala todas las dependencias |
| `npm run build` | Compila TypeScript → JavaScript |
| `npm run dev` | Watch mode: recompila al guardar |
| `npm run lint` | Verifica tipos sin compilar |
| `npm run deploy` | Compila + Despliega a AWS |

---

## ✅ Checklist Final

Antes de considerarlo "listo":

- [ ] `npm install` sin errores
- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin errores
- [ ] `serverless.yml` actualizado a `dist/handlers/`
- [ ] Variables de entorno correctas
- [ ] `npm run deploy` exitoso
- [ ] Prueba POST /registrar en AWS
- [ ] Prueba GET /consultar/{userId} en AWS
- [ ] Logs en CloudWatch sin errores
- [ ] SQS recibe mensajes de SNS

Si todo ✅, **¡Tu sistema está en TypeScript!** 🎉

---

## 📚 Documentación

- [TYPESCRIPT_MIGRATION.md](./TYPESCRIPT_MIGRATION.md) - Detalles de conversión
- [README_TYPESCRIPT.md](./README_TYPESCRIPT.md) - Resumen de cambios
- [CLEAN_ARCHITECTURE.md](./CLEAN_ARCHITECTURE.md) - Arquitectura

