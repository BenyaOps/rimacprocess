import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { IAppointment, IUseCaseResponse } from '../../shared/types';

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
     * @param insuredId - ID del asegurado
     * @returns Array de citas del asegurado
     * @throws ValidationError si insuredId es inválido
     */
    async execute(
        insuredId: string
    ): Promise<IUseCaseResponse<IAppointment[]>> {
        // 1. Validar entrada
        if (!insuredId || insuredId.trim().length === 0) {
            throw new Error('insuredId es requerido');
        }

        // 2. Obtener del repositorio
        const appointments = await this.appointmentRepository.findAll(insuredId);

        // 3. Retornar resultados
        return {
            message: `Se encontraron ${appointments.length} citas`,
            data: appointments
        };
    }
}
