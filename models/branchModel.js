const db = require('../config/database');
const mssql = require('mssql');

async function findByBrchCode(BrchCode) {
    const pool = await db.connectDatabase();
    const result = await pool.request()
        .input('BrchCode', mssql.NVarChar, BrchCode)
        .query('SELECT BrchName, BrchLat, BrchLong FROM BRANCH WHERE BrchCode = @BrchCode');
    return result.recordset[0];
}

module.exports = {
    findByBrchCode
};