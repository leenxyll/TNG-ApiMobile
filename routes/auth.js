const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/getBranchLocation', authController.getBranchLocation);
router.get('/test', authController.test);

module.exports = router;