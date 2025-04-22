// controllers/tripController.js
const invoiceModel = require('../models/invoiceModel'); // Import Model
const trackingController = require('../controllers/trackingController'); // Import Pusher
const moment = require("moment");

async function updateInvoiceStatus(req, res) {
    let { InvoiceShipLogCode, InvoiceShipLogSeq, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode } = req.body;
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

  try {
    const rowsAffected = await invoiceModel.updateInvoiceStatus(InvoiceShipLogCode, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode);

    if (rowsAffected > 0) {
      console.log('Update invoice status: ', InvoiceShipLogCode, 'success');
      trackingController.updateShippingStatus(InvoiceShipLogCode, InvoiceShipLogStatusCode);
        res.status(200).json({ status: true, message: 'อัปเดทสถานะ Invoice สำเร็จ' });
    }else{
      console.error('Invoice not found:', InvoiceShipLogCode, 'cannot update status');
        res.status(404).json({ status: false, message: 'ไม่พบ Invoice' });
    }


  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
  }
}

// async function uploadShipmentImage(req, res) {
//   let { InvoiceShipLogCode, InvoiceShipLogSeq, InvoiceShipLogUpdate } = req.body;
// }

module.exports = {
    updateInvoiceStatus,
    // uploadShipmentImage
};