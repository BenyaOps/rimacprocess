/**
 * El punto de entrada de AWS Lambda para HTTP
 * Capa: Frameworks & Drivers
 * 
 * Usa el contenedor DI para obtener dependencias
 * Delega la lógica al controlador HTTP
 */
import { IHttpEvent, ILambdaResponse } from '../src/shared/types.js';
import { getGlobalContainer } from '../src/di/container.js';
import { HTTPController } from '../src/interfaces/http/HTTPController.js';

/**
 * Handler para POST /registrar y GET /consultar/{userId}
 */
export const consultarDynamo = async (
    event: IHttpEvent
): Promise<ILambdaResponse> => {
    try {
        const container = getGlobalContainer();
        const controller = container.get<HTTPController>('httpController');
        const method = event.requestContext.http.method;

        if (method === 'POST') {
            return await controller.registerAppointment(event);
        } else if (method === 'GET') {
            return await controller.consultAppointment(event);
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Método no permitido' })
            };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error en handler HTTP:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ error: errorMessage })
        };
    }
};
