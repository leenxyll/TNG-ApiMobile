// controllers/tripController.js
const tripModel = require('../models/tripModel'); // Import tripModel

async function getTripsAndShipmentList(req, res) {
  const { EmpCode } = req.query;

  if (!EmpCode) {
    console.error('Missing EmpCode in request query');
    return res.status(400).json({ status: false, message: 'กรุณากรอกรหัสพนักงาน' });
  }

  try {
    const trip = await tripModel.getTripsAndShipmentsByDriver(EmpCode);

    if (!trip || trip.length === 0) {
      console.log('No trips found for employee:', EmpCode);
      return res.status(404).json({ status: false, message: 'ไม่พบรอบการส่ง' });
    }

    console.log('Get trips and shipments for employee:', EmpCode, 'success');
    res.status(200).json({
      status: true,
      message: 'พบรอบการส่ง',
      invoice: trip
    });
  } catch (error) {
    console.error('Error in getTripAndShipment:', error);
    res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
  }
}

// async function updateTrip(req, res) {
//     let { TripCode, TripTimeIn, TripTimeOut, TripStatusLastUpdate, TripStatusCode } = req.body;
//     // Convert LastUpdateStatus from String to DATETIME
//     TripStatusLastUpdate = moment(TripStatusLastUpdate, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

//   //   if (!TripCode || !TripStatusCode || !TripStatusLastUpdate) {
//   //     const missingFields = [];
//   //     if (!TripCode) missingFields.push('TripCode');
//   //     if (!TripStatusCode) missingFields.push('TripStatusCode');
//   //     if (!TripStatusLastUpdate) missingFields.push('TripStatusLastUpdate');
  
//   //     return res.status(400).json({
//   //         status: false,
//   //         message: 'ข้อมูลอัปเดทสถานะไม่ครบ',
//   //         missingFields: missingFields
//   //     });
//   // }

//   try {
//     const rowsAffected = await tripModel.updateTrip(TripCode, TripTimeIn, TripTimeOut, TripStatusLastUpdate, TripStatusCode);

//     if (rowsAffected > 0) {
//         res.status(200).json({ status: true, message: 'อัปเดท Trip สำเร็จ' });
//     }else{
//         res.status(404).json({ status: false, message: 'ไม่พบ Trip' });
//     }


//   } catch (error) {
//     console.error('Error updating invoice status:', error);
//     res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
//   }
  
// }

// async function updateTrip(req, res) {
//     let { InvoiceShipLogCode, InvoiceShipLogSeq, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode } = req.body;
//     // Convert LastUpdateStatus from String to DATETIME
//     InvoiceShipLogUpdate = moment(InvoiceShipLogUpdate, "DD/MM/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

//     if (!InvoiceShipLogCode || !InvoiceShipLogStatusCode || !InvoiceShipLogUpdate || !InvoiceShipLogLat || !InvoiceShipLogLong || !InvoiceShipLogEmpCode) {
//       const missingFields = [];
//       if (!InvoiceShipLogCode) missingFields.push('InvoiceShipLogCode');
//       // if (!InvoiceShipLogSeq) missingFields.push('InvoiceShipLogSeq');
//       if (!InvoiceShipLogStatusCode) missingFields.push('InvoiceShipLogStatusCode');
//       if (!InvoiceShipLogUpdate) missingFields.push('InvoiceShipLogUpdate');
//       if (!InvoiceShipLogLat) missingFields.push('InvoiceShipLogLat');
//       if (!InvoiceShipLogLong) missingFields.push('InvoiceShipLogLong');
//       if (!InvoiceShipLogEmpCode) missingFields.push('InvoiceShipLogEmpCode');
  
//       return res.status(400).json({
//           status: false,
//           message: 'ข้อมูลอัปเดทสถานะไม่ครบ',
//           missingFields: missingFields
//       });
//   }

//   try {
//     const rowsAffected = await invoiceModel.updateInvoiceStatus(InvoiceShipLogCode, InvoiceShipLogStatusCode, InvoiceShipLogUpdate, InvoiceShipLogLat, InvoiceShipLogLong, InvoiceShipLogEmpCode);

//     if (rowsAffected > 0) {
//         res.status(200).json({ status: true, message: 'อัปเดท Trip สำเร็จ' });
//     }else{
//         res.status(404).json({ status: false, message: 'ไม่พบ Trip' });
//     }


//   } catch (error) {
//     console.error('Error updating invoice status:', error);
//     res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
//   }
// }

module.exports = {
    getTripsAndShipmentList,
    // updateTrip
};