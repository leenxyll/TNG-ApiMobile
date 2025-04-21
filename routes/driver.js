const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const invoiceController = require('../controllers/invoiceController');
const mileController = require('../controllers/mileController');
const multer = require('multer');
const path = require('path');
const upload = require('../utils/multerConfig'); 

router.get('/trip/getShipmentList', tripController.getTripsAndShipmentList);
router.post('/invoice/updateStatus', invoiceController.updateInvoiceStatus); // Update invoice status
// router.post('/trip/updateStatus', tripController.updateTrip); // Update trip status

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // โฟลเดอร์เก็บรูปภาพ
//   },
//   filename: function (req, file, cb) {
//     // ไม่ต้องกำหนดชื่อไฟล์ที่นี่
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์เริ่มต้น
//   }
// });

// const upload = multer({ storage: storage });
  
router.post('/mileLog/insertData', mileController.createMileageLog);

// router.post('/mileLog/uploadPic', (req, res, next) => {
//     upload.single('image')(req, res, function (err) {
//         if (err) {
//             console.error('Multer error:', err);
//             return res.status(500).json({ status: false, message: 'อัปโหลดรูปภาพไม่สำเร็จ' });
//         }
//         next();
//     });
// }, mileController.uploadMileageLogImage);

router.post('/mileLog/uploadPic', upload.single('image'), mileController.uploadMileageLogImage);


module.exports = router;