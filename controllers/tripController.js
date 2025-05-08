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

module.exports = {
    getTripsAndShipmentList,
};