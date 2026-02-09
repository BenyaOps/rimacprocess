/**
 * Interface para Repositorio de Publicación - Capa de Dominio
 * Define los contratos para publicar mensajes
 */
export class IPublishRepository {
    async publish(topic, message, attributes) {
        throw new Error('Method publish() must be implemented');
    }
}
