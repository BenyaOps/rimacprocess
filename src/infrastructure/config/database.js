import pkg from 'pg';
const { Pool } = pkg;

/**
 * Configuración de Base de Datos
 * Capa: Infraestructura
 */
export class DatabaseConfig {
    static createPostgresPool(config) {
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
let postgresPoolInstance = null;

export const getPostgresPool = (config) => {
    if (!postgresPoolInstance) {
        postgresPoolInstance = DatabaseConfig.createPostgresPool(config);
    }
    return postgresPoolInstance;
};
