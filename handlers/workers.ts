/**
 * El punto de entrada de AWS Lambda para SQS (Workers)
 * Capa: Frameworks & Drivers
 * 
 * Procesa mensajes de SQS que vienen de SNS
 * Existen dos workers: uno para Perú y otro para Chile
 * Ambos usan la misma lógica pero se conectan a distintas BDs
 */
import { ISQSEvent, ISQSHandlerResponse } from '../src/shared/types';
import { getGlobalContainer } from '../src/di/container';
import { SQSHandler } from '../src/interfaces/sqs/SQSHandler';

/**
 * Worker for Perú
 * Procesa citas que vienen desde la cola SQS de Perú
 * Filtra automáticamente por countryISO = "pe"
 */
export const appointment_pe = async (
    event: ISQSEvent
): Promise<ISQSHandlerResponse> => {
    try {
        const container = getGlobalContainer();
        const handler = container.get<SQSHandler>('sqsHandler');
        return await handler.handleSQSEvent(event);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error en appointment_pe:', error);
        
        // Re-lanzar para que SQS lo maneje y reintente
        throw new Error(`Worker PE failed: ${errorMessage}`);
    }
};

/**
 * Worker for Chile
 * Procesa citas que vienen desde la cola SQS de Chile
 * Filtra automáticamente por countryISO = "cl"
 */
export const appointment_cl = async (
    event: ISQSEvent
): Promise<ISQSHandlerResponse> => {
    try {
        const container = getGlobalContainer();
        const handler = container.get<SQSHandler>('sqsHandler');
        return await handler.handleSQSEvent(event);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error en appointment_cl:', error);
        
        // Re-lanzar para que SQS lo maneje y reintente
        throw new Error(`Worker CL failed: ${errorMessage}`);
    }
};
