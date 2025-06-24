import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Hello, {user?.username || 'User'}! You are now logged in.
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;