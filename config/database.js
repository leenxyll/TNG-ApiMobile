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

// เก็บ pool ที่เชื่อมต่อไว้ที่นี่
let poolInstance = null;

async function connectDatabase() {
    if (poolInstance) {
        return poolInstance; // ถ้ามี pool อยู่แล้ว ให้ใช้ตัวเดิม
    }

    try {
        poolInstance = await mssql.connect(config); // เชื่อมต่อครั้งแรก
        console.log('Connected to SQL Server successfully.');
        return poolInstance;
    } catch (err) {
        console.error('Error connecting to database:', err);
        poolInstance = null; // กรณีเชื่อมต่อล้มเหลว ต้อง reset เป็น null
        throw err;
    }
}

module.exports = {
    connectDatabase
};