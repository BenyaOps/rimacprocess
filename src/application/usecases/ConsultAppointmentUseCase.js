/**
 * Caso de Uso: Consultar Citas
 * Capa: Aplicación
 * Responsabilidades:
 * - Validar parámetros de entrada
 * - Obtener datos del repositorio
 * - Retornar en formato DTO
 */
export class ConsultAppointmentUseCase {
    constructor(appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    async execute(userId) {
        // 1. Validar entrada
        if (!userId) {
            throw new Error('userId es requerido');
        }

        // 2. Obtener del repositorio
        const appointments = await this.appointmentRepository.findAll(userId);

        // 3. Retornar resultados
        return {
            total: appointments.length,
            items: appointments
        };
    }
}
