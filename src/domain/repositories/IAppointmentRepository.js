/**
 * Interface para Repositorio de Appointments - Capa de Dominio
 * Define los contratos que deben implementar los repositorios
 */
export class IAppointmentRepository {
    async save(appointment) {
        throw new Error('Method save() must be implemented');
    }

    async findById(userId) {
        throw new Error('Method findById() must be implemented');
    }

    async findAll(userId) {
        throw new Error('Method findAll() must be implemented');
    }

    async update(appointment) {
        throw new Error('Method update() must be implemented');
    }
}
