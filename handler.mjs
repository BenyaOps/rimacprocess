import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const snsClient = new SNSClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const consultarDynamo = async (event) => {
    const metodo = event.requestContext.http.method; // "POST" o "GET"
    try {
        if (metodo === 'POST') {
        const body = JSON.parse(event.body);
        const { countryISO, userId, nombre, insuredId, scheduleId } = body;

        // 1. Guardar en DynamoDB
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: { 
                userId, 
                nombre, 
                countryISO, 
                insuredId, 
                scheduleId, 
                timestamp: new Date().toISOString(),
                status: "pending",
                createdAt: new Date().toISOString() 
            }
        }));

        // 2. Publicar en SNS con Atributos de Filtro
        await snsClient.send(new PublishCommand({
            TopicArn: process.env.TOPIC_ARN,
            Message: JSON.stringify(body),
            MessageAttributes: {
                "countryISO": {
                    DataType: "String",
                    StringValue: countryISO.toLowerCase()
                }
            }
        }));
        return { statusCode: 200, body: JSON.stringify({ message: "Procesado en Dynamo y SNS", data: body }) };

        } else if (metodo === 'GET') {
            const userId = event.pathParameters.userId;
            // Buscamos en DynamoDB todos los registros para ese userId
            // Nota: Esto asume que userId es tu Partition Key
            const result = await docClient.send(new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "userId = :id",
                ExpressionAttributeValues: { ":id": userId }
            }));

            return {
                statusCode: 200,
                body: JSON.stringify({
                    total: result.Count,
                    items: result.Items
                })
            };
        }
        
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};