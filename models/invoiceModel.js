const db = require('../config/database');
const mssql = require('mssql');

async function updateInvoiceStatus(InvoiceShipLogCode, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode) {
    const pool = await db.connectDatabase();
    const result = await pool.request()
        .input('InvoiceShipLogCode', mssql.NVarChar, InvoiceShipLogCode)
        .input('InvoiceShipLogStatusCode', mssql.Int, InvoiceShipLogStatusCode)
        .input('InvoiceShipLogUpdate', mssql.DateTimeOffset, InvoiceShipLogUpdate)
        .input('InvoiceShipLogLat', mssql.Float, InvoiceShipLogLat)
        .input('InvoiceShipLogLong', mssql.Float, InvoiceShipLogLong)
        .input('InvoiceShipLogEmpCode', mssql.Int, InvoiceShipLogEmpCode)
        .query(`UPDATE INVOICE 
                SET InvoiceShipStatusCode = @InvoiceShipLogStatusCode, 
                    InvoiceShipStatusLastUpdate = @InvoiceShipLogUpdate, 
                    InvoiceShipUpdateLat = @InvoiceShipLogLat, 
                    InvoiceShipUpdateLong = @InvoiceShipLogLong, 
                    InvoiceShipUpdateEmpCode = @InvoiceShipLogEmpCode 
            WHERE InvoiceCode = @InvoiceShipLogCode`);
    return result.rowsAffected[0]; // คืนค่าจำนวนแถวที่ถูกอัปเดต
}

module.exports = {
    updateInvoiceStatus
};