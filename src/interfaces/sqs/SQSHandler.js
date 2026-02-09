/**
 * Manejador SQS - Capa de Interfaces/Adapters
 * Procesa mensajes de SQS/SNS
 */
export class SQSHandler {
    constructor(processUseCase) {
        this.processUseCase = processUseCase;
    }

    /**
     * Procesa eventos de SQS
     * Los mensajes vienen envueltos por SQS desde SNS
     */
    async handleSQSEvent(event) {
        try {
            const results = [];

            for (const record of event.Records) {
                try {
                    // SQS envía el mensaje de SNS en el body
                    const snsMessage = JSON.parse(record.body);
                    const appointmentData = JSON.parse(snsMessage.Message);

                    console.log(`Procesando cita para ${appointmentData.countryISO}:`, appointmentData.nombre);

                    // Ejecutar caso de uso
                    const result = await this.processUseCase.execute(appointmentData);
                    results.push({
                        messageId: record.messageId,
                        status: 'success',
                        data: result
                    });
                } catch (error) {
                    console.error('Error procesando mensaje individual:', error);
                    // Re-lanzar error para que SQS reintente
                    throw error;
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Mensajes procesados',
                    results
                })
            };
        } catch (error) {
            console.error('Error en SQSHandler:', error);
            throw error;
        }
    }
}
