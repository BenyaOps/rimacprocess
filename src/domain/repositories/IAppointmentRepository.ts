import { Appointment } from '../entities/Appointment.js';
import { IAppointment, IMessageAttributes } from '../../shared/types.js';

/**
 * Interface para Repositorio de Appointments - Capa de Dominio
 * Define los contratos que deben implementar los repositorios
 */
export interface IAppointmentRepository {
    /**
     * Guarda una cita en el repositorio
     */
    save(appointment: Appointment): Promise<IAppointment>;

    /**
     * Encuentra todas las citas de un usuario
     */
    findAll(userId: string): Promise<IAppointment[]>;

    /**
     * Encuentra una cita por ID
     */
    findById(appointmentId: string | number): Promise<IAppointment | null>;

    /**
     * Actualiza una cita
     */
    update(appointment: Appointment): Promise<IAppointment>;
}
