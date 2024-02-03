const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT
});

connection.connect((err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the database');
});

module.exports = connection;