import { AppointmentDTO } from '../../application/dtos/AppointmentDTO.js';
import { RegisterAppointmentUseCase } from '../../application/usecases/RegisterAppointmentUseCase.js';
import { ConsultAppointmentUseCase } from '../../application/usecases/ConsultAppointmentUseCase.js';
import { IHttpEvent, ILambdaResponse, ValidationError } from '../../shared/types.js';

/**
 * Controlador HTTP - Capa de Interfaces/Adapters
 * Maneja las solicitudes HTTP y las convierte en casos de uso
 */
export class HTTPController {
    constructor(
        private readonly registerUseCase: RegisterAppointmentUseCase,
        private readonly consultUseCase: ConsultAppointmentUseCase
    ) {}

    /**
     * POST /registrar
     * Registra una nueva cita
     */
    async registerAppointment(event: IHttpEvent): Promise<ILambdaResponse> {
        try {
            let body: Record<string, unknown>;
            
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Body inválido, no es JSON válido' })
                };
            }

            // Crear DTO desde los datos de entrada
            const appointmentDTO = new AppointmentDTO({
                userId: String(body.userId || ''),
                nombre: String(body.nombre || ''),
                countryISO: String(body.countryISO || ''),
                insuredId: body.insuredId ? String(body.insuredId) : undefined,
                scheduleId: body.scheduleId ? String(body.scheduleId) : undefined
            });

            // Ejecutar caso de uso
            const result = await this.registerUseCase.execute(
                appointmentDTO,
                process.env.TOPIC_ARN || ''
            );

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('Error en registerAppointment:', error);

            const statusCode = error instanceof ValidationError ? 400 : 500;
            
            return {
                statusCode,
                body: JSON.stringify({ error: errorMessage })
            };
        }
    }

    /**
     * GET /consultar/{userId}
     * Consulta citas de un usuario
     */
    async consultAppointment(event: IHttpEvent): Promise<ILambdaResponse> {
        try {
            const userId = event.pathParameters?.userId;

            if (!userId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'userId es requerido' })
                };
            }

            // Ejecutar caso de uso
            const result = await this.consultUseCase.execute(userId);

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('Error en consultAppointment:', error);

            return {
                statusCode: 500,
                body: JSON.stringify({ error: errorMessage })
            };
        }
    }
}
