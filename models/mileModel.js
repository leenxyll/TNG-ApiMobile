// models/mileModel.js

const db = require('../config/database');
const mssql = require('mssql');
async function insertMile(transaction, MileLogTripCode, MileLogRecord, MileLogUpdate, MileLogLat, MileLogLong, MileLogTypeCode) { 
    const result = await transaction.request()
        .input('MileLogTripCode', mssql.NVarChar, MileLogTripCode)
        .input('MileLogRecord', mssql.Int, MileLogRecord)
        .input('MileLogUpdate', mssql.DateTimeOffset, MileLogUpdate)
        .input('MileLogLat', mssql.Float, MileLogLat)
        .input('MileLogLong', mssql.Float, MileLogLong)
        .input('MileLogTypeCode', mssql.Int, MileLogTypeCode)
        .query(`
            INSERT INTO MILEAGE_LOG 
                (MileLogTripCode, MileLogRecord, MileLogLat, MileLogLong, MileLogUpdate, MileLogTypeCode) 
            OUTPUT INSERTED.MileLogSeq
            VALUES (@MileLogTripCode, @MileLogRecord, @MileLogLat, @MileLogLong, @MileLogUpdate, @MileLogTypeCode)
        `);

    return result.recordset[0].MileLogSeq;
}


async function updateMileImage(MileLogSeq, MileLogTripCode, MileLogRecord, MileLogUpdate, MileLogPicPath) {
    const pool = await db.connectDatabase();
    const result = await pool.request()
        .input('MileLogSeq', mssql.Int, MileLogSeq)
        .input('MileLogTripCode', mssql.NVarChar, MileLogTripCode)
        .input('MileLogRecord', mssql.Int, MileLogRecord)
        // .input('MileLogUpdate', mssql.DateTimeOffset, MileLogUpdate)
        .input('MileLogPicPath', mssql.NVarChar, MileLogPicPath)
        .query(`UPDATE MILEAGE_LOG 
                SET MileLogPicPath = @MileLogPicPath
                WHERE MileLogTripCode = @MileLogTripCode AND MileLogRecord = @MileLogRecord AND MileLogSeq = @MileLogSeq`);
    return result.rowsAffected[0];
}


module.exports = {
    insertMile,
    updateMileImage
};

