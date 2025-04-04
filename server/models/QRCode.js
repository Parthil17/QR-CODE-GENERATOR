const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Untitled QR Code'
  },
  type: {
    type: String,
    enum: ['URL', 'TEXT', 'EMAIL', 'PHONE', 'SMS', 'WIFI'],
    default: 'URL'
  }
});

// Index for faster querying
qrCodeSchema.index({ userId: 1, createdAt: -1 });

const QRCode = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCode; 