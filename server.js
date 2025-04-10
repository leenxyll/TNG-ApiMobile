// var express = require('express');
// var cors = require('cors');

// var app = express();
// app.use(cors());
// app.use(express.json());  // ต้องใช้ express.json() เพื่อให้รับค่า body แบบ JSON ได้
// require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/driver');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/driver', driverRoutes);

app.get('/test', function (req, res) {
    res.json({msg : 'This is a test message'});
});



// // อ่านข้อมูลจาก SHIP_LOCATION
// app.get("/ShipLocation/all", async function (req, res) {
//     try {
//         const pool = await connectDatabase();  // รอให้เชื่อมต่อฐานข้อมูลก่อน
//         const result = await pool.request().query('SELECT * FROM SHIP_LOCATION');
//         res.status(200).json(result.recordset);  // ส่งผลลัพธ์กลับไป
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Database Error");
//     }
// });

// // อ่านข้อมูลจาก TRUCK
// app.get("/Truck/all", async function (req, res) {
//     try {
//         const pool = await connectDatabase();  // รอให้เชื่อมต่อฐานข้อมูลก่อน
//         const result = await pool.request().query('SELECT * FROM TRUCK');
//         res.status(200).json(result.recordset);  // ส่งผลลัพธ์กลับไป
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Database Error");
//     }
// });

// // อ่านข้อมูลจาก SHIP_LOCATION โดยใช้ query parameter
// app.get("/GetShipLocation", async (req, res) => {
//     const { ShipLoAddr } = req.query;

//     if (!ShipLoAddr) {
//         return res.status(400).json({ error: "Missing ShipLoAddr parameter" });
//     }

//     try {
//         const pool = await connectDatabase();
//         const result = await pool.request()
//             .input('ShipLoAddr', mssql.NVarChar, ShipLoAddr)  // ใส่ค่าตัวแปรเข้าไปใน SQL
//             .query('SELECT * FROM SHIP_LOCATION WHERE ShipLoAddr = @ShipLoAddr');
        
//         if (result.recordset.length === 0) {
//             return res.status(404).json({ message: "No ShipLoCode found for this ShipLoAddr" });
//         }

//         return res.status(200).json(result.recordset[0]);
//     } catch (err) {
//         console.error("Database Error:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // อ่านข้อมูลจาก TRUCK โดยใช้ query parameter
// app.get("/GetTruck", async (req, res) => {
//     const { TruckReg } = req.query;

//     if (!TruckReg) {
//         return res.status(400).json({ error: "Missing TruckReg parameter" });
//     }

//     try {
//         const pool = await connectDatabase();
//         const result = await pool.request()
//             .input('TruckReg', mssql.NVarChar, TruckReg)
//             .query('SELECT * FROM TRUCK WHERE TruckReg = @TruckReg');

//         if (result.recordset.length === 0) {
//             return res.status(404).json({ message: "No Truck found for this TruckReg" });
//         }

//         return res.status(200).json(result.recordset[0]);
//     } catch (err) {
//         console.error("Database Error:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // เพิ่มข้อมูล TRUCK
// app.post('/CreateTruck', async (req, res) => {
//     const { TruckReg } = req.body;

//     try {
//         const pool = await connectDatabase();
//         const result = await pool.request()
//             .input('TruckReg', mssql.NVarChar, TruckReg)
//             .query('INSERT INTO TRUCK (TruckReg) VALUES (@TruckReg)');

//         res.status(201).json({ message: "Truck created successfully!", TruckCode: result.rowsAffected[0] });
//     } catch (err) {
//         console.error("Error inserting Truck:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // เพิ่มข้อมูล Trip
// app.post('/CreateTrip', async (req, res) => {
//     const { TripTruckCode } = req.body;

//     if (!TripTruckCode) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     try {
//         const pool = await connectDatabase();
//         const result = await pool.request()
//             .input('TripTruckCode', mssql.Int, TripTruckCode)
//             .query(`
//                 INSERT INTO TRIP (TripTruckCode) VALUES (@TripTruckCode);
//                 SELECT SCOPE_IDENTITY() AS TripCode;
//             `);

            
//         // ดึงค่า TripCode ที่เพิ่งถูกเพิ่ม
//         const insertedTripCode = result.recordset[0].TripCode;
//         console.log("insertedTripCode:", insertedTripCode);

//         res.status(201).json({ message: "Trip created successfully!", TripCode: insertedTripCode });
//     } catch (err) {
//         console.error("Error inserting Trip:", err);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // เพิ่มข้อมูล ShipLocation
// app.post("/CreateShipLocation", async (req, res) => {
//     const { ShipLoLat, ShipLoLong, ShipLoAddr, ShipLoAddr2 } = req.body;

//     if (!ShipLoLat || !ShipLoLong || !ShipLoAddr) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     try {
//         const pool = await connectDatabase();
//         const result = await pool.request()
//             .input('ShipLoLat', mssql.Float, ShipLoLat)
//             .input('ShipLoLong', mssql.Float, ShipLoLong)
//             .input('ShipLoAddr', mssql.NVarChar, ShipLoAddr)
//             .input('ShipLoAddr2', mssql.NVarChar, ShipLoAddr2)
//             .query(`
//                 INSERT INTO SHIP_LOCATION (ShipLoLat, ShipLoLong, ShipLoAddr, ShipLoAddr2) VALUES (@ShipLoLat, @ShipLoLong, @ShipLoAddr, @ShipLoAddr2);
//                 SELECT SCOPE_IDENTITY() AS ShipLoCode
//                 `);

//                         // ดึงค่า TripCode ที่เพิ่งถูกเพิ่ม
//         const insertedShipLoCode = result.recordset[0].ShipLoCode;
//         console.log("insertedTripCode:", insertedShipLoCode);

//         res.status(201).json({ message: "Ship location created successfully!", ShipLoCode: insertedShipLoCode });
//     } catch (err) {
//         console.error("Error inserting ship location:", err);
//         return res.status(500).json({ error: "Database error" });
//     }
// });

// // Create Shipment List
// app.post("/CreateShipmentList", async (req, res) => {
//     const { ShipListSeq, ShipListTripCode, ShipListShipLoCode } = req.body;
//     console.log("Received ShipListSeq:", ShipListSeq);

//     if (!ShipListSeq || !ShipListTripCode || !ShipListShipLoCode) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }

//     try {
//         const pool = await connectDatabase();
//         const result = await pool.request()
//             .input('ShipListSeq', mssql.Int, ShipListSeq)
//             .input('ShipListTripCode', mssql.Int, ShipListTripCode)
//             .input('ShipListShipLoCode', mssql.Int, ShipListShipLoCode)
//             .query(`
//                 INSERT INTO SHIPMENT_LIST (ShipListSeq, ShipListTripCode, ShipListShipLoCode)
//                 VALUES (@ShipListSeq, @ShipListTripCode, @ShipListShipLoCode)
//             `);
//         return res.status(201).json({ message: "Shipment list created successfully!", ShipListSeq });
//     } catch (err) {
//         console.error("⚠️ Error inserting shipment list:", err);
//         return res.status(500).json({ error: "Database error" });
//     }
// });

// // Update Shipment List
// app.patch("/UpdateShipmentList", async (req, res) => {
//     let { ShipListTripCode, ShipListSeq, ShipListShipLoCode, ShipListStatus, LatUpdateStatus, LongUpdateStatus, LastUpdateStatus } = req.body;

//     // Convert LastUpdateStatus from String to DATETIME
//     LastUpdateStatus = moment(LastUpdateStatus, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

//     try {
//         const pool = await connectDatabase();
//         await pool.request()
//             .input('ShipListShipLoCode', mssql.Int, ShipListShipLoCode)
//             .input('ShipListStatus', mssql.NVarChar, ShipListStatus)
//             .input('LatUpdateStatus', mssql.Decimal, LatUpdateStatus)
//             .input('LongUpdateStatus', mssql.Decimal, LongUpdateStatus)
//             .input('LastUpdateStatus', mssql.DateTime, LastUpdateStatus)
//             .input('ShipListTripCode', mssql.Int, ShipListTripCode)
//             .input('ShipListSeq', mssql.Int, ShipListSeq)
//             .query(`
//                 UPDATE SHIPMENT_LIST 
//                 SET ShipListShipLoCode = @ShipListShipLoCode, 
//                     ShipListStatus = @ShipListStatus, 
//                     LatUpdateStatus = @LatUpdateStatus, 
//                     LongUpdateStatus = @LongUpdateStatus, 
//                     LastUpdateStatus = @LastUpdateStatus 
//                 WHERE ShipListTripCode = @ShipListTripCode AND ShipListSeq = @ShipListSeq
//             `);
//         res.status(200).json({ message: "Shipment list updated successfully!" });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send();
//     }
// });

// // Update Trip
// app.patch("/UpdateTrip", async (req, res) => {
//     let { TripCode, TripTruckCode, TripMileageIn, TripMileageOut, TripTimeIn, TripTimeOut } = req.body;

//     // Check which fields have been provided and update them
//     let updateFields = [];
//     let queryParams = [];

//     if (TripMileageIn !== null) {
//         updateFields.push("TripMileageIn = @TripMileageIn");
//         queryParams.push(TripMileageIn);
//     }
//     if (TripMileageOut !== null) {
//         updateFields.push("TripMileageOut = @TripMileageOut");
//         queryParams.push(TripMileageOut);
//     }
//     if (TripTimeIn !== null) {
//         TripTimeIn = moment(TripTimeIn, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
//         updateFields.push("TripTimeIn = @TripTimeIn");
//         queryParams.push(TripTimeIn);
//     }
//     if (TripTimeOut !== null) {
//         TripTimeOut = moment(TripTimeOut, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
//         updateFields.push("TripTimeOut = @TripTimeOut");
//         queryParams.push(TripTimeOut);
//     }

//     // Add TripCode to queryParams
//     queryParams.push(TripCode);

//     const queryString = `UPDATE TRIP SET ${updateFields.join(", ")} WHERE TripCode = @TripCode`;

//     // try {
//     //     const pool = await connectDatabase();
//     //     await pool.request().query(queryString, queryParams);
//     //     res.status(200).json({ message: "Trip details updated successfully!" });
//     // } catch (err) {
//     //     console.log(err);
//     //     return res.status(500).send();
//     // }
//     try {
//         const pool = await connectDatabase();
//         await pool.request()
//             .input('TripCode', mssql.Int, TripCode)            // ประเภท Int
//             .input('TripTruckCode', mssql.Int, TripTruckCode)   // ประเภท Int
//             .input('TripMileageIn', mssql.Decimal, TripMileageIn) // ประเภท Decimal
//             .input('TripMileageOut', mssql.Decimal, TripMileageOut) // ประเภท Decimal
//             .input('TripTimeIn', mssql.DateTime, TripTimeIn)     // ประเภท DateTime
//             .input('TripTimeOut', mssql.DateTime, TripTimeOut)   // ประเภท DateTime
//             .query(queryString, queryParams);
//         res.status(200).json({ message: "Trip details updated successfully!" });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send();
//     }
// });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });