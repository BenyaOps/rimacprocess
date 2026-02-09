import {
    IAppointment,
    AppointmentStatus,
    CountryISO,
    ValidationError
} from '../../shared/types.js';

/**
 * Appointment Entity - Capa de Dominio
 * Representa la entidad de negocio de una Cita
 */
export class Appointment implements IAppointment {
    readonly userId: string;
    readonly nombre: string;
    readonly countryISO: CountryISO;
    readonly insuredId?: string;
    readonly scheduleId?: string;
    readonly timestamp: string;
    readonly status: AppointmentStatus;
    readonly createdAt: string;

    constructor(
        userId: string,
        nombre: string,
        countryISO: CountryISO,
        insuredId?: string,
        scheduleId?: string
    ) {
        this.userId = userId;
        this.nombre = nombre;
        this.countryISO = countryISO;
        this.insuredId = insuredId;
        this.scheduleId = scheduleId;
        this.timestamp = new Date().toISOString();
        this.status = 'pending' as AppointmentStatus;
        this.createdAt = new Date().toISOString();
    }

    /**
     * Valida que la entidad tenga datos válidos
     * @throws ValidationError si no es válida
     */
    public validate(): boolean {
        if (!this.userId || this.userId.trim().length === 0) {
            throw new ValidationError('userId es requerido y no puede estar vacío');
        }
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new ValidationError('nombre es requerido y no puede estar vacío');
        }
        if (!this.countryISO || this.countryISO.trim().length === 0) {
            throw new ValidationError('countryISO es requerido y no puede estar vacío');
        }
        return true;
    }

    /**
     * Convierte la entidad a objeto plano
     */
    public toPlainObject(): IAppointment {
        return {
            userId: this.userId,
            nombre: this.nombre,
            countryISO: this.countryISO,
            insuredId: this.insuredId,
            scheduleId: this.scheduleId,
            timestamp: this.timestamp,
            status: this.status,
            createdAt: this.createdAt
        };
    }

    /**
     * Convierte a JSON
     */
    public toJSON(): IAppointment {
        return this.toPlainObject();
    }
}
