import { Pool } from 'pg';
import { RegisterAppointmentUseCase } from '../application/usecases/RegisterAppointmentUseCase.js';
import { ConsultAppointmentUseCase } from '../application/usecases/ConsultAppointmentUseCase.js';
import { ProcessAppointmentUseCase } from '../application/usecases/ProcessAppointmentUseCase.js';
import { DynamoDBRepository } from '../infrastructure/dynamodb/DynamoDBRepository.js';
import { PostgresRepository } from '../infrastructure/postgres/PostgresRepository.js';
import { SNSPublisher } from '../infrastructure/sns/SNSPublisher.js';
import { HTTPController } from '../interfaces/http/HTTPController.js';
import { SQSHandler } from '../interfaces/sqs/SQSHandler.js';
import { getPostgresPool } from '../infrastructure/config/database.js';
import { IDatabaseConfig } from '../shared/types.js';

/**
 * Contenedor de Inyección de Dependencias
 * Capa: Infraestructura
 * Centraliza la creación de instancias y sus dependencias
 */
export class Container {
    private readonly services: Map<string, (container: Container) => unknown>;
    private readonly singletons: Map<string, unknown>;

    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }

    /**
     * Registra un servicio único (singleton)
     */
    registerSingleton(
        name: string,
        factory: (container: Container) => unknown
    ): void {
        this.services.set(name, factory);
    }

    /**
     * Obtiene una instancia (singleton)
     */
    get<T>(name: string): T {
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
    }

    /**
     * Verifica si un servicio está registrado
     */
    has(name: string): boolean {
        return this.services.has(name);
    }

    /**
     * Limpia todos los singletons
     */
    clear(): void {
        this.singletons.clear();
    }
}

/**
 * Crear y configurar el contenedor de DI
 */
export const createContainer = (): Container => {
    const container = new Container();

    // ========================================================================
    // Infraestructura
    // ========================================================================

    container.registerSingleton('dynamoDbRepository', () => {
        return new DynamoDBRepository(process.env.TABLE_NAME || 'RimacTable');
    });

    container.registerSingleton('postgresConfig', () => {
        return {
            host: process.env.DB_HOST || 'localhost',
            name: process.env.DB_NAME || 'neondb',
            user: process.env.DB_USER || 'neondb_owner',
            pass: process.env.DB_PASS || '',
            port: parseInt(process.env.DB_PORT || '5432', 10)
        } as IDatabaseConfig;
    });

    container.registerSingleton('postgresPool', (c: Container) => {
        const config = c.get<IDatabaseConfig>('postgresConfig');
        return getPostgresPool(config);
    });

    container.registerSingleton('postgresRepository', (c: Container) => {
        const pool = c.get<Pool>('postgresPool');
        return new PostgresRepository(pool);
    });

    container.registerSingleton('snsPublisher', () => {
        return new SNSPublisher();
    });

    // ========================================================================
    // Casos de uso
    // ========================================================================

    container.registerSingleton('registerUseCase', (c: Container) => {
        const dynamoRepo = c.get(
            'dynamoDbRepository'
        ) as DynamoDBRepository;
        const snsPublisher = c.get('snsPublisher') as SNSPublisher;
        
        return new RegisterAppointmentUseCase(dynamoRepo, snsPublisher);
    });

    container.registerSingleton('consultUseCase', (c: Container) => {
        const dynamoRepo = c.get(
            'dynamoDbRepository'
        ) as DynamoDBRepository;
        
        return new ConsultAppointmentUseCase(dynamoRepo);
    });

    container.registerSingleton('processUseCase', (c: Container) => {
        const postgresRepo = c.get(
            'postgresRepository'
        ) as PostgresRepository;
        
        return new ProcessAppointmentUseCase(postgresRepo);
    });

    // ========================================================================
    // Controladores/Handlers
    // ========================================================================

    container.registerSingleton('httpController', (c: Container) => {
        const registerUseCase = c.get(
            'registerUseCase'
        ) as RegisterAppointmentUseCase;
        const consultUseCase = c.get(
            'consultUseCase'
        ) as ConsultAppointmentUseCase;
        
        return new HTTPController(registerUseCase, consultUseCase);
    });

    container.registerSingleton('sqsHandler', (c: Container) => {
        const processUseCase = c.get(
            'processUseCase'
        ) as ProcessAppointmentUseCase;
        
        return new SQSHandler(processUseCase);
    });

    return container;
};

// Singleton global del contenedor
let globalContainer: Container | null = null;

/**
 * Obtiene o crea el contenedor global
 */
export const getGlobalContainer = (): Container => {
    if (!globalContainer) {
        globalContainer = createContainer();
    }
    return globalContainer;
};
