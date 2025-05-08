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
    let folder = process.env.FOLDER_PATH;

    console.log('req.originalUrl:', req.originalUrl); // log URL ที่เข้ามา

    if (req.originalUrl.includes('/mobile/driver/mileLog/uploadPic')) {
      folder = process.env.FOLDER_PATH+'/mileage';
    } else if (req.originalUrl.includes('/mobile/driver/invoice/uploadPic')) {
      folder = process.env.FOLDER_PATH+'/shipmentPicture';
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
