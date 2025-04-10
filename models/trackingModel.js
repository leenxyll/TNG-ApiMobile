const db = require('../config/database');
const mssql = require('mssql');

async function findBroadCastByInvoice(InvoiceCode) {
    const pool = await db.connectDatabase();
    const result = await pool.request()
        .input('InvoiceCode', mssql.NVarChar, InvoiceCode)
        .query('SELECT BroadcastInvLineID FROM INVOICE_BROADCAST WHERE BroadcastInvInvoice = @InvoiceCode');
    return result.recordset;
}

module.exports = {
    findBroadCastByInvoice
};
