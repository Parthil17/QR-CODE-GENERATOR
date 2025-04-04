const QRCode = require('../models/QRCode');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Generate and save a new QR Code
exports.generateQRCode = async (req, res) => {
  try {
    const { text, title, type } = req.body;
    const userId = req.userId;
    
    if (!text) {
      return res.status(400).json({ message: 'Text or URL is required' });
    }
    
    // Generate QR code as data URL
    const qrDataURL = await qrcode.toDataURL(text);
    
    // Save data URL as file
    const fileName = `qr-${Date.now()}.png`;
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
      fs.mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });
    }
    
    // Convert base64 to file
    const data = qrDataURL.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(filePath, data, 'base64');
    
    // Create QR code in database
    const newQRCode = new QRCode({
      text,
      userId,
      imageUrl: `/uploads/${fileName}`,
      title: title || 'Untitled QR Code',
      type: type || 'URL'
    });
    
    await newQRCode.save();
    
    res.status(201).json({
      message: 'QR Code generated successfully',
      qrCode: newQRCode,
      imageUrl: `/uploads/${fileName}`,
      dataURL: qrDataURL
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all QR codes for a user with pagination and filters
exports.getAllQRCodes = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, startDate, endDate, type } = req.query;
    
    // Build query based on filters
    const query = { userId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (type) query.type = type;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get count for pagination metadata
    const total = await QRCode.countDocuments(query);
    
    // Get QR codes
    const qrCodes = await QRCode.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      qrCodes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a QR code
exports.deleteQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const qrCode = await QRCode.findOne({ _id: id, userId });
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }
    
    // Delete image file if exists
    if (qrCode.imageUrl) {
      const filePath = path.join(__dirname, '..', qrCode.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await QRCode.deleteOne({ _id: id });
    
    res.json({ message: 'QR Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share QR code via email
exports.shareQRCode = async (req, res) => {
  try {
    const { id, email, message } = req.body;
    const userId = req.userId;
    
    if (!id || !email) {
      return res.status(400).json({ message: 'QR Code ID and recipient email are required' });
    }
    
    // Find the QR code
    const qrCode = await QRCode.findOne({ _id: id, userId });
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }
    
    // Generate QR code image again
    const qrDataURL = await qrcode.toDataURL(qrCode.text);
    
    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Get user details
    const user = req.user;
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `QR Code shared by ${user.name}`,
      html: `
        <div>
          <h2>QR Code from ${user.name}</h2>
          <p>${message || 'Check out this QR Code!'}</p>
          <p>This QR Code contains: ${qrCode.text}</p>
          <img src="${qrDataURL}" alt="QR Code" />
          <p>Scan the QR code with your device to access the content.</p>
        </div>
      `,
      attachments: [
        {
          filename: `qrcode-${qrCode._id}.png`,
          content: qrDataURL.split(';base64,').pop(),
          encoding: 'base64'
        }
      ]
    });
    
    res.json({ message: 'QR Code shared successfully via email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 