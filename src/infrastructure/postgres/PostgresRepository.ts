import { Pool, PoolClient } from 'pg';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { Appointment } from '../../domain/entities/Appointment.js';
import { IAppointment, IPostgresAppointment, InfrastructureError } from '../../shared/types.js';

/**
 * Implementación de Repositorio con PostgreSQL
 * Capa: Infraestructura
 * Usado por los workers para guardar en BD regional
 */
export class PostgresRepository implements IAppointmentRepository {
    constructor(private readonly pool: Pool) {}

    /**
     * Guarda una cita en PostgreSQL
     */
    async save(appointment: Appointment): Promise<IAppointment> {
        const client: PoolClient = await this.pool.connect();
        try {
            const query = `
                INSERT INTO appointments (user_id, nombre, created_at)
                VALUES ($1, $2, NOW())
                RETURNING id, user_id, nombre, created_at, updated_at
            `;
            const values = [appointment.userId, appointment.nombre];

            const result = await client.query(query, values);
            const row = result.rows[0] as IPostgresAppointment;

            return {
                userId: row.user_id,
                nombre: row.nombre,
                countryISO: appointment.countryISO,
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: String(row.created_at)
            };
        } catch (error) {
            throw new InfrastructureError(
                `Error guardando en PostgreSQL: ${(error as Error).message}`
            );
        } finally {
            client.release();
        }
    }

    /**
     * Obtiene todas las citas de un usuario desde PostgreSQL
     */
    async findAll(userId: string): Promise<IAppointment[]> {
        const client: PoolClient = await this.pool.connect();
        try {
            const query = `
                SELECT id, user_id, nombre, created_at, updated_at
                FROM appointments
                WHERE user_id = $1
                ORDER BY created_at DESC
            `;
            const result = await client.query(query, [userId]);
            
            return result.rows.map((row: IPostgresAppointment) => ({
                userId: row.user_id,
                nombre: row.nombre,
                countryISO: '',
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: String(row.created_at)
            }));
        } catch (error) {
            throw new InfrastructureError(
                `Error consultando PostgreSQL: ${(error as Error).message}`
            );
        } finally {
            client.release();
        }
    }

    /**
     * Encuentra una cita por ID en PostgreSQL
     */
    async findById(appointmentId: string | number): Promise<IAppointment | null> {
        const client: PoolClient = await this.pool.connect();
        try {
            const query = `
                SELECT id, user_id, nombre, created_at
                FROM appointments
                WHERE id = $1
            `;
            const result = await client.query(query, [appointmentId]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0] as IPostgresAppointment;
            return {
                userId: row.user_id,
                nombre: row.nombre,
                countryISO: '',
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: String(row.created_at)
            };
        } catch (error) {
            throw new InfrastructureError(
                `Error consultando PostgreSQL: ${(error as Error).message}`
            );
        } finally {
            client.release();
        }
    }

    /**
     * Actualiza una cita en PostgreSQL
     */
    async update(appointment: Appointment): Promise<IAppointment> {
        const client: PoolClient = await this.pool.connect();
        try {
            const query = `
                UPDATE appointments
                SET nombre = $1, updated_at = NOW()
                WHERE user_id = $2
                RETURNING id, user_id, nombre, created_at, updated_at
            `;
            const values = [appointment.nombre, appointment.userId];
            
            const result = await client.query(query, values);
            
            if (result.rows.length === 0) {
                throw new InfrastructureError('No se encontró la cita para actualizar');
            }

            const row = result.rows[0] as IPostgresAppointment;
            return {
                userId: row.user_id,
                nombre: row.nombre,
                countryISO: appointment.countryISO,
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: String(row.created_at)
            };
        } catch (error) {
            throw new InfrastructureError(
                `Error actualizando PostgreSQL: ${(error as Error).message}`
            );
        } finally {
            client.release();
        }
    }
}
