const db = require('../config/database');
const mssql = require('mssql');

async function updateInvoiceStatus(transaction, InvoiceShipLogCode, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode, IssueCode) {
      // Check which fields have been provided and update them
        let updateFields = [];
        let queryParams = [];
    
        if (IssueCode !== null && IssueCode !== undefined) {
          if(!IssueCode){
              IssueCode = null;
          }
        }
        
        updateFields.push("InvoiceIssueCode = @IssueCode");
        queryParams.push(IssueCode);
        
        updateFields.push("InvoiceShipStatusCode = @InvoiceShipLogStatusCode");  
        updateFields.push("InvoiceShipStatusLastUpdate = @InvoiceShipLogUpdate");
        updateFields.push("InvoiceShipUpdateLat = @InvoiceShipLogLat");
        updateFields.push("InvoiceShipUpdateLong = @InvoiceShipLogLong");
        updateFields.push("InvoiceShipUpdateEmpCode = @InvoiceShipLogEmpCode");
  
        queryParams.push(InvoiceShipLogStatusCode);
        queryParams.push(InvoiceShipLogUpdate);
        queryParams.push(InvoiceShipLogLat);
        queryParams.push(InvoiceShipLogLong);
        queryParams.push(InvoiceShipLogEmpCode);

        queryParams.push(InvoiceShipLogCode);
    
        const queryString = `UPDATE INVOICE SET ${updateFields.join(", ")} WHERE InvoiceCode = @InvoiceShipLogCode`;
    
        const result = await transaction.request()
            .input('InvoiceShipLogCode', mssql.NVarChar, InvoiceShipLogCode)
            .input('InvoiceShipLogStatusCode', mssql.Int, InvoiceShipLogStatusCode)
            .input('InvoiceShipLogUpdate', mssql.DateTimeOffset, InvoiceShipLogUpdate)
            .input('InvoiceShipLogLat', mssql.Float, InvoiceShipLogLat)
            .input('InvoiceShipLogLong', mssql.Float, InvoiceShipLogLong)
            .input('InvoiceShipLogEmpCode', mssql.Int, InvoiceShipLogEmpCode) 
            .input('IssueCode', mssql.Int, IssueCode)
          .query(queryString, queryParams);
        return result.rowsAffected[0]; // คืนค่าจำนวนแถวที่ถูกอัปเดต
}

module.exports = {
    updateInvoiceStatus
};