import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { QrCode2 } from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <QrCode2 sx={{ mr: 2 }} />
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          QR Code System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/generate">
            Generate
          </Button>
          <Button color="inherit" component={Link} to="/scan">
            Scan
          </Button>
          <Button color="inherit" component={Link} to="/history">
            History
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 