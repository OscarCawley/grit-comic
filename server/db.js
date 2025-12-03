const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,          // Azure SQL username
    password: process.env.DB_PASSWORD,  // Azure SQL password
    server: process.env.DB_HOST,        // e.g. myserver.database.windows.net
    database: process.env.DB_NAME,      // database name
    port: Number(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true,                  // REQUIRED for Azure
        trustServerCertificate: false
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = {
    sql,
    query: async (query, params = {}) => {
        try {
            await poolConnect;

            const request = pool.request();

            // Auto detect values and bind parameters
            for (const [key, value] of Object.entries(params)) {
                let type = sql.NVarChar;
                if (typeof value === "number") type = sql.Int;
                else if (typeof value === "boolean") type = sql.Bit;
                else if (value instanceof Date) type = sql.DateTime2;

                request.input(key, type, value);
            }

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error("SQL error", err);
            throw err;
        }
    }
};