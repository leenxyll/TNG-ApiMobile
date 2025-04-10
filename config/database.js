const mssql = require('mssql');
const moment = require("moment");
require('dotenv').config();

const config = {
    user: process.env.DB_USER,  // ชื่อผู้ใช้ (User) สำหรับเชื่อมต่อ SQL Server
    password: process.env.DB_PASSWORD,  // รหัสผ่าน (Password)
    server: process.env.DB_SERVER,  // ชื่อหรือ IP ของเซิร์ฟเวอร์ SQL Server
    database: process.env.DB_DATABASE,  // ชื่อฐานข้อมูล (Database)
    options: {
        encrypt: true,  // การเข้ารหัสการเชื่อมต่อ
        trustServerCertificate: true  // ยอมรับใบรับรองของเซิร์ฟเวอร์
    }
};

async function connectDatabase() {
    try {
        const pool = await mssql.connect(config);  // เชื่อมต่อฐานข้อมูลและสร้าง connection pool
        console.log('Connected to SQL Server successfully.');
        return pool;  // คืนค่า pool ที่เชื่อมต่อแล้ว
    } catch (err) {
        console.error('Error connecting to database:', err);  // แสดงข้อผิดพลาดเมื่อไม่สามารถเชื่อมต่อได้
        throw err;  // ข้อผิดพลาดจะถูกโยนออกไปเพื่อจัดการในที่อื่น
    }
}

module.exports = {
    connectDatabase
};