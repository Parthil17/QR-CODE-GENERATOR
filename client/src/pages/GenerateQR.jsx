import React, { useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { QrCode2 } from '@mui/icons-material';
import QRCodeDisplay from '../components/QRCodeDisplay';

const GenerateQR = () => {
  const [formData, setFormData] = useState({
    text: '',
    title: '',
    type: 'URL'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);
  const [dataURL, setDataURL] = useState('');

  const { text, title, type } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!text) {
      setError('Text or URL is required');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/api/qrcodes', { 
        text, 
        title: title || 'Untitled QR Code',
        type 
      });
      
      setGeneratedQR(res.data.qrCode);
      setDataURL(res.data.dataURL);
      setSuccess('QR Code generated successfully!');
      setFormData({ ...formData, text: '', title: '' }); // Reset form
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (id) => {
    try {
      const email = prompt('Enter email address to share QR code with:');
      if (!email) return;
      
      const message = prompt('Enter a message (optional):');
      
      await axios.post('/api/qrcodes/share', { id, email, message });
      alert('QR Code shared successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to share QR code');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      await axios.delete(`/api/qrcodes/${id}`);
      setGeneratedQR(null);
      setDataURL('');
      setSuccess('QR Code deleted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete QR code');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Generate QR Code
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter URL or Text"
              name="text"
              value={text}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              placeholder="https://example.com or Your text here"
            />
            
            <TextField
              fullWidth
              label="Title for QR Code (Optional)"
              name="title"
              value={title}
              onChange={handleChange}
              margin="normal"
              placeholder="My Website QR Code"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="type-select-label">QR Code Type</InputLabel>
              <Select
                labelId="type-select-label"
                id="type"
                name="type"
                value={type}
                label="QR Code Type"
                onChange={handleChange}
              >
                <MenuItem value="URL">URL</MenuItem>
                <MenuItem value="TEXT">Plain Text</MenuItem>
                <MenuItem value="EMAIL">Email</MenuItem>
                <MenuItem value="PHONE">Phone Number</MenuItem>
                <MenuItem value="SMS">SMS</MenuItem>
                <MenuItem value="WIFI">WiFi</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
              startIcon={<QrCode2 />}
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </Box>
        </Paper>
        
        {generatedQR && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <QRCodeDisplay 
              qrCode={generatedQR} 
              dataURL={dataURL} 
              onShare={handleShare}
              onDelete={handleDelete}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default GenerateQR; 