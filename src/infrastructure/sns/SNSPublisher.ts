import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { IPublishRepository } from '../../domain/repositories/IPublishRepository';
import { IMessageAttributes, InfrastructureError } from '../../shared/types';

/**
 * Implementación de Repositorio de Publicación con SNS
 * Capa: Infraestructura
 */
export class SNSPublisher implements IPublishRepository {
    private readonly snsClient: SNSClient;

    constructor() {
        this.snsClient = new SNSClient({});
    }

    /**
     * Publica un mensaje en SNS
     */
    async publish(
        topicArn: string,
        message: string,
        messageAttributes?: IMessageAttributes
    ): Promise<{ MessageId: string }> {
        try {
            const command = new PublishCommand({
                TopicArn: topicArn,
                Message: message,
                MessageAttributes: messageAttributes
            });

            const result = await this.snsClient.send(command);
            
            if (!result.MessageId) {
                throw new InfrastructureError('No se recibió MessageId de SNS');
            }

            console.log('Mensaje publicado en SNS:', result.MessageId);
            
            return { MessageId: result.MessageId };
        } catch (error) {
            throw new InfrastructureError(
                `Error publicando en SNS: ${(error as Error).message}`
            );
        }
    }
}
