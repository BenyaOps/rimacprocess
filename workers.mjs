import pkg from 'pg';
const { Pool } = pkg;

// Configuración genérica para conectar a Postgres
const createWorker = async (event, dbConfig) => {
    const pool = new Pool({
        host: dbConfig.host,
        database: dbConfig.name,
        user: dbConfig.user,
        password: dbConfig.pass,
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    try {
        for (const record of event.Records) {
            const snsMessage = JSON.parse(record.body);
            const data = JSON.parse(snsMessage.Message);

            console.log(`Insertando en Postgres (${data.countryISO}):`, data.nombre);
            // Usamos parámetros para evitar SQL Injection
            const query = "INSERT INTO appointments (user_id, nombre, created_at) VALUES ($1, $2, NOW())";
            await client.query(query, [data.userId, data.nombre]);
        }
    } finally {
        client.release();
        await pool.end();
    }
};

export const appointment_pe = async (event) => {
    await createWorker(event, {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS
    });
};

export const appointment_cl = async (event) => {
    await createWorker(event, {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS
    });
};