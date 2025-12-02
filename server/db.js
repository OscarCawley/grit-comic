// db.js
const sql = require('mssql');
require('dotenv').config();
const { ClientSecretCredential } = require('@azure/identity');

// Create an Azure AD credential using a service principal
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID,
  process.env.AZURE_CLIENT_ID,
  process.env.AZURE_CLIENT_SECRET
);

const pool = new sql.ConnectionPool({
  server: process.env.DB_HOST,      // e.g., myserver.database.windows.net
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: true,                  // required for Azure
    trustServerCertificate: false
  },
  authentication: {
    type: 'azure-active-directory-access-token',
    options: {
      token: async () => {
        // Acquire a token for Azure SQL
        const tokenResponse = await credential.getToken('https://database.windows.net//.default');
        return tokenResponse.token;
      }
    }
  }
});

// Export a connected pool for queries
module.exports = {
  query: async (query, params = {}) => {
    try {
      if (!pool.connected) await pool.connect();

      const request = pool.request();

      for (const [key, value] of Object.entries(params)) {
        let type = sql.NVarChar;
        if (typeof value === 'number') type = sql.Int;
        else if (typeof value === 'boolean') type = sql.Bit;
        else if (value instanceof Date) type = sql.DateTime2;

        request.input(key, type, value);
      }

      const result = await request.query(query);
      return result.recordset;
    } catch (err) {
      console.error('SQL error', err);
      throw err;
    }
  },
  sql
};