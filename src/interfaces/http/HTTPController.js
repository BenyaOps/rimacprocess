import { AppointmentDTO } from '../../application/dtos/AppointmentDTO.js';

/**
 * Controlador HTTP - Capa de Interfaces/Adapters
 * Maneja las solicitudes HTTP y las convierte en casos de uso
 */
export class HTTPController {
    constructor(registerUseCase, consultUseCase) {
        this.registerUseCase = registerUseCase;
        this.consultUseCase = consultUseCase;
    }

    /**
     * POST /registrar
     * Registra una nueva cita
     */
    async registerAppointment(event) {
        try {
            const body = JSON.parse(event.body);
            
            // Crear DTO desde los datos de entrada
            const appointmentDTO = new AppointmentDTO(body);

            // Ejecutar caso de uso
            const result = await this.registerUseCase.execute(
                appointmentDTO,
                process.env.TOPIC_ARN
            );

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.error('Error en registerAppointment:', error);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message })
            };
        }
    }

    /**
     * GET /consultar/{userId}
     * Consulta citas de un usuario
     */
    async consultAppointment(event) {
        try {
            const userId = event.pathParameters.userId;

            // Ejecutar caso de uso
            const result = await this.consultUseCase.execute(userId);

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.error('Error en consultAppointment:', error);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
}
