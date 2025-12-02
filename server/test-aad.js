const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: true
  },
  authentication: {
    type: 'azure-active-directory-password',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  }
};

async function test() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to Azure SQL via AAD password!');
    pool.close();
  } catch (err) {
    console.error(err);
  }
}

test();