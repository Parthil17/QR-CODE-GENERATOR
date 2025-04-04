# QR Code Generation & Scanning System

A full-stack MERN application that allows users to generate, scan, and manage QR codes.

## Features

- 🔐 User Authentication (Signup/Login with JWT)
- 🔄 Generate QR codes for URLs, plain text, email, phone, SMS, and WiFi
- 📱 Scan QR codes using device camera
- 📚 View history of QR codes with pagination
- 🔍 Filter QR codes by date range and type
- 📥 Download generated QR codes as images
- 📋 Copy QR code content to clipboard
- 📧 Share QR codes via email
- 🗑️ Delete QR codes

## Tech Stack

### Frontend
- React (with Vite)
- React Router for navigation
- Material UI for UI components
- Axios for API requests
- react-qr-reader for QR code scanning
- html-to-image for downloading QR codes

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- QRCode library for generation
- Nodemailer for email sharing

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas URI)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd qr-code-system
```

2. Install server dependencies
```
cd server
npm install
```

3. Configure environment variables
```
cp .env.example .env
```
Then edit the `.env` file with your own values:
- Set your MongoDB connection string
- Set a secure JWT secret
- Configure email settings for sharing QR codes

4. Install client dependencies
```
cd ../client
npm install
```

### Running the Application

1. Start the backend server (in the server directory)
```
npm run dev
```

2. Start the frontend development server (in the client directory)
```
npm run dev
```

3. Access the application at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### QR Codes
- `POST /api/qrcodes` - Generate a new QR code
- `GET /api/qrcodes` - Get all QR codes with filters & pagination
- `DELETE /api/qrcodes/:id` - Delete a specific QR code
- `POST /api/qrcodes/share` - Share QR code via email

## License

MIT "# QR-CODE-GENERATOR" 
