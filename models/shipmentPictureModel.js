const db = require('../config/database');
const mssql = require('mssql');

async function insertShipmentImage(ShipPicPath, ShipPicUpdate, ShipPicTypeCode, ShipPicInvoiceCode) {
    const pool = await db.connectDatabase();
    const result = await pool.request()
        .input('ShipPicPath', mssql.NVarChar, ShipPicPath)
        .input('ShipPicUpdate', mssql.DateTimeOffset, ShipPicUpdate)
        .input('ShipPicTypeCode', mssql.Int, ShipPicTypeCode)
        .input('ShipPicInvoiceCode', mssql.NVarChar, ShipPicInvoiceCode)
        .query(`
            INSERT INTO SHIPMENT_PICTURE
                (ShipPicPath, ShipPicUpdate, ShipPicTypeCode, ShipPicInvoiceCode)
            OUTPUT INSERTED.ShipPicSeq
            VALUES (@ShipPicPath, @ShipPicUpdate, @ShipPicTypeCode, @ShipPicInvoiceCode)
            `);

    return result.recordset[0].ShipPiceq;
}

module.exports = {
    insertShipmentImage
};