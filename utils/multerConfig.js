const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ฟังก์ชันเช็คและสร้างโฟลเดอร์อัตโนมัติถ้ายังไม่มี
function ensureDirectoryExistence(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// storage แบบ dynamic ตาม URL
const dynamicStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'D:/TNG.Image/mileage';

    if (req.baseUrl.includes('/mileLog/uploadPic')) {
      folder = 'D:/TNG.Image/mileage';
    } else if (req.baseUrl.includes('/invoice/uploadPic')) {
      folder = 'D:/TNG.Image/shipmentPic';
    }

    ensureDirectoryExistence(folder); // สร้างโฟลเดอร์หากยังไม่มี
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: dynamicStorage });

module.exports = upload;
