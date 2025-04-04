const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const auth = require('../middleware/auth');

// All routes are protected by auth middleware
router.use(auth);

// Generate new QR code
router.post('/', qrCodeController.generateQRCode);

// Get all QR codes with pagination and filters
router.get('/', qrCodeController.getAllQRCodes);

// Delete a QR code
router.delete('/:id', qrCodeController.deleteQRCode);

// Share QR code via email
router.post('/share', qrCodeController.shareQRCode);

module.exports = router; 