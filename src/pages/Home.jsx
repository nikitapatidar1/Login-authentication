// src/pages/Home.jsx
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Home = () => {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Container maxWidth="lg">
      <Box 
        sx={{ 
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 3
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Our App
        </Typography>
        
        <Typography variant="h5" color="text.secondary">
          {isAuthenticated 
            ? 'You are successfully logged in!'
            : 'Please login or register to continue'
          }
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          {!isAuthenticated ? (
            <>
              <Button 
                component={Link}
                to="/login"
                variant="contained"
                size="large"
              >
                Login
              </Button>
              <Button 
                component={Link}
                to="/register"
                variant="outlined"
                size="large"
              >
                Register
              </Button>
            </>
          ) : (
            <Button 
              component={Link}
              to="/dashboard"
              variant="contained"
              size="large"
            >
              Go to Dashboard
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home;