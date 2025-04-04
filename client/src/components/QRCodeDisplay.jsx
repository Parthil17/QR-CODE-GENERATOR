import React, { useRef } from 'react';
import { Box, Button, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { Download, ContentCopy, Email, Delete } from '@mui/icons-material';
import { toPng } from 'html-to-image';

const QRCodeDisplay = ({ qrCode, dataURL, onShare, onDelete }) => {
  const qrRef = useRef(null);

  const handleDownload = async () => {
    if (qrRef.current === null) return;
    
    try {
      const imgData = await toPng(qrRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `qrcode-${qrCode._id}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error('Error generating image', error);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(qrCode.text)
      .then(() => alert('Text copied to clipboard!'))
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card sx={{ maxWidth: 350, boxShadow: 3, margin: 'auto', borderRadius: 2 }} className="qr-card">
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" align="center">
          {qrCode.title}
        </Typography>
        
        <Box 
          ref={qrRef} 
          className="qr-code-display" 
          sx={{ 
            padding: 2, 
            backgroundColor: 'white', 
            borderRadius: 1
          }}
        >
          <img src={dataURL || qrCode.imageUrl} alt="QR Code" style={{ width: '100%', maxWidth: 200 }} />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all' }}>
          {qrCode.text}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Created: {formatDate(qrCode.createdAt)}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} color="primary">
              <Download />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Copy Text/URL">
            <IconButton onClick={handleCopyText} color="primary">
              <ContentCopy />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share via Email">
            <IconButton onClick={() => onShare(qrCode._id)} color="primary">
              <Email />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(qrCode._id)} color="error">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay; 