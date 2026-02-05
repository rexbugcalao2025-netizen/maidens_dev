require('dotenv').config();
const pool = require('../config/postgres');


(async () => {
    const result = await pool.query('SELECT NOW()');
    console.log('Postgres time: ', result.rows[0]);    
    process.exit(0);
})();