# 📋 TypeScript Cheat Sheet - Referencia Rápida

## Tipos Básicos

```typescript
// Primitivos
let str: string = "texto";
let num: number = 42;
let bool: boolean = true;
let nothing: null = null;
let undefined: undefined = undefined;

// Arrays
let arr: string[] = ["a", "b"];
let arr2: Array<string> = ["a", "b"];

// Any (evita usar)
let anything: any = "puede ser cualquier cosa";

// Unknown (seguro)
let unknown: unknown = "no se qué es";
if (typeof unknown === 'string') {
    // Aquí TypeScript sabe que es string
}
```

---

## Tipos Complejos

### Interface
```typescript
interface User {
    name: string;
    age: number;
    email?: string;        // Opcional
    readonly id: number;   // Solo lectura
}

const user: User = {
    name: "Juan",
    age: 25,
    id: 1
};
```

### Type
```typescript
type Status = 'pending' | 'completed' | 'cancelled';
type Age = number;
type Point = { x: number; y: number };

const status: Status = 'pending';  // ✅
const status: Status = 'unknown';  // ❌ Error
```

### Unión
```typescript
type ID = string | number;
const id1: ID = "123";    // ✅
const id2: ID = 123;      // ✅
const id3: ID = true;     // ❌ Error
```

### Intersección
```typescript
type Admin = User & { role: 'admin' };
// Admin tiene: name, age, email, id, role
```

---

## Clases

```typescript
// Declaración
export class User {
    // Propiedades tipadas
    private email: string;
    public name: string;
    readonly id: number;
    protected role: string;

    // Constructor
    constructor(name: string, id: number) {
        this.name = name;
        this.id = id;
    }

    // Métodos
    public greet(): string {
        return `Hola ${this.name}`;
    }

    private log(): void {
        console.log(this.name);
    }
}

// Shorthand
export class User {
    constructor(
        public name: string,
        private email: string,
        readonly id: number
    ) {}
}
// ✅ Auto-asigna propiedades
```

---

## Generics

```typescript
// Función genérica
function getFirst<T>(arr: T[]): T {
    return arr[0];
}

const str = getFirst(["a", "b"]);        // T = string
const num = getFirst([1, 2, 3]);        // T = number

// Clase genérica
class Container<T> {
    private item: T;

    constructor(item: T) {
        this.item = item;
    }

    getItem(): T {
        return this.item;
    }
}

const strContainer = new Container("texto");      // T = string
const numContainer = new Container(42);           // T = number

// Con constraints
function process<T extends User>(user: T): void {
    console.log(user.name);  // ✅ Sabe que T tiene name
}
```

---

## Async/Await Tipado

```typescript
// Función async retorna Promise
async function fetchData(): Promise<string> {
    return "data";
}

// Con tipos genéricos
async function getData(): Promise<User> {
    return { name: "Juan", id: 1 };
}

// Array de promesas
async function getMultiple(): Promise<User[]> {
    return [
        { name: "Juan", id: 1 },
        { name: "María", id: 2 }
    ];
}

// Manejo de errores
async function safe(): Promise<User | null> {
    try {
        return await fetchData();
    } catch (error) {
        return null;
    }
}
```

---

## Enums

```typescript
// Enum numérico
enum Status {
    Pending = 0,
    Active = 1,
    Closed = 2
}

// Enum string
enum Color {
    Red = "RED",
    Green = "GREEN",
    Blue = "BLUE"
}

const status: Status = Status.Pending;
const color: Color = Color.Red;
```

---

## Type Utilities

```typescript
// Partial - todas las propiedades opcionales
type PartialUser = Partial<User>;
// { name?: string; age?: number; }

// Required - todas las propiedades obligatorias
type RequiredUser = Required<User>;
// { name: string; age: number; email: string; }

// Readonly - todas las propiedades readonly
type ReadonlyUser = Readonly<User>;
// { readonly name: string; ... }

// Pick - seleccionar propiedades
type UserPreview = Pick<User, 'name' | 'age'>;
// { name: string; age: number; }

// Omit - excluir propiedades
type UserWithoutId = Omit<User, 'id'>;
// { name: string; age: number; email: string; }

// Record - mapear propiedades
type UserRoles = Record<'admin' | 'user' | 'guest', User>;
// { admin: User; user: User; guest: User; }

// Exclude - excluir un tipo de una unión
type Status = Exclude<'pending' | 'completed' | 'cancelled', 'cancelled'>;
// 'pending' | 'completed'

// Extract - extraer un tipo de una unión
type StringOrNumber = Extract<string | number | boolean, string | number>;
// string | number
```

---

## Decorators (Avanzado)

```typescript
// Decorator de clase
function Logger(constructor: Function) {
    console.log(`Creando ${constructor.name}`);
}

// Decorator de método
function Timed(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args: any[]) {
        console.time(propertyKey);
        const result = original.apply(this, args);
        console.timeEnd(propertyKey);
        return result;
    };
}

@Logger
class User {
    @Timed
    process() {
        // ...
    }
}
```

---

## Typeof y Instanceof

```typescript
// typeof - verificar tipo
const value: any = "texto";
if (typeof value === 'string') {
    // Aquí TypeScript sabe que value es string
}

// instanceof - verificar instancia
class User {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

const obj: any = new User("Juan");
if (obj instanceof User) {
    // Aquí TypeScript sabe que obj es User
}
```

---

## Assertion (Type Casting)

```typescript
// Casting con 'as'
const value: any = "123";
const num = (value as string).length;  // ✅ Correcto
const bad = (value as number) + 1;     // ⚠️ Peligroso

// Non-null assertion
let name: string | null = null;
const length = name!.length;  // ✅ Asume que no es null

// Casting a unknown primero
const val: unknown = "123";
const str = (val as string);
```

---

## Errores Comunes y Soluciones

### Error: Object is possibly 'null'
```typescript
// ❌ Error
function getValue(obj?: { value: string }) {
    return obj.value;  // obj podría ser undefined
}

// ✅ Solución
function getValue(obj?: { value: string }) {
    return obj?.value;  // Optional chaining
}

// ✅ O verificar
function getValue(obj?: { value: string }) {
    if (!obj) return null;
    return obj.value;
}
```

### Error: Type 'X' is not assignable to type 'Y'
```typescript
// ❌ Error
const num: number = "123";

// ✅ Solución
const num: number = parseInt("123");
const num2: string = "123";
```

### Error: Property doesn't exist
```typescript
// ❌ Error
interface User {
    name: string;
}
const user: User = { name: "Juan", age: 25 };
// age no existe en User

// ✅ Solución
interface User {
    name: string;
    age?: number;  // Opcional
}
```

---

## En Nuestro Proyecto

### Tipos que Usamos

```typescript
// Domain
export interface IAppointment {
    userId: string;
    nombre: string;
    countryISO: CountryISO;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed';

// Application
export interface IUseCaseResponse<T> {
    message: string;
    data?: T;
}

// Infrastructure
export interface IDatabaseConfig {
    host: string;
    name: string;
    user: string;
    pass: string;
}

// Interfaces
export interface IHttpEvent {
    body: string;
    pathParameters: Record<string, string | undefined>;
}

// Exceptions
export class DomainError extends Error {
    constructor(public code: string, message: string) {
        super(message);
    }
}
```

### Generics que Usamos

```typescript
// Container DI
class Container {
    get<T>(name: string): T {
        // Retorna tipo T
    }
}

// Use Case Response
IUseCaseResponse<IAppointment>  // Response con datos de Appointment
IUseCaseResponse<IAppointment[]>  // Response con array de Appointments
```

### Type Guards que Usamos

```typescript
// En HTTPController
if (error instanceof ValidationError) {
    statusCode = 400;
} else {
    statusCode = 500;
}

// En SQSHandler
let snsMessage: ISNSMessageFromSQS;
try {
    snsMessage = JSON.parse(record.body);
} catch (e) {
    throw new Error('Body de SQS no es JSON válido');
}
```

---

## Tips Finales

✅ **DO**
- Usa tipos específicos: `string` vs `any`
- Define interfaces para objetos complejos
- Usa `readonly` para datos inmutables
- Usa generics para reutilizar tipos
- Aprovecha `typeof` e `instanceof`

❌ **DON'T**
- No uses `any` a menos que sea necesario
- No ignores errores de tipo
- No hagas type casting sin razón
- No mezcles JavaScript y TypeScript
- No uses `!` (non-null assertion) abusivamente

---

## 🚀 Referencia Rápida

```bash
# Compilar
npm run build

# Watch mode
npm run dev

# Verificar tipos
npm run lint

# Desplegar
npm run deploy
```

---

**TypeScript te hace más seguro. Úsalo bien.** ✨
