const mysql = require('mysql');

const config = {
    multipleStatements: true,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'perpustakaan',
};

const pool = mysql.createPool(config);

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

module.exports = pool;

