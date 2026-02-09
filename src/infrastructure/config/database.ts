import { Pool, PoolClient } from 'pg';
import { IDatabaseConfig } from '../../shared/types.js';

/**
 * Configuración de Base de Datos
 * Capa: Infraestructura
 */
export class DatabaseConfig {
    /**
     * Crea un pool de conexiones de PostgreSQL
     */
    static createPostgresPool(config: IDatabaseConfig): Pool {
        return new Pool({
            host: config.host,
            database: config.name,
            user: config.user,
            password: config.pass,
            port: config.port || 5432,
            ssl: config.ssl !== false ? { rejectUnauthorized: false } : false
        });
    }
}

/**
 * Pool singleton para Postgres
 */
let postgresPoolInstance: Pool | null = null;

/**
 * Obtiene o crea el pool de Postgres (singleton)
 */
export const getPostgresPool = (config: IDatabaseConfig): Pool => {
    if (!postgresPoolInstance) {
        postgresPoolInstance = DatabaseConfig.createPostgresPool(config);
    }
    return postgresPoolInstance;
};

/**
 * Cierra el pool de Postgres
 */
export const closePostgresPool = async (): Promise<void> => {
    if (postgresPoolInstance) {
        await postgresPoolInstance.end();
        postgresPoolInstance = null;
    }
};
