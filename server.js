var express = require('express');
var cors = require('cors');
const mssql = require('mssql');
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

var app = express();
app.use(cors());
app.use(express.json());  // ต้องใช้ express.json() เพื่อให้รับค่า body แบบ JSON ได้

app.get('/test', function (req, res) {
    res.json({msg : 'This is a test message'});
});

// อ่านข้อมูลจาก SHIP_LOCATION
app.get("/ShipLocation/all", async function (req, res) {
    try {
        const pool = await connectDatabase();  // รอให้เชื่อมต่อฐานข้อมูลก่อน
        const result = await pool.request().query('SELECT * FROM SHIP_LOCATION');
        res.status(200).json(result.recordset);  // ส่งผลลัพธ์กลับไป
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

// อ่านข้อมูลจาก TRUCK
app.get("/Truck/all", async function (req, res) {
    try {
        const pool = await connectDatabase();  // รอให้เชื่อมต่อฐานข้อมูลก่อน
        const result = await pool.request().query('SELECT * FROM TRUCK');
        res.status(200).json(result.recordset);  // ส่งผลลัพธ์กลับไป
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

// อ่านข้อมูลจาก SHIP_LOCATION โดยใช้ query parameter
app.get("/GetShipLocation", async (req, res) => {
    const { ShipLoAddr } = req.query;

    if (!ShipLoAddr) {
        return res.status(400).json({ error: "Missing ShipLoAddr parameter" });
    }

    try {
        const pool = await connectDatabase();
        const result = await pool.request()
            .input('ShipLoAddr', mssql.NVarChar, ShipLoAddr)  // ใส่ค่าตัวแปรเข้าไปใน SQL
            .query('SELECT * FROM SHIP_LOCATION WHERE ShipLoAddr = @ShipLoAddr');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No ShipLoCode found for this ShipLoAddr" });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// อ่านข้อมูลจาก TRUCK โดยใช้ query parameter
app.get("/GetTruck", async (req, res) => {
    const { TruckReg } = req.query;

    if (!TruckReg) {
        return res.status(400).json({ error: "Missing TruckReg parameter" });
    }

    try {
        const pool = await connectDatabase();
        const result = await pool.request()
            .input('TruckReg', mssql.NVarChar, TruckReg)
            .query('SELECT * FROM TRUCK WHERE TruckReg = @TruckReg');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "No Truck found for this TruckReg" });
        }

        return res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// เพิ่มข้อมูล TRUCK
app.post('/CreateTruck', async (req, res) => {
    const { TruckReg } = req.body;

    try {
        const pool = await connectDatabase();
        const result = await pool.request()
            .input('TruckReg', mssql.NVarChar, TruckReg)
            .query('INSERT INTO TRUCK (TruckReg) VALUES (@TruckReg)');

        res.status(201).json({ message: "Truck created successfully!", TruckCode: result.rowsAffected[0] });
    } catch (err) {
        console.error("Error inserting Truck:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// เพิ่มข้อมูล Trip
app.post('/CreateTrip', async (req, res) => {
    const { TripTruckCode } = req.body;

    if (!TripTruckCode) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const pool = await connectDatabase();
        const result = await pool.request()
            .input('TripTruckCode', mssql.Int, TripTruckCode)
            .query('INSERT INTO TRIP (TripTruckCode) VALUES (@TripTruckCode)');

        res.status(201).json({ message: "Trip created successfully!", TripCode: result.rowsAffected[0] });
    } catch (err) {
        console.error("Error inserting Trip:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// เพิ่มข้อมูล ShipLocation
app.post("/CreateShipLocation", async (req, res) => {
    const { ShipLoLat, ShipLoLong, ShipLoAddr, ShipLoAddr2 } = req.body;

    if (!ShipLoLat || !ShipLoLong || !ShipLoAddr) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const pool = await connectDatabase();
        const result = await pool.request()
            .input('ShipLoLat', mssql.Float, ShipLoLat)
            .input('ShipLoLong', mssql.Float, ShipLoLong)
            .input('ShipLoAddr', mssql.NVarChar, ShipLoAddr)
            .input('ShipLoAddr2', mssql.NVarChar, ShipLoAddr2)
            .query('INSERT INTO SHIP_LOCATION (ShipLoLat, ShipLoLong, ShipLoAddr, ShipLoAddr2) VALUES (@ShipLoLat, @ShipLoLong, @ShipLoAddr, @ShipLoAddr2)');

        res.status(201).json({ message: "Ship location created successfully!", ShipLoCode: result.rowsAffected[0] });
    } catch (err) {
        console.error("Error inserting ship location:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

app.listen(6868, function () {
    console.log('Server running on port 6868');
});