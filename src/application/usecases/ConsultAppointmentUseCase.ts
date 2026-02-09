import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { IAppointment, IUseCaseResponse } from '../../shared/types.js';

/**
 * Caso de Uso: Consultar Citas
 * Capa: Aplicación
 * Responsabilidades:
 * - Validar parámetros de entrada
 * - Obtener datos del repositorio
 * - Retornar en formato DTO
 */
export class ConsultAppointmentUseCase {
    constructor(private readonly appointmentRepository: IAppointmentRepository) {}

    /**
     * Ejecuta el caso de uso de consultar citas
     * @param userId - ID del usuario
     * @returns Array de citas del usuario
     * @throws ValidationError si userId es inválido
     */
    async execute(
        userId: string
    ): Promise<IUseCaseResponse<IAppointment[]>> {
        // 1. Validar entrada
        if (!userId || userId.trim().length === 0) {
            throw new Error('userId es requerido');
        }

        // 2. Obtener del repositorio
        const appointments = await this.appointmentRepository.findAll(userId);

        // 3. Retornar resultados
        return {
            message: `Se encontraron ${appointments.length} citas`,
            data: appointments
        };
    }
}
