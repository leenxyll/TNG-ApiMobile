const issueModel = require('../models/issueModel'); // Import Model
const trackingController = require('../controllers/trackingController'); // Import Pusher
const path = require('path');
const moment = require("moment");
const fs = require('fs').promises;

async function getSubIssue(req, res) {
  try {
    const subissue = await issueModel.getSubIssue();

    if (!subissue || subissue.length === 0) {
      console.log('No sub issue found');
      return res.status(404).json({ status: false, message: 'ไม่พบรายการปัญหา' });
    }

    console.log('Get sub issue success');
    res.status(200).json({
      status: true,
      message: 'พบรายการปัญหา',
      subissue: subissue
    });
  } catch (error) {
    console.error('Error in getSubIssue:', error);
    res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
  }
}

module.exports = { getSubIssue };