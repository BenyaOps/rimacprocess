import { Appointment } from '../../domain/entities/Appointment.js';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { IPublishRepository } from '../../domain/repositories/IPublishRepository.js';
import { AppointmentDTO } from '../dtos/AppointmentDTO.js';
import { IAppointment, IUseCaseResponse } from '../../shared/types.js';

/**
 * Caso de Uso: Registrar una Cita
 * Capa: Aplicación
 * Responsabilidades:
 * - Validar el input (DTO)
 * - Crear la entidad de dominio
 * - Guardar en repositorio
 * - Publicar evento
 */
export class RegisterAppointmentUseCase {
    constructor(
        private readonly appointmentRepository: IAppointmentRepository,
        private readonly publishRepository: IPublishRepository
    ) {}

    /**
     * Ejecuta el caso de uso de registrar cita
     * @param appointmentDTO - DTO con los datos de la cita
     * @param topicArn - ARN del topic SNS
     * @returns Respuesta con la cita registrada
     * @throws ValidationError si los datos no son válidos
     */
    async execute(
        appointmentDTO: AppointmentDTO,
        topicArn: string
    ): Promise<IUseCaseResponse<IAppointment>> {
        // 1. Validar DTO
        appointmentDTO.validate();

        // 2. Crear entidad de dominio
        const appointment = new Appointment(
            appointmentDTO.userId,
            appointmentDTO.nombre,
            appointmentDTO.countryISO,
            appointmentDTO.insuredId,
            appointmentDTO.scheduleId
        );

        // 3. Validar entidad
        appointment.validate();

        // 4. Guardar en repositorio
        const savedAppointment = await this.appointmentRepository.save(appointment);

        // 5. Publicar en SNS con atributos de filtro
        await this.publishRepository.publish(
            topicArn,
            JSON.stringify(savedAppointment),
            {
                countryISO: {
                    DataType: 'String',
                    StringValue: appointment.countryISO.toLowerCase()
                }
            }
        );

        return {
            message: 'Cita registrada exitosamente',
            data: savedAppointment
        };
    }
}
