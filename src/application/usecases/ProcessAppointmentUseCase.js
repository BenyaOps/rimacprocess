/**
 * Caso de Uso: Procesar Cita en la base de datos regional
 * Capa: Aplicación
 * Responsabilidades:
 * - Procesar mensajes de SQS/SNS
 * - Guardar en base de datos regional
 * - Manejar errores
 */
export class ProcessAppointmentUseCase {
    constructor(regionalRepository) {
        this.regionalRepository = regionalRepository;
    }

    async execute(appointmentData) {
        // 1. Validar datos
        if (!appointmentData.userId || !appointmentData.nombre) {
            throw new Error('Datos inválidos para procesar cita');
        }

        // 2. Guardar en base de datos regional (Postgres)
        const result = await this.regionalRepository.save({
            user_id: appointmentData.userId,
            nombre: appointmentData.nombre,
            created_at: new Date()
        });

        return {
            message: 'Cita procesada exitosamente',
            data: result
        };
    }
}
