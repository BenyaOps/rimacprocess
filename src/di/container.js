import { RegisterAppointmentUseCase } from '../application/usecases/RegisterAppointmentUseCase.js';
import { ConsultAppointmentUseCase } from '../application/usecases/ConsultAppointmentUseCase.js';
import { ProcessAppointmentUseCase } from '../application/usecases/ProcessAppointmentUseCase.js';
import { DynamoDBRepository } from '../infrastructure/dynamodb/DynamoDBRepository.js';
import { PostgresRepository } from '../infrastructure/postgres/PostgresRepository.js';
import { SNSPublisher } from '../infrastructure/sns/SNSPublisher.js';
import { HTTPController } from '../interfaces/http/HTTPController.js';
import { SQSHandler } from '../interfaces/sqs/SQSHandler.js';
import { getPostgresPool } from '../infrastructure/config/database.js';

/**
 * Contenedor de Inyección de Dependencias
 * Capa: Infraestructura
 * Centraliza la creación de instancias y sus dependencias
 */
export class Container {
    constructor() {
        this.services = {};
        this.singletons = {};
    }

    /**
     * Registra un servicio único (singleton)
     */
    registerSingleton(name, factory) {
        this.services[name] = factory;
    }

    /**
     * Obtiene una instancia (singleton)
     */
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

/**
 * Crear y configurar el contenedor de DI
 */
export const createContainer = () => {
    const container = new Container();

    // Registrar infraestructura
    container.registerSingleton('dynamoDbRepository', () => {
        return new DynamoDBRepository(process.env.TABLE_NAME);
    });

    container.registerSingleton('postgresPool', () => {
        return getPostgresPool({
            host: process.env.DB_HOST,
            name: process.env.DB_NAME,
            user: process.env.DB_USER,
            pass: process.env.DB_PASS
        });
    });

    container.registerSingleton('postgresRepository', (c) => {
        return new PostgresRepository(c.get('postgresPool'));
    });

    container.registerSingleton('snsPublisher', () => {
        return new SNSPublisher();
    });

    // Registrar casos de uso
    container.registerSingleton('registerUseCase', (c) => {
        return new RegisterAppointmentUseCase(
            c.get('dynamoDbRepository'),
            c.get('snsPublisher')
        );
    });

    container.registerSingleton('consultUseCase', (c) => {
        return new ConsultAppointmentUseCase(
            c.get('dynamoDbRepository')
        );
    });

    container.registerSingleton('processUseCase', (c) => {
        return new ProcessAppointmentUseCase(
            c.get('postgresRepository')
        );
    });

    // Registrar controladores/handlers
    container.registerSingleton('httpController', (c) => {
        return new HTTPController(
            c.get('registerUseCase'),
            c.get('consultUseCase')
        );
    });

    container.registerSingleton('sqsHandler', (c) => {
        return new SQSHandler(
            c.get('processUseCase')
        );
    });

    return container;
};
