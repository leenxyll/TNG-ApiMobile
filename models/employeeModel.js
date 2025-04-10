const db = require('../config/database');
const mssql = require('mssql');

async function findByEmpCode(EmpCode) {
    const pool = await db.connectDatabase();
    const result = await pool.request()
        .input('EmpCode', mssql.Int, EmpCode)
        .query('SELECT EmpBrchCode FROM EMPLOYEE WHERE EmpCode = @EmpCode');
    return result.recordset[0];
}

module.exports = {
    findByEmpCode
};