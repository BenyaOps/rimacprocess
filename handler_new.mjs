/**
 * El punto de entrada de AWS Lambda para HTTP
 * Capa: Frameworks & Drivers
 * 
 * Usa el contenedor DI para obtener dependencias
 * Delegua la lógica al controlador HTTP
 */
import { createContainer } from './src/di/container.js';

let container = null;

/**
 * Inicializa el contenedor una única vez
 */
const getContainer = () => {
    if (!container) {
        container = createContainer();
    }
    return container;
};

/**
 * Handler para POST /registrar
 */
export const consultarDynamo = async (event) => {
    try {
        const container = getContainer();
        const controller = container.get('httpController');
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
        console.error('Error en handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
