// config/db.js
import pg from 'pg';
import 'dotenv/config'; // Asegúrate de cargar dotenv

const pool = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

pool.on('error', (err, client) => {
    console.error('Error inesperado en el pool de conexiones', err);
    process.exit(-1);
});

console.log('Pool de conexión a PostgreSQL creado.');

export default pool;