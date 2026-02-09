import { Pool, PoolConnection } from 'mysql2/promise';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { Appointment } from '../../domain/entities/Appointment';
import { IAppointment, IMySQLAppointment, InfrastructureError } from '../../shared/types';

/**
 * Implementación de Repositorio con MySQL
 * Capa: Infraestructura
 * Usado por los workers para guardar en BD regional
 */
export class MySQLRepository implements IAppointmentRepository {
    constructor(private readonly pool: Pool) {}

    /**
     * Guarda una cita en MySQL
     */
    async save(appointment: Appointment): Promise<IAppointment> {
        const connection: PoolConnection = await this.pool.getConnection();
        try {
            const query = `
                INSERT INTO appointments (user_id, nombre, created_at)
                VALUES (?, ?, NOW())
            `;
            const values = [appointment.insuredId, appointment.nombre];

            const [result] = await connection.execute(query, values);
            const insertId = (result as any).insertId;

            return {
                insuredId: appointment.insuredId,
                nombre: appointment.nombre,
                countryISO: appointment.countryISO,
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            throw new InfrastructureError(
                `Error guardando en MySQL: ${(error as Error).message}`
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Obtiene todas las citas de un asegurado desde MySQL
     */
    async findAll(insuredId: string): Promise<IAppointment[]> {
        const connection: PoolConnection = await this.pool.getConnection();
        try {
            const query = `
                SELECT id, insured_id, nombre, created_at, updated_at
                FROM appointments
                WHERE insured_id = ?
                ORDER BY created_at DESC
            `;
            const [rows] = await connection.execute(query, [insuredId]);

            return (rows as IMySQLAppointment[]).map((row) => ({
                insuredId: row.insured_id,
                nombre: row.nombre,
                countryISO: '',
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: String(row.created_at)
            }));
        } catch (error) {
            throw new InfrastructureError(
                `Error consultando MySQL: ${(error as Error).message}`
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Encuentra una cita por ID en MySQL
     */
    async findById(appointmentId: string | number): Promise<IAppointment | null> {
        const connection: PoolConnection = await this.pool.getConnection();
        try {
            const query = `
                SELECT id, user_id, nombre, created_at
                FROM appointments
                WHERE id = ?
            `;
            const [rows] = await connection.execute(query, [appointmentId]);

            if ((rows as any[]).length === 0) {
                return null;
            }

            const row = (rows as IMySQLAppointment[])[0];
            return {
                insuredId: row.insured_id,
                nombre: row.nombre,
                countryISO: '',
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: String(row.created_at)
            };
        } catch (error) {
            throw new InfrastructureError(
                `Error consultando MySQL: ${(error as Error).message}`
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Actualiza una cita en MySQL
     */
    async update(appointment: Appointment): Promise<IAppointment> {
        const connection: PoolConnection = await this.pool.getConnection();
        try {
            const query = `
                UPDATE appointments
                SET nombre = ?, updated_at = NOW()
                WHERE insured_id = ?
            `;
            const values = [appointment.nombre, appointment.insuredId];

            await connection.execute(query, values);

            return {
                insuredId: appointment.insuredId,
                nombre: appointment.nombre,
                countryISO: appointment.countryISO,
                status: 'pending',
                timestamp: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
        } catch (error) {
            throw new InfrastructureError(
                `Error actualizando MySQL: ${(error as Error).message}`
            );
        } finally {
            connection.release();
        }
    }
}
