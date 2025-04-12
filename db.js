// db.js
const sql = require('mssql');

const config = {
  user: 'constitutionvault',
  password: 'Code@cruseders',
  server: 'constitutionvault2.database.windows.net',
  database: 'constitutionvault',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

module.exports = { sql, config };

