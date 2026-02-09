import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { IPublishRepository } from '../../domain/repositories/IPublishRepository.js';

/**
 * Implementación de Repositorio de Publicación con SNS
 * Capa: Infraestructura
 */
export class SNSPublisher extends IPublishRepository {
    constructor() {
        super();
        this.snsClient = new SNSClient({});
    }

    async publish(topicArn, message, messageAttributes = {}) {
        try {
            const command = new PublishCommand({
                TopicArn: topicArn,
                Message: message,
                MessageAttributes: messageAttributes
            });

            const result = await this.snsClient.send(command);
            console.log('Mensaje publicado en SNS:', result.MessageId);
            return result;
        } catch (error) {
            console.error('Error publicando en SNS:', error);
            throw error;
        }
    }
}
