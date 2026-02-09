/**
 * Tipos comunes y globales para toda la aplicación
 * Capa: Shared/Types
 */

// ============================================================================
// TIPOS DE DOMINIO
// ============================================================================

/**
 * Estado posible de una cita
 */
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

/**
 * Código de país ISO
 */
export type CountryISO = 'PE' | 'CL' | string;

/**
 * Interfaz para una Cita
 */
export interface IAppointment {
    userId?: string;
    nombre: string;
    countryISO: CountryISO;
    insuredId?: string;
    scheduleId?: string;
    timestamp: string;
    status: AppointmentStatus;
    createdAt: string;
}

/**
 * Interfaz para parámetros de entrada al registrar una cita
 */
export interface ICreateAppointmentInput {
    userId: string;
    nombre: string;
    countryISO: CountryISO;
    insuredId?: string;
    scheduleId?: string;
}

/**
 * Respuesta de caso de uso
 */
export interface IUseCaseResponse<T = unknown> {
    message: string;
    data?: T;
    error?: string;
}

// ============================================================================
// TIPOS DE EVENTOS AWS
// ============================================================================

/**
 * Evento HTTP de AWS Lambda (API Gateway)
 */
export interface IHttpEvent {
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path?: string;
    headers?: Record<string, string>;
    queryStringParameters?: Record<string, string | undefined>;
    body: string;
    pathParameters: Record<string, string | undefined>;
    requestContext: {
        http: {
            method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            path: string;
        };
    };
}

/**
 * Evento SQS de AWS Lambda
 */
export interface ISQSEvent {
    Records: Array<{
        messageId: string;
        receiptHandle: string;
        body: string;
        attributes: Record<string, unknown>;
        messageAttributes: Record<string, unknown>;
    }>;
}

export interface ISQSRecord {
    messageId: string;
    receiptHandle: string;
    body: string;
    attributes: Record<string, unknown>;
    messageAttributes: Record<string, unknown>;
}

/**
 * Evento SQS procesado (mensaje de SNS envuelto en SQS)
 */
export interface ISNSMessageFromSQS {
    Message: string;
    MessageAttributes?: Record<string, {
        dataType: string;
        stringValue?: string;
    }>;
}

// ============================================================================
// TIPOS DE RESPUESTA LAMBDA
// ============================================================================

/**
 * Respuesta de AWS Lambda
 */
export interface ILambdaResponse {
    statusCode: number;
    body: string;
    headers?: Record<string, string>;
}

/**
 * Respuesta de SQS Handler
 */
export interface ISQSHandlerResponse {
    statusCode: number;
    body: string;
}

// ============================================================================
// TIPOS DE BASE DE DATOS
// ============================================================================

/**
 * Interfaz para una fila en Postgres
 */
export interface IPostgresAppointment {
    id?: number;
    insured_id: string;
    nombre: string;
    created_at: Date | string;
    updated_at?: Date | string;
}

/**
 * Interfaz para una fila en MySQL
 */
export interface IMySQLAppointment {
    id?: number;
    insured_id: string;
    nombre: string;
    created_at: Date | string;
    updated_at?: Date | string;
}

/**
 * Configuración de base de datos
 */
export interface IDatabaseConfig {
    host: string;
    name: string;
    user: string;
    pass: string;
    port?: number;
    ssl?: boolean;
}

// ============================================================================
// TIPOS DE SNS
// ============================================================================

/**
 * Atributo de mensaje SNS
 */
export interface IMessageAttribute {
    DataType: 'String' | 'Number' | 'Binary';
    StringValue?: string;
    BinaryValue?: Buffer;
}

/**
 * Atributos de mensaje SNS
 */
export interface IMessageAttributes {
    [key: string]: IMessageAttribute;
}

// ============================================================================
// TIPOS DE VALIDACIÓN
// ============================================================================

/**
 * Resultado de validación
 */
export interface IValidationResult {
    isValid: boolean;
    errors: string[];
}

// ============================================================================
// TIPOS DE REPOSITORIO
// ============================================================================

/**
 * Resultado de operación de repositorio
 */
export interface IRepositoryResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================================================
// TIPOS DE LOGGER
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
    debug(message: string, data?: unknown): void;
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, error?: Error | unknown): void;
}

// ============================================================================
// TIPOS DE EXCEPCIONES
// ============================================================================

/**
 * Excepciones de dominio
 */
export class DomainError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

export class ValidationError extends DomainError {
    constructor(message: string) {
        super('VALIDATION_ERROR', message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends DomainError {
    constructor(message: string) {
        super('NOT_FOUND', message);
        this.name = 'NotFoundError';
    }
}

export class InfrastructureError extends DomainError {
    constructor(message: string) {
        super('INFRASTRUCTURE_ERROR', message);
        this.name = 'InfrastructureError';
    }
}
