require('./utils/logger'); // เรียกก่อน import อื่น ๆ
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const driverRoutes = require('./routes/driver');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[ROUTE] ${req.method} ${req.originalUrl} - ${req.ip} - ${duration}ms`);
    });
    next();
  });

app.use(bodyParser.json());
app.use('/auth', authRoutes);
app.use('/driver', driverRoutes);

app.get('/test', function (req, res) {
    res.json({msg : 'This is a test message'});
});
  
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });