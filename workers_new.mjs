/**
 * El punto de entrada de AWS Lambda para SQS (Workers)
 * Capa: Frameworks & Drivers
 * 
 * Procesa mensajes de SQS que vienen de SNS
 * Existen dos workers: uno para Perú y otro para Chile
 * Ambos usan la misma lógica pero se conectan a distintas BDs
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
 * Worker for Perú
 * Procesa citas para Perú
 */
export const appointment_pe = async (event) => {
    try {
        const container = getContainer();
        const handler = container.get('sqsHandler');
        return await handler.handleSQSEvent(event);
    } catch (error) {
        console.error('Error en appointment_pe:', error);
        throw error; // Re-lanzar para que SQS reintente
    }
};

/**
 * Worker for Chile
 * Procesa citas para Chile
 */
export const appointment_cl = async (event) => {
    try {
        const container = getContainer();
        const handler = container.get('sqsHandler');
        return await handler.handleSQSEvent(event);
    } catch (error) {
        console.error('Error en appointment_cl:', error);
        throw error; // Re-lanzar para que SQS reintente
    }
};
