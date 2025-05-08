const db = require('../config/database');
const mileModel = require('../models/mileModel');
const tripModel = require('../models/tripModel');
const path = require('path');
const moment = require('moment');
const { timeStamp } = require('console');
const fs = require('fs').promises;

async function createMileageLog(req, res) {
    let { MileLogTripCode, MileLogRecord, MileLogUpdate, MileLogLat, MileLogLong, MileLogTypeCode, TripShipUpdateEmp } = req.body;

    if (!MileLogTripCode || MileLogRecord === undefined || MileLogRecord === null || !MileLogUpdate || !MileLogLat || !MileLogLong || !MileLogTypeCode) {
        const missingFields = [];
        if (!MileLogTripCode) missingFields.push('MileLogTripCode');
        if (!MileLogRecord) missingFields.push('MileLogRecord');
        if (!MileLogUpdate) missingFields.push('MileLogUpdate');
        if (!MileLogLat) missingFields.push('MileLogLat');
        if (!MileLogLong) missingFields.push('MileLogLong');
        if (!MileLogTypeCode) missingFields.push('MileLogTypeCode');

        console.error('Missing fields:', missingFields, 'to create mileage log');

        return res.status(400).json({
            status: false,
            message: 'ข้อมูลบันทึกเลขไมล์ไม่ครบ',
            missingFields: missingFields
        });
    }

    MileLogUpdate = moment(MileLogUpdate, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

    let transaction;
    let began = false;

    try {
        const pool = await db.connectDatabase();
        transaction = pool.transaction();
        await transaction.begin();
        began = true;

        const mileLogSeq = await mileModel.insertMile(transaction, MileLogTripCode, MileLogRecord, MileLogUpdate, MileLogLat, MileLogLong, MileLogTypeCode);

        // เช็คว่าได้ค่า MileLogSeq กลับมารึเปล่า
        let rowsAffected1 = mileLogSeq ? 1 : 0;

        let rowsAffected2 = 0;
        if (MileLogTypeCode === 1) {
            console.log('Update trip timeout by mileage type:', MileLogTypeCode);
            rowsAffected2 = await tripModel.updateTrip(transaction, MileLogTripCode, null, MileLogUpdate, TripShipUpdateEmp, MileLogLat, MileLogLong, MileLogUpdate);
        } else if (MileLogTypeCode === 2) {
            console.log('Update trip timein by milleage type:', MileLogTypeCode);
            rowsAffected2 = await tripModel.updateTrip(transaction, MileLogTripCode, MileLogUpdate, null, TripShipUpdateEmp, MileLogLat, MileLogLong, MileLogUpdate);
        } else if (MileLogTypeCode === 3) {
            rowsAffected2 = 999;
        } else {
            console.error('transaction rollback for craeteMileageLog and updateTrip');
            await transaction.rollback();
            return res.status(400).json({ status: false, message: 'MileLogTypeCode ไม่ถูกต้อง' });
        }

        await transaction.commit();

        if (rowsAffected1 > 0 && rowsAffected2 > 0) {
            console.log('Create mileage log:', mileLogSeq ,'for', MileLogTripCode, 'success');
            return res.status(200).json({ 
                status: true, 
                message: 'บันทึกข้อมูลเลขไมล์สำเร็จ',
                MileLogSeq: mileLogSeq // คืนค่าตัวนี้กลับไปให้ client ด้วย
            });
        } else {
            console.error('Cannot create mileage log:', mileLogSeq ,'for', MileLogTripCode);
            return res.status(404).json({ status: false, message: 'บันทึกข้อมูลเลขไมล์ไม่สำเร็จ' });
        }

    } catch (error) {
        if (transaction && began) {
            await transaction.rollback();
        }
        console.error('Error creating MileLog:', error);
        return res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการบันทึก' });
    }
}


async function uploadMileageLogImage(req, res) {
    let { MileLogTripCode, MileLogRecord, MileLogUpdate, MileLogSeq } = req.body;

    if (!MileLogTripCode || !MileLogRecord || !MileLogUpdate || !req.file || !MileLogSeq) {
        const missingFields = [];
        if (!MileLogTripCode) missingFields.push('MileLogTripCode');
        if (!MileLogRecord) missingFields.push('MileLogRecord');
        if (!MileLogUpdate) missingFields.push('MileLogUpdate');
        if (!MileLogSeq) missingFields.push('MileLogSeq');
        if (!req.file) missingFields.push('Picture');

        console.error('Missing fields:', missingFields, 'to update invoice status');

        return res.status(400).json({
            status: false,
            message: 'ข้อมูลบันทึกเลขไมล์ไม่ครบ',
            missingFields: missingFields
        });
    }

    MileLogUpdate = moment(MileLogUpdate, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    let timeStamp = moment(MileLogUpdate).format("YYYYMMDD_HHmmss");
    // สองตัวแรกของ TripCode
    const folderPrefix = MileLogTripCode.slice(0, 2).toUpperCase(); // เช่น AB
    const targetDir = path.join(process.env.FOLDER_PATH+"/mileage", folderPrefix); // โฟลเดอร์ปลายทาง

    const filename = `${MileLogTripCode}_Mileage_${timeStamp}${path.extname(req.file.originalname)}`;
    const newPath = path.join(targetDir, filename);
    try {
        // สร้างโฟลเดอร์ถ้ายังไม่มี
        await fs.mkdir(targetDir, { recursive: true });

        // คัดลอกไฟล์ไปยังตำแหน่งใหม่
        await fs.copyFile(req.file.path, newPath);
        await fs.unlink(req.file.path); // ลบไฟล์ต้นทางออก

        const rowsAffected = await mileModel.updateMileImage( MileLogSeq, MileLogTripCode, MileLogRecord, MileLogUpdate, newPath);

        if (rowsAffected > 0) {
            console.log('Upload image mileage log:', MileLogSeq ,'for', MileLogTripCode, 'success');
            return res.status(200).json({ status: true, message: 'อัปโหลดรูปภาพสำเร็จ' });
        } else {
            console.error('Cannot upload image mileage log:', MileLogSeq ,'for', MileLogTripCode);
            return res.status(404).json({ status: false, message: 'อัปโหลดรูปไม่สำเร็จ' });
        }
    } catch (err) {
        console.error('Upload image Error:', err);
        return res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการอัปโหลดรูป' });
    }
}


module.exports = {
    createMileageLog,
    uploadMileageLogImage
};