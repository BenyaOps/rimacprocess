import { ICreateAppointmentInput, ValidationError } from '../../shared/types.js';

/**
 * Data Transfer Object para Appointment - Capa de Aplicación
 * Usado para transferir datos entre capas
 */
export class AppointmentDTO implements ICreateAppointmentInput {
    readonly userId: string;
    readonly nombre: string;
    readonly countryISO: string;
    readonly insuredId?: string;
    readonly scheduleId?: string;

    constructor(data: ICreateAppointmentInput) {
        this.userId = data.userId;
        this.nombre = data.nombre;
        this.countryISO = data.countryISO;
        this.insuredId = data.insuredId;
        this.scheduleId = data.scheduleId;
    }

    /**
     * Valida que el DTO tenga los datos requeridos
     * @throws ValidationError si no es válido
     */
    public validate(): boolean {
        if (!this.userId || this.userId.trim().length === 0) {
            throw new ValidationError('userId es requerido');
        }
        if (!this.nombre || this.nombre.trim().length === 0) {
            throw new ValidationError('nombre es requerido');
        }
        if (!this.countryISO || this.countryISO.trim().length === 0) {
            throw new ValidationError('countryISO es requerido');
        }
        return true;
    }

    /**
     * Convierte el DTO a objeto plano
     */
    public toJSON(): ICreateAppointmentInput {
        return {
            userId: this.userId,
            nombre: this.nombre,
            countryISO: this.countryISO,
            insuredId: this.insuredId,
            scheduleId: this.scheduleId
        };
    }
}
