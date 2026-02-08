import mysql from 'mysql2/promise';

export const appointmentPE = async (event) => {
    // 1. Crear la conexión (Lo ideal es usar un Pool fuera del handler, pero vamos paso a paso)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        for (const record of event.Records) {
            // SQS envía el mensaje de SNS en el body
            const snsMessage = JSON.parse(record.body);
            const data = JSON.parse(snsMessage.Message);

            console.log(`INSERTANDO EN MYSQL PERÚ: ${data.nombre}`);

            // 2. Ejecutar el Insert
            const query = "INSERT INTO appointments (user_id, nombre, fecha) VALUES (?, ?, ?)";
            const values = [data.userId || 'N/A', data.nombre, new Date()];
            
            await connection.execute(query, values);
        }
    } catch (error) {
        console.error("ERROR EN MYSQL PE:", error);
        throw error; // Si lanzas el error, el mensaje vuelve a SQS para reintentar (Importante)
    } finally {
        await connection.end();
    }
};