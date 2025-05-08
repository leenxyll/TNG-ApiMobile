// controllers/tripController.js
const db = require('../config/database');
const invoiceModel = require('../models/invoiceModel'); // Import Model
const trackingController = require('../controllers/trackingController'); // Import Pusher
const shipmentPictureModel = require('../models/shipmentPictureModel'); // Import Model สำหรับจัดการภาพถ่าย
const issueModel = require('../models/issueModel'); // Import Model สำหรับจัดการภาพถ่าย
const path = require('path');
const moment = require("moment");
const fs = require('fs').promises;

async function updateInvoiceStatus(req, res) {
    let { InvoiceShipLogCode, InvoiceShipLogSeq, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode, InvoiceShipLogIssueDescription, InvoiceShipLogSubCode } = req.body;
    // Convert LastUpdateStatus from String to DATETIME
    InvoiceShipLogUpdate = moment(InvoiceShipLogUpdate, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

    if (!InvoiceShipLogCode || !InvoiceShipLogStatusCode || !InvoiceShipLogUpdate || !InvoiceShipLogLat || !InvoiceShipLogLong || !InvoiceShipLogEmpCode) {
      const missingFields = [];
      if (!InvoiceShipLogCode) missingFields.push('InvoiceShipLogCode');
      // if (!InvoiceShipLogSeq) missingFields.push('InvoiceShipLogSeq');
      if (!InvoiceShipLogStatusCode) missingFields.push('InvoiceShipLogStatusCode');
      if (!InvoiceShipLogUpdate) missingFields.push('InvoiceShipLogUpdate');
      if (!InvoiceShipLogLat) missingFields.push('InvoiceShipLogLat');
      if (!InvoiceShipLogLong) missingFields.push('InvoiceShipLogLong');
      if (!InvoiceShipLogEmpCode) missingFields.push('InvoiceShipLogEmpCode');

      console.error('Missing fields:', missingFields, 'to update invoice status');
  
      return res.status(400).json({
          status: false,
          message: 'ข้อมูลอัปเดทสถานะไม่ครบ',
          missingFields: missingFields
      });
    }

      let transaction;
      let began = false;
  
      try {
          const pool = await db.connectDatabase();
          transaction = pool.transaction();
          await transaction.begin();
          began = true;
  
          let rowsAffected = 0;
          if(InvoiceShipLogStatusCode === 5){
              console.log('Update invoice status:', InvoiceShipLogCode, 'to 5 (issue)');
              const issueCode = await issueModel.insertIssue(transaction, InvoiceShipLogIssueDescription, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogUpdate, InvoiceShipLogSubCode);
              rowsAffected = await invoiceModel.updateInvoiceStatus(transaction, InvoiceShipLogCode, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode, issueCode);
          }else if(InvoiceShipLogStatusCode === 1 || InvoiceShipLogStatusCode === 2 || InvoiceShipLogStatusCode === 3 || InvoiceShipLogStatusCode === 4){
              console.log('Update invoice status:', InvoiceShipLogCode, 'to', InvoiceShipLogStatusCode);
              rowsAffected = await invoiceModel.updateInvoiceStatus(transaction, InvoiceShipLogCode, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode, null);
          }else{
            console.error('transaction rollback for updateInvoiceStatus');
            await transaction.rollback();
            return res.status(400).json({ status: false, message: 'InvoiceShipLogStatusCode ไม่ถูกต้อง' });
          }

          await transaction.commit();

          if (rowsAffected > 0) {
            console.log('Update invoice status:', InvoiceShipLogCode, 'success');
            trackingController.updateShippingStatus(InvoiceShipLogCode, InvoiceShipLogStatusCode);
              res.status(200).json({ status: true, message: 'อัปเดทสถานะ Invoice สำเร็จ' });
          }else{
            console.error('Cannot update invoice status:', InvoiceShipLogCode);
              res.status(404).json({ status: false, message: 'อัปเดทสถานะ Invoice ไม่สำเร็จ' });
          }
  
      } catch (error) {
          if (transaction && began) {
              await transaction.rollback();
          }
          console.error('Error update invoice status:', error);
          return res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการบันทึก' });
      }
}

async function uploadShipmentImage(req, res) {
  let { ShipPicInvoiceCode, ShipPicTypeCode, ShipPicUpdate } = req.body;
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);

  if (!ShipPicInvoiceCode || !ShipPicTypeCode || !ShipPicUpdate) {
    const missingFields = [];
    if (!ShipPicInvoiceCode) missingFields.push('ShipPicInvoiceCode');
    if (!ShipPicTypeCode) missingFields.push('ShipPicTypeCode');
    if (!ShipPicUpdate) missingFields.push('ShipPicUpdate');

    console.error('Missing fields:', missingFields, 'to upload shipment image');

    return res.status(400).json({
        status: false,
        message: 'ข้อมูลอัปโหลดภาพไม่ครบ',
        missingFields: missingFields
    });
  }
  

  
  try {

    const savedPaths = [];
    
    const files = req.files.images || []; // กรณีใช้ multer แบบ field

    ShipPicTypeCode = Array.isArray(ShipPicTypeCode) ? ShipPicTypeCode.map(code => parseInt(code)) : parseInt(ShipPicTypeCode);
    console.log('ShipPicTypeCode:', ShipPicTypeCode);
    
    for (let i = 0; i < files.length; i++) {
        let typeCode = Array.isArray(ShipPicTypeCode) ? ShipPicTypeCode[i] : ShipPicTypeCode;
        let invoiceCode = Array.isArray(ShipPicInvoiceCode) ? ShipPicInvoiceCode[i] : ShipPicInvoiceCode;
        let updateTime = Array.isArray(ShipPicUpdate) ? ShipPicUpdate[i] : ShipPicUpdate;
        updateTime = moment(ShipPicUpdate, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
        let timeStamp = moment(updateTime).format("YYYYMMDD_HHmmss");
        const file = files[i];
        
        const folderPrefix = invoiceCode.slice(0, 2).toUpperCase(); // เช่น AB
        const targetDir = path.join(process.env.FOLDER_PATH+"/shipmentPicture", folderPrefix); // โฟลเดอร์ปลายทาง
        const filename = `${invoiceCode}_Shipment_${timeStamp}${i + 1}${path.extname(file.originalname)}`;
        const newPath = path.join(targetDir, filename);

          // สร้างโฟลเดอร์ถ้ายังไม่มี
          await fs.mkdir(targetDir, { recursive: true });

          await fs.copyFile(file.path, newPath);
          await fs.unlink(file.path); // ลบ temp file

          savedPaths.push(newPath);
          console.log(`File saved to: ${newPath}`);

          // เก็บลง DB ทีละรูป
          await shipmentPictureModel.insertShipmentImage(newPath, updateTime, typeCode, invoiceCode);
      }

      console.log(`Upload ${savedPaths.length} shipment image(s) for invoice ${ShipPicInvoiceCode} success`);

      return res.status(200).json({
          status: true,
          message: 'อัปโหลดรูปภาพสำเร็จ',
          files: savedPaths
      });
  } catch (err) {
      console.error('Upload shipment image error:', err);
      return res.status(500).json({
          status: false,
          message: 'เกิดข้อผิดพลาดในการอัปโหลดรูป'
      });
  }

}

module.exports = {
    updateInvoiceStatus,
    uploadShipmentImage
};