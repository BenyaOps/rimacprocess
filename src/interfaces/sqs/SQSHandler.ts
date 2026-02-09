import { ProcessAppointmentUseCase } from '../../application/usecases/ProcessAppointmentUseCase.js';
import { ISQSEvent, ISNSMessageFromSQS, ISQSHandlerResponse } from '../../shared/types.js';

/**
 * Manejador SQS - Capa de Interfaces/Adapters
 * Procesa mensajes de SQS que vienen de SNS
 */
export class SQSHandler {
    constructor(private readonly processUseCase: ProcessAppointmentUseCase) {}

    /**
     * Procesa eventos de SQS
     * Los mensajes vienen envueltos por SQS desde SNS
     */
    async handleSQSEvent(event: ISQSEvent): Promise<ISQSHandlerResponse> {
        try {
            const results: unknown[] = [];

            for (const record of event.Records) {
                try {
                    // SQS envía el mensaje de SNS en el body (envuelto)
                    let snsMessage: ISNSMessageFromSQS;
                    
                    try {
                        snsMessage = JSON.parse(record.body);
                    } catch (e) {
                        console.error('Error parseando SQS body:', e);
                        throw new Error('Body de SQS no es JSON válido');
                    }

                    // Extraer el mensaje de SNS
                    let appointmentData: Record<string, unknown>;
                    
                    try {
                        appointmentData = JSON.parse(snsMessage.Message);
                    } catch (e) {
                        console.error('Error parseando SNS Message:', e);
                        throw new Error('Message de SNS no es JSON válido');
                    }

                    console.log(
                        `Procesando cita para ${appointmentData.countryISO}:`,
                        appointmentData.nombre
                    );

                    // Ejecutar caso de uso
                    const result = await this.processUseCase.execute(appointmentData);
                    
                    results.push({
                        messageId: record.messageId,
                        status: 'success',
                        data: result
                    });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                    console.error('Error procesando mensaje individual:', error);
                    
                    // Re-lanzar error para que SQS reintente
                    throw new Error(`Error procesando mensaje: ${errorMessage}`);
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Mensajes procesados exitosamente',
                    count: results.length,
                    results
                })
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('Error en SQSHandler:', error);
            
            // Re-lanzar para que Lambda lo maneje
            throw new Error(`SQSHandler error: ${errorMessage}`);
        }
    }
}
