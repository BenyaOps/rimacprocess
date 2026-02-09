/**
 * Data Transfer Object para Appointment - Capa de Aplicación
 * Usado para transferir datos entre capas
 */
export class AppointmentDTO {
    constructor(data) {
        this.userId = data.userId;
        this.nombre = data.nombre;
        this.countryISO = data.countryISO;
        this.insuredId = data.insuredId || null;
        this.scheduleId = data.scheduleId || null;
    }

    /**
     * Valida que el DTO tenga los datos requeridos
     */
    isValid() {
        return this.userId && this.nombre && this.countryISO;
    }

    /**
     * Convierte el DTO a objeto plano
     */
    toJSON() {
        return {
            userId: this.userId,
            nombre: this.nombre,
            countryISO: this.countryISO,
            insuredId: this.insuredId,
            scheduleId: this.scheduleId
        };
    }
}
