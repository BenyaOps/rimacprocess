import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';

/**
 * Implementación de Repositorio con PostgreSQL
 * Capa: Infraestructura
 * Usado por los workers para guardar en BD regional
 */
export class PostgresRepository extends IAppointmentRepository {
    constructor(pool) {
        super();
        this.pool = pool;
    }

    async save(appointmentData) {
        const client = await this.pool.connect();
        try {
            const query = 'INSERT INTO appointments (user_id, nombre, created_at) VALUES ($1, $2, NOW()) RETURNING *';
            const values = [appointmentData.user_id, appointmentData.nombre];
            
            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error guardando en PostgreSQL:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async findAll(userId) {
        const client = await this.pool.connect();
        try {
            const query = 'SELECT * FROM appointments WHERE user_id = $1 ORDER BY created_at DESC';
            const result = await client.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error consultando PostgreSQL:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(appointmentId) {
        const client = await this.pool.connect();
        try {
            const query = 'SELECT * FROM appointments WHERE id = $1';
            const result = await client.query(query, [appointmentId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error consultando PostgreSQL:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async update(appointmentData) {
        const client = await this.pool.connect();
        try {
            const query = 'UPDATE appointments SET nombre = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
            const result = await client.query(query, [appointmentData.nombre, appointmentData.id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error actualizando PostgreSQL:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
