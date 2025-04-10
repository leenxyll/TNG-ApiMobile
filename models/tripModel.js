// models/tripShipmentModel.js

const db = require('../config/database');
const mssql = require('mssql');

async function getTripsAndShipmentsByDriver(empCode) {
  try {
    const pool = await db.connectDatabase();

    const result = await pool.request()
      .input('empCode', mssql.Int, empCode)
      .query(`
        SELECT
          t.TripCode,
          sl.*,
          i.InvoiceCusCode,
          c.CusName,
          i.InvoiceShipLoCode,
          l.ShipLoAddr,
          l.ShipLoLat,
          l.ShipLoLong,
          i.InvoiceReceiverName,
          i.InvoiceReceiverPhone,
          i.InvoiceNote
        FROM
          TRIP AS t
        INNER JOIN
          SHIPMENT_LIST AS sl ON t.TripCode = sl.ShipListTripCode
        INNER JOIN
          SHIPMENT_STAFF AS ss ON t.TripCode = ss.ShipStaffTripCode
        LEFT JOIN
          INVOICE AS i ON sl.ShipListInvoiceCode = i.InvoiceCode
        LEFT JOIN
          SHIP_LOCATION AS l ON i.InvoiceShipLoCode = l.ShipLoCode        
        LEFT JOIN
          CUSTOMER AS c ON i.InvoiceCusCode = c.CusCode
        WHERE
          t.TripStatusCode = 1
          AND ss.ShipStaffEmpCode = @empCode
          AND ss.ShipStaffIsDriver = 'Y';
      `);



    if (result.recordset && result.recordset.length > 0) {
      return result.recordset;
    } else {
      return [];
    }
  } catch (err) {
    console.error('Error in getTripsAndShipmentsByDriver:', err);
    throw err;
  } 
}

// ขาด TripShipUpdateEmp, TripShipUpdateLat, TripShipUpdateLong, TripStatusLastUpdate
async function updateTrip(transaction, TripCode, TripTimeIn, TripTimeOut, TripShipUpdateEmp, TripShipUpdateLat, TripShipUpdateLong, TripStatusLastUpdate) {
      // Check which fields have been provided and update them
    let updateFields = [];
    let queryParams = [];

    if (TripTimeIn !== null && TripTimeIn !== undefined) {
      if(!TripTimeIn){
          TripTimeIn = null;
      }else{
          // TripTimeIn = moment(TripTimeIn, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
      }
      updateFields.push("TripTimeIn = @TripTimeIn");
      queryParams.push(TripTimeIn);
      updateFields.push("TripStatusCode = 3"); // เพิ่ม TripStatusCode = 3
      updateFields.push("TripShipUpdateEmp = @TripShipUpdateEmp");
      updateFields.push("TripShipUpdateLat = @TripShipUpdateLat");
      updateFields.push("TripShipUpdateLong = @TripShipUpdateLong");
      updateFields.push("TripStatusLastUpdate = @TripStatusLastUpdate");

      queryParams.push(TripShipUpdateEmp);
      queryParams.push(TripShipUpdateLat);
      queryParams.push(TripShipUpdateLong);
      queryParams.push(TripStatusLastUpdate);

    }

    if (TripTimeOut !== null && TripTimeOut !== undefined) {
        if(!TripTimeOut){
            TripTimeOut = null;
        }else{
        // TripTimeOut = moment(TripTimeOut, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
        }
        updateFields.push("TripTimeOut = @TripTimeOut");
        queryParams.push(TripTimeOut);
    }

    // Add TripCode to queryParams
    queryParams.push(TripCode);

    const queryString = `UPDATE TRIP SET ${updateFields.join(", ")} WHERE TripCode = @TripCode`;

    const result = await transaction.request()
      .input('TripCode', mssql.NVarChar, TripCode)            // ประเภท Int
      .input('TripTimeIn', mssql.DateTimeOffset, TripTimeIn)     // ประเภท DateTime
      .input('TripTimeOut', mssql.DateTimeOffset, TripTimeOut)   // ประเภท DateTime      
      .input('TripShipUpdateEmp', mssql.Int, TripShipUpdateEmp)            
      .input('TripShipUpdateLat', mssql.Float, TripShipUpdateLat)     
      .input('TripShipUpdateLong', mssql.Float, TripShipUpdateLong)   
      .input('TripStatusLastUpdate', mssql.DateTimeOffset, TripStatusLastUpdate)   
      .query(queryString, queryParams);
    return result.rowsAffected[0]; // คืนค่าจำนวนแถวที่ถูกอัปเดต
}

module.exports = {
  getTripsAndShipmentsByDriver,
  updateTrip
};