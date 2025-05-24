const express = require('express');
const router = express.Router();
const { topUpWallet } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.post('/topup', protect, topUpWallet);

module.exports = router;
