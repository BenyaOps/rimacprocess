import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';

/**
 * Implementación de Repositorio con DynamoDB
 * Capa: Infraestructura
 */
export class DynamoDBRepository extends IAppointmentRepository {
    constructor(tableName) {
        super();
        this.tableName = tableName;
        this.docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    }

    async save(appointment) {
        try {
            await this.docClient.send(new PutCommand({
                TableName: this.tableName,
                Item: appointment.toPlainObject()
            }));
            return appointment.toPlainObject();
        } catch (error) {
            console.error('Error guardando en DynamoDB:', error);
            throw error;
        }
    }

    async findAll(userId) {
        try {
            const result = await this.docClient.send(new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'userId = :id',
                ExpressionAttributeValues: { ':id': userId }
            }));
            return result.Items || [];
        } catch (error) {
            console.error('Error consultando DynamoDB:', error);
            throw error;
        }
    }

    async findById(userId) {
        // Puede implementarse si se necesita
        throw new Error('Método no implementado para DynamoDB');
    }

    async update(appointment) {
        // Puede implementarse si se necesita
        throw new Error('Método no implementado para DynamoDB');
    }
}
