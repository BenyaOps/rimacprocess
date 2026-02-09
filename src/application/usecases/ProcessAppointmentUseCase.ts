import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { IPostgresAppointment, IUseCaseResponse } from '../../shared/types';

/**
 * Caso de Uso: Procesar Cita en la base de datos regional
 * Capa: Aplicación
 * Responsabilidades:
 * - Procesar mensajes de SQS/SNS
 * - Guardar en base de datos regional
 * - Manejar errores
 */
export class ProcessAppointmentUseCase {
    constructor(private readonly regionalRepository: IAppointmentRepository) {}

    /**
     * Ejecuta el caso de uso de procesar cita
     * @param appointmentData - Datos de la cita desde SNS/SQS
     * @returns Respuesta con la cita procesada
     * @throws ValidationError si los datos no son válidos
     */
    async execute(
        appointmentData: Record<string, unknown>
    ): Promise<IUseCaseResponse<IPostgresAppointment>> {
        // 1. Validar datos
        if (!appointmentData.insuredId || !appointmentData.nombre) {
            throw new Error('insuredId y nombre son requeridos para procesar cita');
        }

        // 2. Guardar en base de datos regional (Postgres)
        const postgresData: IPostgresAppointment = {
            insured_id: String(appointmentData.insuredId),
            nombre: String(appointmentData.nombre),
            created_at: new Date()
        };

        // Como el repositorio espera un Appointment, adaptamos los datos
        // En un caso real, podrías crear un repositorio menos tipado o adaptar
        const result = await this.regionalRepository.save({
            insuredId: String(appointmentData.insuredId),
            nombre: String(appointmentData.nombre),
            countryISO: String(appointmentData.countryISO || ''),
            timestamp: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        } as any);

        return {
            message: 'Cita procesada exitosamente',
            data: postgresData
        };
    }
}
