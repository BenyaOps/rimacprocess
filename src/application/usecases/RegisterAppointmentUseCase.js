import { Appointment } from '../../domain/entities/Appointment.js';
import { AppointmentDTO } from '../dtos/AppointmentDTO.js';

/**
 * Caso de Uso: Registrar una Cita
 * Capa: Aplicación
 * Responsabilidades:
 * - Validar el input
 * - Crear la entidad
 * - Guardar en repositorio
 * - Publicar evento
 */
export class RegisterAppointmentUseCase {
    constructor(appointmentRepository, publishRepository) {
        this.appointmentRepository = appointmentRepository;
        this.publishRepository = publishRepository;
    }

    async execute(appointmentDTO, topicArn) {
        // 1. Validar DTO
        if (!appointmentDTO.isValid()) {
            throw new Error('Datos inválidos para registrar la cita');
        }

        // 2. Crear entidad de dominio
        const appointment = new Appointment(
            appointmentDTO.userId,
            appointmentDTO.nombre,
            appointmentDTO.countryISO,
            appointmentDTO.insuredId,
            appointmentDTO.scheduleId
        );

        // 3. Validar entidad
        if (!appointment.isValid()) {
            throw new Error('La cita no es válida');
        }

        // 4. Guardar en repositorio
        await this.appointmentRepository.save(appointment);

        // 5. Publicar en SNS con atributos de filtro
        await this.publishRepository.publish(
            topicArn,
            JSON.stringify(appointment.toPlainObject()),
            {
                countryISO: {
                    DataType: 'String',
                    StringValue: appointment.countryISO.toLowerCase()
                }
            }
        );

        return {
            message: 'Cita registrada exitosamente',
            data: appointment.toPlainObject()
        };
    }
}
