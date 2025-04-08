// db.js
const sql = require('mssql');

const config = {
  user: 'constitutionvault',
  password: 'Code@mash',
  server: 'constitutionvault.database.windows.net',
  database: 'constitutionvault',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

module.exports = {
  sql,
  config
};
