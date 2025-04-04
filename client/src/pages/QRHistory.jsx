import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Alert, 
  CircularProgress,
  Pagination,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Clear } from '@mui/icons-material';
import dayjs from 'dayjs';
import QRCodeDisplay from '../components/QRCodeDisplay';

const QRHistory = () => {
  const [qrCodes, setQRCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    type: ''
  });

  // Fetch QR codes
  const fetchQRCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 6); // 6 items per page
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      
      if (filters.type) {
        params.append('type', filters.type);
      }
      
      const res = await axios.get(`/api/qrcodes?${params.toString()}`);
      setQRCodes(res.data.qrCodes);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch QR codes');
    } finally {
      setLoading(false);
    }
  };

  // Load QR codes on initial render and when page or filters change
  useEffect(() => {
    fetchQRCodes();
  }, [page, filters.startDate, filters.endDate, filters.type]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle date filter changes
  const handleDateChange = (field, date) => {
    setFilters({
      ...filters,
      [field]: date ? dayjs(date).toDate() : null
    });
    setPage(1); // Reset to first page on filter change
  };

  // Handle type filter change
  const handleTypeChange = (e) => {
    setFilters({
      ...filters,
      type: e.target.value
    });
    setPage(1); // Reset to first page on filter change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      type: ''
    });
    setPage(1);
  };

  // Handle share QR code
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

  // Handle delete QR code
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      await axios.delete(`/api/qrcodes/${id}`);
      // Refresh the current page, or go to previous page if this was the only item
      fetchQRCodes();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete QR code');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          QR Code History
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Filters */}
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Filter QR Codes
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box className="date-filter-container">
              <DatePicker
                label="From Date"
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1 } } }}
              />
              
              <DatePicker
                label="To Date"
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(date) => handleDateChange('endDate', date)}
                slotProps={{ textField: { size: 'small', sx: { flexGrow: 1 } } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={filters.type}
                  label="Type"
                  onChange={handleTypeChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="URL">URL</MenuItem>
                  <MenuItem value="TEXT">Text</MenuItem>
                  <MenuItem value="EMAIL">Email</MenuItem>
                  <MenuItem value="PHONE">Phone</MenuItem>
                  <MenuItem value="SMS">SMS</MenuItem>
                  <MenuItem value="WIFI">WiFi</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Box>
          </LocalizationProvider>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : qrCodes.length === 0 ? (
          <Alert severity="info">
            No QR codes found. Generate some QR codes first!
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {qrCodes.map((qrCode) => (
                <Grid item xs={12} sm={6} md={4} key={qrCode._id}>
                  <QRCodeDisplay 
                    qrCode={qrCode} 
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default QRHistory; 