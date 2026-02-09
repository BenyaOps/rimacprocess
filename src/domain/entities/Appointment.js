/**
 * Appointment Entity - Capa de Dominio
 * Representa la entidad de negocio de una Cita
 */
export class Appointment {
    constructor(userId, nombre, countryISO, insuredId, scheduleId) {
        this.userId = userId;
        this.nombre = nombre;
        this.countryISO = countryISO;
        this.insuredId = insuredId;
        this.scheduleId = scheduleId;
        this.timestamp = new Date().toISOString();
        this.status = 'pending';
        this.createdAt = new Date().toISOString();
    }

    /**
     * Valida que la entidad tenga datos válidos
     */
    isValid() {
        return this.userId && this.nombre && this.countryISO;
    }

    /**
     * Convierte la entidad a objeto plano
     */
    toPlainObject() {
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
}
