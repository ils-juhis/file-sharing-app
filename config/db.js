const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "fileDownloader",
  multipleStatements: true // to send multiple query
});

module.exports = db;