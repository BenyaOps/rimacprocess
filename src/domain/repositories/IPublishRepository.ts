import { IMessageAttributes } from '../../shared/types';

/**
 * Interface para Repositorio de Publicación - Capa de Dominio
 * Define los contratos para publicar mensajes
 */
export interface IPublishRepository {
    /**
     * Publica un mensaje a un topic/canal
     * @param topic - Topic/Canal a donde publicar (ej: SNS Topic ARN)
     * @param message - Mensaje a publicar
     * @param attributes - Atributos opcionales del mensaje
     */
    publish(
        topic: string,
        message: string,
        attributes?: IMessageAttributes
    ): Promise<{ MessageId: string }>;
}
