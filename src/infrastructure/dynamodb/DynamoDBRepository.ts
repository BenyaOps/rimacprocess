import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand as PutDocCommand,
    QueryCommand as QueryDocCommand
} from '@aws-sdk/lib-dynamodb';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { Appointment } from '../../domain/entities/Appointment';
import { IAppointment, InfrastructureError } from '../../shared/types';

/**
 * Implementación de Repositorio con DynamoDB
 * Capa: Infraestructura
 */
export class DynamoDBRepository implements IAppointmentRepository {
    private readonly docClient: DynamoDBDocumentClient;

    constructor(private readonly tableName: string) {
        this.docClient = DynamoDBDocumentClient.from(
            new DynamoDBClient({})
        );
    }

    /**
     * Guarda una cita en DynamoDB
     */
    async save(appointment: Appointment): Promise<IAppointment> {
        try {
            const item = appointment.toPlainObject();
            const command = new PutDocCommand({
                TableName: this.tableName,
                Item: item
            });
            await this.docClient.send(command);

            return item;
        } catch (error) {
            throw new InfrastructureError(
                `Error guardando en DynamoDB: ${(error as Error).message}`
            );
        }
    }

    /**
     * Obtiene todas las citas de un asegurado desde DynamoDB
     */
    async findAll(insuredId: string): Promise<IAppointment[]> {
        try {
            const result = await this.docClient.send(
                new QueryDocCommand({
                    TableName: this.tableName,
                    KeyConditionExpression: 'insuredId = :id',
                    ExpressionAttributeValues: {
                        ':id': insuredId
                    }
                })
            );

            return (result.Items as IAppointment[]) || [];
        } catch (error) {
            throw new InfrastructureError(
                `Error consultando DynamoDB: ${(error as Error).message}`
            );
        }
    }

    /**
     * Encuentra una cita por ID
     * En DynamoDB, hacer esto requeriría un scan o una índice global
     * Por ahora lanzamos error
     */
    async findById(insuredId: string | number): Promise<IAppointment | null> {
        throw new InfrastructureError(
            'Método findById() no implementado para DynamoDB. Usar findAll() con insuredId.'
        );
    }

    /**
     * Actualiza una cita
     * Puede implementarse si se necesita
     */
    async update(appointment: Appointment): Promise<IAppointment> {
        throw new InfrastructureError(
            'Método update() no implementado para DynamoDB'
        );
    }
}
