/**
 * Ejemplos de Tests Unitarios para Clean Architecture
 * 
 * Para ejecutar:
 * npm test
 * 
 * O instalar Jest:
 * npm install --save-dev jest
 */

// ============================================================================
// TEST 1: RegisterAppointmentUseCase
// ============================================================================

class MockDynamoDBRepository {
    async save(appointment) {
        console.log('[Mock] Guardando en DynamoDB:', appointment.userId);
        return appointment.toPlainObject();
    }
}

class MockSNSPublisher {
    async publish(topicArn, message, attributes) {
        console.log('[Mock] Publicando en SNS:', attributes.countryISO.StringValue);
        return { MessageId: 'mock-message-id-123' };
    }
}

/**
 * Test: Registrar una cita exitosamente
 */
async function testRegisterAppointmentSuccess() {
    console.log('\n🧪 TEST: RegisterAppointmentUseCase - Crear cita');
    
    // Setup
    const { RegisterAppointmentUseCase } = await import('./src/application/usecases/RegisterAppointmentUseCase.js');
    const { AppointmentDTO } = await import('./src/application/dtos/AppointmentDTO.js');
    
    const mockDynamoDB = new MockDynamoDBRepository();
    const mockSNS = new MockSNSPublisher();
    const useCase = new RegisterAppointmentUseCase(mockDynamoDB, mockSNS);
    
    // Execute
    const dto = new AppointmentDTO({
        userId: 'user123',
        nombre: 'Juan Pérez',
        countryISO: 'PE',
        insuredId: 'aseg456',
        scheduleId: 'sched789'
    });
    
    const result = await useCase.execute(dto, 'arn:aws:sns:us-east-1:123:topic');
    
    // Assert
    if (result.message === 'Cita registrada exitosamente' && 
        result.data.userId === 'user123' &&
        result.data.countryISO === 'PE') {
        console.log('✅ PASSED: Cita registrada exitosamente');
        return true;
    } else {
        console.log('❌ FAILED: Resultado inesperado', result);
        return false;
    }
}

/**
 * Test: Registro falla si faltan datos
 */
async function testRegisterAppointmentFailsWithoutData() {
    console.log('\n🧪 TEST: RegisterAppointmentUseCase - Validación de datos');
    
    const { RegisterAppointmentUseCase } = await import('./src/application/usecases/RegisterAppointmentUseCase.js');
    const { AppointmentDTO } = await import('./src/application/dtos/AppointmentDTO.js');
    
    const mockDynamoDB = new MockDynamoDBRepository();
    const mockSNS = new MockSNSPublisher();
    const useCase = new RegisterAppointmentUseCase(mockDynamoDB, mockSNS);
    
    // DTO sin datos requeridos
    const dto = new AppointmentDTO({
        userId: 'user123',
        nombre: 'Juan',
        // ⚠️ Falta countryISO
    });
    
    try {
        await useCase.execute(dto, 'arn:aws:sns:us-east-1:123:topic');
        console.log('❌ FAILED: Debería haber lanzado un error');
        return false;
    } catch (error) {
        if (error.message.includes('inválidos')) {
            console.log('✅ PASSED: Validación funcionó', error.message);
            return true;
        }
        console.log('❌ FAILED: Error incorrecto', error.message);
        return false;
    }
}

// ============================================================================
// TEST 2: Appointment Entity
// ============================================================================

/**
 * Test: Crear entidad Appointment
 */
async function testAppointmentEntity() {
    console.log('\n🧪 TEST: Appointment Entity - Crear entidad');
    
    const { Appointment } = await import('./src/domain/entities/Appointment.js');
    
    const appointment = new Appointment(
        'user123',
        'Juan Pérez',
        'PE',
        'aseg456',
        'sched789'
    );
    
    if (appointment.userId === 'user123' && 
        appointment.status === 'pending' &&
        appointment.isValid()) {
        console.log('✅ PASSED: Entidad creada correctamente');
        return true;
    } else {
        console.log('❌ FAILED: Entidad no es válida');
        return false;
    }
}

/**
 * Test: Convertir entidad a objeto plano
 */
async function testAppointmentToPlainObject() {
    console.log('\n🧪 TEST: Appointment Entity - Convertir a objeto plano');
    
    const { Appointment } = await import('./src/domain/entities/Appointment.js');
    
    const appointment = new Appointment('user123', 'Juan', 'PE', 'aseg', 'sched');
    const plain = appointment.toPlainObject();
    
    if (plain.userId === 'user123' && 
        plain.status === 'pending' &&
        'timestamp' in plain &&
        'createdAt' in plain) {
        console.log('✅ PASSED: Conversión a objeto plano exitosa');
        return true;
    } else {
        console.log('❌ FAILED: Objeto plano incorrecto', plain);
        return false;
    }
}

// ============================================================================
// TEST 3: HTTP Controller
// ============================================================================

/**
 * Test: HTTP Controller POST
 */
async function testHTTPControllerPost() {
    console.log('\n🧪 TEST: HTTPController - POST /registrar');
    
    const { HTTPController } = await import('./src/interfaces/http/HTTPController.js');
    const { RegisterAppointmentUseCase } = await import('./src/application/usecases/RegisterAppointmentUseCase.js');
    
    const mockDynamoDB = new MockDynamoDBRepository();
    const mockSNS = new MockSNSPublisher();
    const useCase = new RegisterAppointmentUseCase(mockDynamoDB, mockSNS);
    const controller = new HTTPController(useCase, null);
    
    // Simular evento HTTP POST
    const mockEvent = {
        body: JSON.stringify({
            userId: 'user123',
            nombre: 'Juan Pérez',
            countryISO: 'PE'
        })
    };
    
    // Mock process.env
    process.env.TOPIC_ARN = 'arn:aws:sns:us-east-1:123:topic';
    
    const response = await controller.registerAppointment(mockEvent);
    
    if (response.statusCode === 200 && JSON.parse(response.body).message) {
        console.log('✅ PASSED: Controller POST funcionó');
        return true;
    } else {
        console.log('❌ FAILED: Response incorrecto', response);
        return false;
    }
}

/**
 * Test: HTTP Controller GET
 */
async function testHTTPControllerGet() {
    console.log('\n🧪 TEST: HTTPController - GET /consultar/:userId');
    
    const { HTTPController } = await import('./src/interfaces/http/HTTPController.js');
    const { ConsultAppointmentUseCase } = await import('./src/application/usecases/ConsultAppointmentUseCase.js');
    
    class MockGetRepository {
        async findAll(userId) {
            return [
                { userId, nombre: 'Cita 1', status: 'pending' },
                { userId, nombre: 'Cita 2', status: 'completed' }
            ];
        }
    }
    
    const mockRepo = new MockGetRepository();
    const useCase = new ConsultAppointmentUseCase(mockRepo);
    const controller = new HTTPController(null, useCase);
    
    // Simular evento HTTP GET
    const mockEvent = {
        pathParameters: { userId: 'user123' }
    };
    
    const response = await controller.consultAppointment(mockEvent);
    const body = JSON.parse(response.body);
    
    if (response.statusCode === 200 && body.total === 2 && body.items.length === 2) {
        console.log('✅ PASSED: Controller GET funcionó');
        return true;
    } else {
        console.log('❌ FAILED: Response incorrecto', body);
        return false;
    }
}

// ============================================================================
// TEST 4: SQS Handler
// ============================================================================

/**
 * Test: SQS Handler procesa eventos
 */
async function testSQSHandler() {
    console.log('\n🧪 TEST: SQSHandler - Procesar evento SQS');
    
    const { SQSHandler } = await import('./src/interfaces/sqs/SQSHandler.js');
    const { ProcessAppointmentUseCase } = await import('./src/application/usecases/ProcessAppointmentUseCase.js');
    
    class MockRegionalRepo {
        async save(data) {
            return { id: 1, ...data };
        }
    }
    
    const mockRepo = new MockRegionalRepo();
    const useCase = new ProcessAppointmentUseCase(mockRepo);
    const handler = new SQSHandler(useCase);
    
    // Simular evento SQS de SNS
    const mockEvent = {
        Records: [
            {
                messageId: 'msg123',
                body: JSON.stringify({
                    Message: JSON.stringify({
                        userId: 'user123',
                        nombre: 'Juan Pérez',
                        countryISO: 'PE'
                    })
                })
            }
        ]
    };
    
    const response = await handler.handleSQSEvent(mockEvent);
    
    if (response.statusCode === 200 && response.body) {
        console.log('✅ PASSED: SQSHandler procesó evento');
        return true;
    } else {
        console.log('❌ FAILED: Response incorrecto', response);
        return false;
    }
}

// ============================================================================
// TEST 5: Dependency Injection Container
// ============================================================================

/**
 * Test: Contenedor DI crea singletons
 */
async function testDIContainer() {
    console.log('\n🧪 TEST: DI Container - Crear singletons');
    
    const { createContainer } = await import('./src/di/container.js');
    
    // Mock process.env
    process.env.TABLE_NAME = 'TestTable';
    process.env.TOPIC_ARN = 'arn:aws:sns:test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_NAME = 'testdb';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASS = 'testpass';
    
    const container = createContainer();
    
    // Obtener dos referencias al mismo servicio
    const useCase1 = container.get('registerUseCase');
    const useCase2 = container.get('registerUseCase');
    
    // Deben ser la misma instancia (singleton)
    if (useCase1 === useCase2) {
        console.log('✅ PASSED: DI Container funciona - Singleton OK');
        return true;
    } else {
        console.log('❌ FAILED: No es singleton');
        return false;
    }
}

// ============================================================================
// RUNNER
// ============================================================================

async function runAllTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     TESTS DE CLEAN ARCHITECTURE - SERVICIO RIMAC   ║');
    console.log('╚════════════════════════════════════════════════════╝');
    
    const results = [];
    
    // Tests
    results.push(await testAppointmentEntity());
    results.push(await testAppointmentToPlainObject());
    results.push(await testRegisterAppointmentSuccess());
    results.push(await testRegisterAppointmentFailsWithoutData());
    results.push(await testHTTPControllerPost());
    results.push(await testHTTPControllerGet());
    results.push(await testSQSHandler());
    results.push(await testDIContainer());
    
    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    const percentage = Math.round((passed / total) * 100);
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║  RÉSULTATS: ${passed}/${total} tests passed (${percentage}%)            ║`);
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    if (passed === total) {
        console.log('🎉 ¡Todos los tests pasaron!');
        process.exit(0);
    } else {
        console.log(`⚠️  ${total - passed} tests fallaron`);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}

export {
    testAppointmentEntity,
    testRegisterAppointmentSuccess,
    testHTTPControllerPost,
    testSQSHandler,
    testDIContainer
};
