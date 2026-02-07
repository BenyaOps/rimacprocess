import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutItemCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "RimacTable";

export const crearUsuario = async (event) => {
    const body = JSON.parse(event.body);
    const params = {
        TableName: TABLE_NAME,
        Item: { ...body, createdAt: new Date().toISOString() }
    };
    await docClient.send(new PutItemCommand(params));
    return { statusCode: 201, body: JSON.stringify({ message: "Creado" }) };
};

export const obtenerUsuario = async (event) => {
    const { userId } = event.pathParameters;
    const params = {
        TableName: TABLE_NAME,
        Key: { userId }
    };
    const { Item } = await docClient.send(new GetCommand(params));
    return Item 
        ? { statusCode: 200, body: JSON.stringify(Item) }
        : { statusCode: 404, body: JSON.stringify({ message: "No encontrado" }) };
};