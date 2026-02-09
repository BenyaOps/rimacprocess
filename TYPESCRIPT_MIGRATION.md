# 🎯 Migración a TypeScript - Guía Completa

## 📝 Cambios Realizados

### 1. Estructura General

**Antes (JavaScript):**
```
src/
├── domain/
│   ├── entities/
│   │   └── Appointment.js
│   └── repositories/
│       ├── IAppointmentRepository.js
│       └── IPublishRepository.js
├── ...otros folders...

handler.mjs
handler_new.mjs
workers.mjs
workers_new.mjs
```

**Ahora (TypeScript):**
```
src/
├── domain/
│   ├── entities/
│   │   └── Appointment.ts          ← Con tipos completos
│   └── repositories/
│       ├── IAppointmentRepository.ts
│       └── IPublishRepository.ts
├── shared/
│   └── types.ts                     ← ¡NUEVO! Todos los tipos centralizados
├── ...otros folders con .ts...

handlers/
├── http.ts
└── sqs.ts

tsconfig.json                         ← ¡NUEVO! Configuración TypeScript
```

### 2. Nueva Carpeta: `src/shared/types.ts`

Esta es la **más importante**. Centraliza TODOS los tipos del sistema:

```typescript
// ============================================================================
// TIPOS DE DOMINIO
// ============================================================================

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type CountryISO = 'PE' | 'CL' | string;

export interface IAppointment {
    userId: string;
    nombre: string;
    countryISO: CountryISO;
    insuredId?: string;
    scheduleId?: string;
    timestamp: string;
    status: AppointmentStatus;
    createdAt: string;
}

export interface ICreateAppointmentInput {
    userId: string;
    nombre: string;
    countryISO: CountryISO;
    insuredId?: string;
    scheduleId?: string;
}

// ... más tipos ...
```

**¿Por qué es importante?**
- Un solo lugar para cambiar tipos
- Otros archivos importan de aquí
- Evita duplicación

---

## 🔍 Cambios Línea por Línea en Archivos Principales

### Appointment Entity

**Antes (JavaScript):**
```javascript
export class Appointment {
    constructor(userId, nombre, countryISO, insuredId, scheduleId) {
        this.userId = userId;
        this.nombre = nombre;
        // ...
    }

    isValid() {
        return this.userId && this.nombre && this.countryISO;
    }

    toPlainObject() {
        return { ... };
    }
}
```

**Ahora (TypeScript):**
```typescript
import { IAppointment, AppointmentStatus, CountryISO, ValidationError } from '../../shared/types.js';

export class Appointment implements IAppointment {
    //                              ↑ Implementa la interfaz = contrato
    readonly userId: string;        // ← TODO es tipado
    readonly nombre: string;
    readonly countryISO: CountryISO;
    readonly status: AppointmentStatus;
    // ... etc ...

    constructor(
        userId: string,                    // ← Tipos en parámetros
        nombre: string,
        countryISO: CountryISO,
        insuredId?: string,               // ← Parámetro opcional
        scheduleId?: string
    ) {
        // ...
    }

    public validate(): boolean {           // ← Tipo de retorno explícito
        if (!this.userId || this.userId.trim().length === 0) {
            throw new ValidationError('userId es requerido y no puede estar vacío');
            //     ↑ Custom exception tipada
        }
        return true;
    }

    public toPlainObject(): IAppointment { // ← Retorna tipo específico
        return {
            userId: this.userId,
            nombre: this.nombre,
            // ...
        };
    }
}
```

**¿Qué ganaste?**
- ✅ El IDE te dice si pasas un `string` en lugar de `CountryISO`
- ✅ Errores de tipo se detectan EN COMPILE, no al ejecutar
- ✅ El método `validate()` es explícito que lanza `ValidationError`

---

### HTTPController

**Antes (JavaScript):**
```javascript
export class HTTPController {
    constructor(registerUseCase, consultUseCase) {
        this.registerUseCase = registerUseCase;
        this.consultUseCase = consultUseCase;
    }

    async registerAppointment(event) {
        try {
            const body = JSON.parse(event.body);
            const appointmentDTO = new AppointmentDTO(body);
            const result = await this.registerUseCase.execute(
                appointmentDTO,
                process.env.TOPIC_ARN
            );

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
}
```

**Ahora (TypeScript):**
```typescript
import { IHttpEvent, ILambdaResponse, ValidationError } from '../../shared/types.js';
import { HTTPController } from '../interfaces/http/HTTPController.js';

export class HTTPController {
    constructor(
        private readonly registerUseCase: RegisterAppointmentUseCase,
        //     ↑ private readonly = no se puede modificar desde afuera
        //     ↑ tipo explícito
        private readonly consultUseCase: ConsultAppointmentUseCase
    ) {}

    async registerAppointment(event: IHttpEvent): Promise<ILambdaResponse> {
        //                             ↑ Tema especial  ↑ Retorna esto
        try {
            let body: Record<string, unknown>;
            //   ↑ Tipo explícito
            
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Body inválido, no es JSON válido' })
                };
            }

            const appointmentDTO = new AppointmentDTO({
                userId: String(body.userId || ''),
                //     ↑ Forzar tipo string
                nombre: String(body.nombre || ''),
                countryISO: String(body.countryISO || ''),
                insuredId: body.insuredId ? String(body.insuredId) : undefined,
                //                                                  ↑ undefined is explicit
                scheduleId: body.scheduleId ? String(body.scheduleId) : undefined
            });

            const result = await this.registerUseCase.execute(
                appointmentDTO,
                process.env.TOPIC_ARN || ''
                //                    ↑ Manejar undefined
            );

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            //                 ↑ Verificar tipo de error
            console.error('Error en registerAppointment:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;
            //                ↑ Verificar si es tipo específico
            
            return {
                statusCode,
                body: JSON.stringify({ error: errorMessage })
            };
        }
    }

    async consultAppointment(event: IHttpEvent): Promise<ILambdaResponse> {
        // Similar ...
    }
}
```

**¿Qué ganaste?**
- ✅ Tipos de entrada y salida explícitos (`IHttpEvent`, `ILambdaResponse`)
- ✅ El IDE autocomplete te muestra qué propiedades tiene `event`
- ✅ Error handling tipado
- ✅ Atributos `private readonly` = no se pueden modificar

---

### DynamoDBRepository

**Antes (JavaScript):**
```javascript
export class DynamoDBRepository extends IAppointmentRepository {
    constructor(tableName) {
        super();
        this.tableName = tableName;
        this.docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    }

    async save(appointment) {
        try {
            await this.docClient.send(new PutCommand({
                TableName: this.tableName,
                Item: appointment.toPlainObject()
            }));
            return appointment.toPlainObject();
        } catch (error) {
            console.error('Error guardando en DynamoDB:', error);
            throw error;
        }
    }

    async findAll(userId) {
        // ...
    }
}
```

**Ahora (TypeScript):**
```typescript
import { DynamoDBClient, PutCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand as PutDocCommand } from '@aws-sdk/lib-dynamodb';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { Appointment } from '../../domain/entities/Appointment.js';
import { IAppointment, InfrastructureError } from '../../shared/types.js';

export class DynamoDBRepository implements IAppointmentRepository {
    //                           ↑ Implementar interfaz
    private readonly docClient: DynamoDBDocumentClient;
    //     ↑ private readonly  ↑ tipo específico

    constructor(private readonly tableName: string) {
        //     ↑ private readonly parámetro = auto-asigna a this.tableName
        this.docClient = DynamoDBDocumentClient.from(
            new DynamoDBClient({})
        );
    }

    async save(appointment: Appointment): Promise<IAppointment> {
        //                    ↑ tipo entrada    ↑ tipo salida
        try {
            const item = appointment.toPlainObject();
            
            await this.docClient.send(
                new PutDocCommand({
                    TableName: this.tableName,
                    Item: item
                })
            );

            return item;
        } catch (error) {
            throw new InfrastructureError(
                `Error guardando en DynamoDB: ${(error as Error).message}`
                //                            ↑ Type casting
            );
        }
    }

    async findAll(userId: string): Promise<IAppointment[]> {
        //                ↑ tipo         ↑ retorna array
        try {
            const result = await this.docClient.send(
                new QueryDocCommand({
                    TableName: this.tableName,
                    KeyConditionExpression: 'userId = :id',
                    ExpressionAttributeValues: {
                        ':id': userId
                    }
                })
            );

            return (result.Items as IAppointment[]) || [];
            //     ↑ Type casting a lo que esperamos
        } catch (error) {
            throw new InfrastructureError(
                `Error consultando DynamoDB: ${(error as Error).message}`
            );
        }
    }

    async findById(userId: string | number): Promise<IAppointment | null> {
        //              ↑ Acepta dos tipos    ↑ retorna null si no existe
        throw new InfrastructureError('Método no implementado');
    }

    async update(appointment: Appointment): Promise<IAppointment> {
        throw new InfrastructureError('Método no implementado');
    }
}
```

**¿Qué ganaste?**
- ✅ Parámetros tipados: `(userId: string)`
- ✅ Retornos tipados: `Promise<IAppointment[]>`
- ✅ Type casting seguro: `(result.Items as IAppointment[])`
- ✅ `private readonly` = no se puede modificar
- ✅ Custom exceptions tipadas

---

### Container (Inyección de Dependencias)

**Antes (JavaScript):**
```javascript
export class Container {
    constructor() {
        this.services = {};
        this.singletons = {};
    }

    registerSingleton(name, factory) {
        this.services[name] = factory;
    }

    get(name) {
        if (!this.services[name]) {
            throw new Error(`Servicio ${name} no registrado`);
        }
        if (!this.singletons[name]) {
            this.singletons[name] = this.services[name](this);
        }
        return this.singletons[name];
    }
}
```

**Ahora (TypeScript):**
```typescript
export class Container {
    private readonly services: Map<string, (container: Container) => unknown>;
    //     ↑ private readonly  ↑ Map tipado
    private readonly singletons: Map<string, unknown>;

    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }

    registerSingleton(
        name: string,
        factory: (container: Container) => unknown
        //              ↑ tipo de función
    ): void {  // ← no retorna nada
        this.services.set(name, factory);
    }

    get<T>(name: string): T {
        // ↑ Generic: retorna tipo T (que especificas cuando llamas)
        const factory = this.services.get(name);
        
        if (!factory) {
            throw new Error(`Servicio ${name} no registrado en el contenedor DI`);
        }

        let instance = this.singletons.get(name);
        
        if (!instance) {
            instance = factory(this);
            this.singletons.set(name, instance);
        }

        return instance as T;
        // ↑ Type casting al retornar
    }

    has(name: string): boolean {
        //           ↑ tipo retorno
        return this.services.has(name);
    }

    clear(): void {
        this.singletons.clear();
    }
}

// USO:
const dynamoRepo = container.get<DynamoDBRepository>('dynamoDbRepository');
//                                ↑ Especificar tipo esperado = TypeScript sabe qué devuelve
```

**¿Qué ganaste?**
- ✅ Generics: `get<T>()` - retorna lo que especificas
- ✅ `Map` tipado en lugar de objetos planos
- ✅ El IDE sabe qué tipo devuelve cada `get()` call
- ✅ Tipo de retorno explícito

---

## 🚀 Cómo Compilar y Ejecutar

### 1. Instalar dependencias
```bash
npm install
```

Esto instala:
- `@aws-sdk/*` - AWS SDK
- `typescript` - compilador TypeScript
- `@types/node` - tipos para Node.js
- `@types/pg` - tipos para PostgreSQL

### 2. Compilar TypeScript a JavaScript
```bash
npm run build
```

Esto ejecuta: `tsc` (TypeScript Compiler)

**¿Qué hace?**
```
src/domain/entities/Appointment.ts
  ↓ (compilar)
dist/src/domain/entities/Appointment.js

src/interfaces/http/HTTPController.ts
  ↓ (compilar)
dist/src/interfaces/http/HTTPController.js

handlers/http.ts
  ↓ (compilar)
dist/handlers/http.js    ← AWS Lambda lo ejecuta
```

### 3. Actualizar serverless.yml

**Antes:**
```yaml
functions:
  consultarDynamo:
    handler: handler_new.consultarDynamo

  appointment_pe:
    handler: workers_new.appointment_pe
```

**Ahora:**
```yaml
functions:
  consultarDynamo:
    handler: dist/handlers/http.consultarDynamo    # ← Carpeta dist

  appointment_pe:
    handler: dist/handlers/sqs.appointment_pe      # ← TypeScript compilado

  appointment_cl:
    handler: dist/handlers/sqs.appointment_cl
```

### 4. Desplegar
```bash
npm run deploy
```

Esto hace:
1. `npm run build` - compila TypeScript
2. `serverless deploy` - despliega a AWS

---

## 🐛 Ventajas de TypeScript

### 1. **Errores en Compile Time**

**Antes (JavaScript):**
```javascript
// No hay error hasta ejecutar
const appointment = new Appointment(123, "Juan", "PE");
// ↑ Debería ser string, no integer

// Error en runtime: "Invalid user ID"
```

**Ahora (TypeScript):**
```typescript
// Error INMEDIATO al escribir
const appointment = new Appointment(123, "Juan", "PE");
//                                  ↑ Type error: Argument of type 'number' 
//                                    is not assignable to parameter of type 'string'
```

### 2. **IDE Autocomplete**

```typescript
const appointment = new Appointment("user", "Juan", "PE");

// Escribes: appointment.
// El IDE te muestra: 
// - validate()
// - toPlainObject()
// - toJSON()
// (Todos los métodos disponibles)
```

### 3. **Refactoring Seguro**

```typescript
// Si cambias IAppointment
export interface IAppointment {
    userId: string;
    nombre: string;
    countryISO: CountryISO;
    newField: string;  // ← Agregaste un campo
}

// TypeScript te dice en TODOS los lugares donde completa IAppointment
// que necesitas agregar ese campo. JavaScript no te diría nada.
```

### 4. **Documentación Auto-generada**

```typescript
/**
 * Guarda una cita en DynamoDB
 * @param appointment - La cita a guardar
 * @returns Promise<IAppointment> - La cita guardada
 * @throws InfrastructureError si falla la conexión
 */
async save(appointment: Appointment): Promise<IAppointment> {
    // Los comentarios + tipos = documentación clara
}
```

El IDE muestra esto en hover.

### 5. **Contrato Explícito**

```typescript
// RyStack.ts sabe EXACTAMENTE qué hacer
export interface IAppointmentRepository {
    save(appointment: Appointment): Promise<IAppointment>;
    findAll(userId: string): Promise<IAppointment[]>;
    findById(appointmentId: string | number): Promise<IAppointment | null>;
    update(appointment: Appointment): Promise<IAppointment>;
}

// Si implementas esta interfaz pero olvidas un método, TypeScript te lo dirá
export class DynamoDBRepository implements IAppointmentRepository {
    // ¡Error! Debes implementar todos los métodos
}
```

---

## 📊 Comparación: JavaScript vs TypeScript

| Aspecto | JavaScript | TypeScript |
|---------|-----------|-----------|
| **Errores** | Runtime | Compile time ✅ |
| **IDE Help** | Básico | Excelente ✅ |
| **Refactoring** | Riesgoso | Seguro ✅ |
| **Documentación** | Manual | Auto ✅ |
| **Contrato** | Implícito | Explícito ✅ |
| **Performance** | Rápido | Rápido (igual) ✅ |
| **Curva aprendizaje** | Baja | Media |
| **Compilación** | No | Sí (pero rápido) |

---

## ⚙️ Configuración TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",              // Genera JS moderno
    "module": "ESNext",              // Módulos ES6
    "moduleResolution": "node",      // Cómo buscar imports
    "strict": true,                  // Todas las verificaciones activadas ✅
    "noImplicitAny": true,           // No permitir 'any' implícito
    "strictNullChecks": true,        // Null/undefined checked ✅
    "noUnusedLocals": false,         // No fallar si hay variables no usadas
    "outDir": "./dist",              // Carpeta de salida
    "rootDir": "./",                 // Carpeta de entrada
    "skipLibCheck": true,            // No checkear tipos de librerías
    "forceConsistentCasingInFileNames": true,  // Archivos con mismo case
  },
  "include": ["src/**/*", "handlers/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## ✅ Próximos Pasos

1. **Compilar el código:**
   ```bash
   npm run build
   ```

2. **Verificar que compila sin errores:**
   ```bash
   npm run lint
   ```

3. **Actualizar `serverless.yml`** con rutas a `dist/`

4. **Verificar localmente** (si tienes setup local)

5. **Desplegar:**
   ```bash
   npm run deploy
   ```

---

## 🎓 Resumen

**TypeScript = JavaScript + Tipos + Compilación**

✅ Detecta errores ANTES de ejecutar
✅ Mejor IDE autocomplete
✅ Refactoring más seguro
✅ Documentación auto-generada
✅ Contrato explícito entre componentes
✅ Mantiene verificación de tipos en tiempo de compilación

El código compilado es **JavaScript puro**, así que **AWS Lambda lo ejecuta igual de rápido**.

Solo ganaste **seguridad y claridad** sin pérdida de rendimiento.
