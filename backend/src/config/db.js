// src/config.db.js

import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // recommend defaults
    max: 10,                // connection pool size
    idle_timeout: 20,       // seconds
    connect_timeout: 10     // seconds
});

export default sql;