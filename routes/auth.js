const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/getBranchLocation', authController.getBranchLocation);

module.exports = router;