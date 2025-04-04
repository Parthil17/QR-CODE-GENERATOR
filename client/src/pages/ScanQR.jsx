import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Alert, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { ContentCopy, Launch } from '@mui/icons-material';

const ScanQR = () => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const [scannedHistory, setScannedHistory] = useState(() => {
    const saved = localStorage.getItem('scannedQRCodes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Initialize scanner when component mounts and scanning is true
    if (scanning && scannerRef.current && !html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      startScanner();
    }

    // Cleanup when component unmounts
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error(err));
        html5QrCodeRef.current = null;
      }
    };
  }, [scanning]);

  const startScanner = () => {
    if (!html5QrCodeRef.current) return;
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      handleScan,
      handleError
    );
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(err => console.error(err));
    }
  };

  // Save to history
  const saveToHistory = (text) => {
    const newHistory = [
      { text, timestamp: new Date().toISOString() },
      ...scannedHistory
    ].slice(0, 20); // Keep last 20 items
    
    setScannedHistory(newHistory);
    localStorage.setItem('scannedQRCodes', JSON.stringify(newHistory));
  };

  // Handle successful scan
  const handleScan = (decodedText) => {
    setData(decodedText);
    saveToHistory(decodedText);
    setScanning(false);
    stopScanner();
  };

  // Handle errors during scanning
  const handleError = (err) => {
    // Don't show errors for normal scanning process
    if (err === 'QR code not found') return;
    setError(`Error scanning QR code: ${err.message || 'Unknown error'}`);
  };

  // Copy scanned text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => alert('Failed to copy: ' + err));
  };

  // Try to open URL if text is a valid URL
  const openURL = (text) => {
    try {
      const url = new URL(text);
      window.open(url.href, '_blank');
    } catch (e) {
      alert('Not a valid URL');
    }
  };

  // Check if text is a URL
  const isURL = (text) => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Format timestamp
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle scan another button
  const handleScanAnother = () => {
    setScanning(true);
    setData('');
    setError('');
    
    // Need to wait for next render cycle before reinitializing
    setTimeout(() => {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      }
      startScanner();
    }, 100);
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Scan QR Code
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
          {scanning ? (
            <Box className="qr-scanner-container">
              <div 
                id="qr-reader" 
                ref={scannerRef} 
                style={{ width: '100%' }}
              />
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                Point your camera at a QR code
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Scanned Result:
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all', mb: 2 }}>
                {data}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<ContentCopy />}
                  onClick={() => copyToClipboard(data)}
                >
                  Copy
                </Button>
                
                {isURL(data) && (
                  <Button 
                    variant="contained" 
                    startIcon={<Launch />}
                    onClick={() => openURL(data)}
                  >
                    Open URL
                  </Button>
                )}
              </Box>
              
              <Button 
                fullWidth 
                variant="contained"
                onClick={handleScanAnother}
                sx={{ mt: 1 }}
              >
                Scan Another Code
              </Button>
            </Box>
          )}
        </Paper>
        
        {/* History section */}
        {scannedHistory.length > 0 && (
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2, maxWidth: 500, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Scan History
            </Typography>
            
            <List>
              {scannedHistory.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            wordBreak: 'break-all',
                            maxWidth: '100%',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {item.text}
                        </Typography>
                      }
                      secondary={formatDate(item.timestamp)}
                    />
                    <Button 
                      size="small"
                      onClick={() => copyToClipboard(item.text)}
                    >
                      <ContentCopy fontSize="small" />
                    </Button>
                    
                    {isURL(item.text) && (
                      <Button 
                        size="small"
                        onClick={() => openURL(item.text)}
                        sx={{ ml: 1 }}
                      >
                        <Launch fontSize="small" />
                      </Button>
                    )}
                  </ListItem>
                  {index < scannedHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            
            <Button 
              fullWidth 
              variant="outlined"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear scan history?')) {
                  setScannedHistory([]);
                  localStorage.removeItem('scannedQRCodes');
                }
              }}
              sx={{ mt: 2 }}
            >
              Clear History
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ScanQR; 