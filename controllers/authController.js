const employeeModel = require('../models/employeeModel');
const branchModel = require('../models/branchModel');

async function test(req, res) {
  return res.status(200).json({
    status: true,
    message: 'API is working',
  });
  console.log('test API');
}

async function login(req, res) {
  const { EmpCode } = req.body;

  if (!EmpCode) {
    console.error('Missing EmpCode in request body');
    return res.status(400).json({ status: false, message: 'กรุณากรอกรหัสพนักงาน' });
  }

  try {
    const employee = await employeeModel.findByEmpCode(EmpCode);

    if (!employee) {
      console.error('Employee not found:', EmpCode);
      return res.status(404).json({ status: false, message: 'ไม่พบพนักงาน' });
    }

    console.log('Get Employee for login success: ', EmpCode, '(',employee.EmpBrchCode,')');

    res.status(200).json({
      status: true,
      message: 'รหัสพนักงานถูกต้อง',
      branchCode: employee.EmpBrchCode,
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
  }
}

async function getBranchLocation(req, res) {
  const { BrchCode } = req.query;

  if (!BrchCode) {
    console.error('Missing BrchCode in request query');
    return res.status(400).json({ status: false, message: 'กรุณาระบุรหัสสาขา' });
  }

  try {
    const branch = await branchModel.findByBrchCode(BrchCode);

    if (!branch) {
      console.error('Branch not found:', BrchCode);
      return res.status(404).json({ status: false, message: 'ไม่พบข้อมูลสาขา' });
    }

    console.log('Get Branch success:', BrchCode, '(',branch.BrchName,')');

    res.status(200).json({
      status: true,
      message: 'พบข้อมูลสาขาแล้ว',
      branchName: branch.BrchName,
      latitude: branch.BrchLat,
      longitude: branch.BrchLong,
      radius: branch.BrchRadius, // รัศมี (อาจดึงจาก config หรือฐานข้อมูล)
    });
  } catch (error) {
    console.error('Error in getBranchLocation:', error);
    res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสาขา' });
  }
}

module.exports = {
  login,
  getBranchLocation,
  test
};