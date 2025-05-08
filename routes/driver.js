const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const invoiceController = require('../controllers/invoiceController');
const mileController = require('../controllers/mileController');
const issueController = require('../controllers/issueController'); // Import issueController
const multer = require('multer');
const path = require('path');
const upload = require('../utils/multerConfig'); 

router.get('/trip/getShipmentList', tripController.getTripsAndShipmentList);
router.post('/invoice/updateStatus', invoiceController.updateInvoiceStatus); // Update invoice status
// router.post('/trip/updateStatus', tripController.updateTrip); // Update trip status

router.post('/mileLog/insertData', mileController.createMileageLog);

router.post('/mileLog/uploadPic', upload.single('image'), mileController.uploadMileageLogImage);
router.post('/invoice/uploadPic', upload.fields([
    { name: 'images', maxCount: 60 },  // อัปโหลดไฟล์หลายตัว
    { name: 'invoiceCodes', maxCount: 60 },
    { name: 'typeCodes', maxCount: 60 },
    { name: 'updateTimes', maxCount: 60 }
]), invoiceController.uploadShipmentImage); 

router.get('/issue/getSubIssue', issueController.getSubIssue); // Get sub issue


module.exports = router;