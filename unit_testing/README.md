# Unit Testing

Esta carpeta contiene los tests unitarios del proyecto.

## Estructura

- `http/` — Tests para HTTPController (endpoints GET y POST)
- `sqs/` — Tests para SQSHandler (procesamiento de eventos SQS)
- `mocks/` — Mock factories y utilidades para tests

## Tecnología

- **Framework**: Jest
- **Lenguaje**: TypeScript
- **Configuración**: `jest.config.js`

## Cómo ejecutar tests

### Instalar dependencias

```bash
npm install
```

### Ejecutar tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch (reinicia al cambiar archivos)
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage
```

## Escribir nuevos tests

1. Crea un archivo `.test.ts` o `.spec.ts` en la carpeta correspondiente.
2. Importa las utilidades de `mocks/` para crear mocks de repositorios.
3. Usa Jest para describir y ejecutar tus tests.

**Ejemplo:**

```typescript
import { SomeUseCase } from '../../src/application/usecases/SomeUseCase';
import { mockAppointmentRepository } from '../mocks/repositories';

describe('SomeUseCase', () => {
  it('should do something', async () => {
    const mockRepo = mockAppointmentRepository();
    const useCase = new SomeUseCase(mockRepo);

    mockRepo.findById.mockResolvedValueOnce({ /* ... */ });

    const result = await useCase.execute({ id: '123' });

    expect(result).toBeDefined();
  });
});
```

## Notas

- Los tests usan `jest.fn()` para crear mocks de dependencias.
- Todos los tests deben ser independientes y no afectar el estado global.
- Se recomienda agregar nuevos tests antes de implementar nuevas funcionalidades (TDD).
