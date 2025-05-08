const db = require('../config/database');
const mssql = require('mssql');

async function getSubIssue(){
  try {
    const pool = await db.connectDatabase();

    const result = await pool.request()
        .query(`SELECT * FROM SUB_ISSUE_TYPE`);

    if (result.recordset && result.recordset.length > 0) {
      return result.recordset;
    } else {
      return [];
    }
  } catch (err) {
    console.error('Error in getSubIssue:', err);
    throw err;
  } 
}

async function insertIssue(transaction, IssueDescription, IssueLat, IssueLong, IssueCreated, IssueSubCode) {
  const result = await transaction.request()
      .input('IssueDescription', mssql.NVarChar, IssueDescription)
      .input('IssueLat', mssql.Float, IssueLat)
      .input('IssueLong', mssql.Float, IssueLong)
      .input('IssueCreated', mssql.DateTimeOffset, IssueCreated)
      .input('IssueSubCode', mssql.Int, IssueSubCode)
      .query(`
          INSERT INTO ISSUE 
              (IssueDescription, IssueLat, IssueLong, IssueCreated, IssueSubCode) 
          OUTPUT INSERTED.IssueCode
          VALUES (@IssueDescription, @IssueLat, @IssueLong, @IssueCreated, @IssueSubCode)
      `);

  return result.recordset[0].IssueCode;
}

module.exports = {
  getSubIssue,
  insertIssue
};