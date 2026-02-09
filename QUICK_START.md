# ⚡ Quick Start - Lo Mínimo Necesario

## 🚀 5 Minutos para Empezar

### Paso 1: Instalar (30 segundos)
```bash
cd /Users/benjaminponce/Documents/aws_retos/servicio_rimac
npm install
```

✅ **Hecho.** Espera a que termine.

---

### Paso 2: Compilar TypeScript (20 segundos)
```bash
npm run build
```

✅ **Hecho.** Generó carpeta `dist/`.

---

### Paso 3: Verificar Tipos (10 segundos)
```bash
npm run lint
```

✅ **Hecho.** Si no ves "error", está todo bien.

---

### Paso 4: Leer el Plan (2 minutos)

Abre uno de estos archivos:

1. **Para entender qué cambió:**
   - `TYPESCRIPT_MIGRATION.md` (migración línea a línea)
   - `README_TYPESCRIPT.md` (resumen)

2. **Para entender la arquitectura:**
   - `CLEAN_ARCHITECTURE.md` (explicación capas)
   - `ARCHITECTURE_DIAGRAM.md` (diagramas)

3. **Para desplegar:**
   - `DEPLOYMENT_GUIDE.md` (paso a paso)

---

### Paso 5: Desplegar a AWS (1 minuto)

**Primero:** Actualiza `serverless.yml`

Busca esto:
```yaml
functions:
  consultarDynamo:
    handler: handler_new.consultarDynamo
```

Cambia a:
```yaml
functions:
  consultarDynamo:
    handler: dist/handlers/http.consultarDynamo
```

**Luego:** Despliega
```bash
npm run deploy
```

✅ **Hecho.** AWS está actualizando tu lambda.

---

## 📚 La Ruta de Aprendizaje

### Nivel 1: Entender qué cambió (15 min)
```
1. Lee: TYPESCRIPT_MIGRATION.md
2. Mira: src/shared/types.ts
3. Mira: handlers/http.ts
```

### Nivel 2: Entender la arquitectura (30 min)
```
1. Lee: CLEAN_ARCHITECTURE.md
2. Mira: src/domain/entities/Appointment.ts
3. Mira: src/application/usecases/RegisterAppointmentUseCase.ts
4. Mira: src/infrastructure/dynamodb/DynamoDBRepository.ts
```

### Nivel 3: Hacer cambios (1 hora)
```
1. Abre src/domain/entities/Appointment.ts
2. Agrega una propiedad nueva
3. Compila: npm run build
4. TypeScript te muestra qué cambiar
5. Actualiza todo
6. Desplega: npm run deploy
```

---

## 🎯 Archivos Más Importantes

### Para Empezar
1. 📘 `TYPESCRIPT_MIGRATION.md` - Qué cambió
2. 📙 `README_TYPESCRIPT.md` - Resumen
3. 📕 `DEPLOYMENT_GUIDE.md` - Cómo desplegar

### Para Entender
1. 🎨 `CLEAN_ARCHITECTURE.md` - Arquitectura
2. 📊 `ARCHITECTURE_DIAGRAM.md` - Diagramas
3. 📖 `TYPESCRIPT_CHEATSHEET.md` - Referencia TypeScript

### Para Codificar
1. `src/shared/types.ts` - Todos los tipos
2. `src/di/container.ts` - Inyección de dependencias
3. `handlers/http.ts` - Entry point HTTP
4. `handlers/sqs.ts` - Entry point SQS

---

## 🧪 Test Rápido

### ¿Funciona la compilación?
```bash
npm run build
# Si ves "Successfully compiled..." -> ✅
```

### ¿Los tipos están bien?
```bash
npm run lint
# Si NO ves "error" -> ✅
```

### ¿Funciona el despliegue?
```bash
npm run deploy
# Si ves "✔ Service deployed..." -> ✅
```

### ¿Funciona en AWS?
```bash
curl -X POST https://TU_AWS_URL/registrar \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","nombre":"Test","countryISO":"PE"}'

# Si ves JSON con "message": "Cita registrada..." -> ✅
```

---

## 📖 Estructura Sistema Simplificada

```
Usuario hace POST /registrar
    ↓
handlers/http.ts (consultarDynamo)
    ↓
src/interfaces/http/HTTPController.ts
    ↓
src/application/usecases/RegisterAppointmentUseCase.ts
    ↓
src/infrastructure/dynamodb/DynamoDBRepository.ts
    ↓
AWS DynamoDB
    ↓
SNS (publica mensaje)
    ↓
SQS (para Perú o Chile)
    ↓
handlers/sqs.ts (appointment_pe o appointment_cl)
    ↓
src/interfaces/sqs/SQSHandler.ts
    ↓
src/application/usecases/ProcessAppointmentUseCase.ts
    ↓
src/infrastructure/postgres/PostgresRepository.ts
    ↓
PostgreSQL
```

Cada nivel está **separado** y **tipado** en TypeScript.

---

## 💡 Conceptos Clave en 60 Segundos

### Clean Architecture
- Cada carpeta en `src/` es una **capa**
- Las capas NO se conocen entre sí
- Todo se conecta a través del `container.ts`

### TypeScript
- Todos los archivos `.ts` se compilan a `.js`
- La compilación **verifica tipos ANTES de ejecutar**
- Los tipos viven en `src/shared/types.ts`

### Inyección de Dependencias
- El `container.ts` **crea** objetos
- Los handlers **piden** objetos al container
- No importa si es DynamoDB o MongoDB, el handler no cambia

---

## ❓ Preguntas Frecuentes Rápidas

**P: ¿Necesito cambiar algo más en serverless.yml?**
R: Solo los `handler` paths. Todo lo demás está igual.

**P: ¿Los archivos antiguos (.mjs) sirven?**
R: No, son solo para referencia. Ahora usa dist/.

**P: ¿Debo eliminar src/domain/entities/Appointment.js?**
R: No hace daño, pero no lo necesitas. TypeScript compila a dist/.

**P: ¿Qué pasa si hago cambios?**
R: Edita los .ts, luego `npm run build` y `npm run deploy`.

**P: ¿Puedo hacer cambios sin recompilar?**
R: No. TypeScript necesita compilarse a JavaScript.

**P: ¿Performance es igual?**
R: Sí. TypeScript = JavaScript compilado. Sin overhead.

---

## 🛠️ Comando Más Usado

```bash
npm run build      # Compila TypeScript → JavaScript
npm run dev        # Watch: recompila al guardar
npm run lint       # Verifica tipos sin compilar
npm run deploy     # Compila + Despliega a AWS
```

---

## 📅 Próximos Pasos

1. ✅ `npm install` - Instala dependencias
2. ✅ `npm run build` - Compila TypeScript
3. ✅ Actualizar `serverless.yml` handlers
4. ✅ `npm run deploy` - Desplega a AWS
5. ✅ Testear con curl

---

## 🎊 ¡Listo!

Tu proyecto ahora tiene:
- ✅ TypeScript (tipado fuerte)
- ✅ Clean Architecture (4 capas)
- ✅ Inyección de Dependencias (DI container)
- ✅ AWS Lambda Ready (compilado)

**Ahora lee la documentación y entiende cómo funciona.** 

👉 Empieza por: `TYPESCRIPT_MIGRATION.md`

---

**Versión:** 3.0.0
**Estado:** Production-Ready ✅
**Tiempo:** 5 minutos para empezar
