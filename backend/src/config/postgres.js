import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    max: 10, // connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL error', err);
    process.exit(1);
});

// module.exports = pool;
export default pool;