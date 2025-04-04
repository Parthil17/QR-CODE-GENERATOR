import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

import Navbar from './components/Navbar';
import GenerateQR from './pages/GenerateQR';
import ScanQR from './pages/ScanQR';
import QRHistory from './pages/QRHistory';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/generate" element={<GenerateQR />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="/history" element={<QRHistory />} />
          
          {/* Redirect to Generate */}
          <Route path="/" element={<Navigate to="/generate" replace />} />
          
          {/* 404 - Redirect to Generate */}
          <Route path="*" element={<Navigate to="/generate" replace />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App; 