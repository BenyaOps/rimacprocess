import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({});

export const publicador = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { countryISO, nombre } = body;

        const params = {
            TopicArn: process.env.TOPIC_ARN,
            Message: JSON.stringify(body),
            Subject: "Nuevo Registro con Filtro",
            // ESTO ACTIVA EL FILTRO EN SNS:
            MessageAttributes: {
                "countryISO": {
                    DataType: "String",
                    StringValue: countryISO.toLowerCase()
                },
                "nombre": {
                    DataType: "String",
                    StringValue: nombre
                }
            }
        };

        await snsClient.send(new PublishCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Estimado ${nombre}, Enviado con éxito para ${countryISO}` })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};