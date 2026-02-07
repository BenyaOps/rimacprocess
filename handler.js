import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({});

// LAMBDA A: Solo publica en SNS
export const publicador = async (event) => {
    const body = JSON.parse(event.body);
    
    await snsClient.send(new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Message: JSON.stringify(body),
        Subject: "Nuevo Evento de Usuario"
    }));

    return { 
        statusCode: 200, 
        body: JSON.stringify({ mensaje: "Evento publicado en SNS y distribuido a SQS" }) 
    };
};

// LAMBDA B: Procesa lo que llega de la cola
export const worker = async (event) => {
    for (const record of event.Records) {
        // OJO: SNS mete su mensaje dentro del campo 'body' de SQS
        const snsMessage = JSON.parse(record.body);
        const userData = JSON.parse(snsMessage.Message);
        
        console.log("LOGISTICA: Procesando pedido para el usuario:", userData.nombre);
        // Aquí podrías hacer un fetch a una API externa o guardar en DB
    }
};