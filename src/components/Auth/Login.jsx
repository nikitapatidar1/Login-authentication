import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  CircularProgress,
  Alert 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { setAuthState } = useAuth();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
      .trim(),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .trim(),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors, setStatus }) => {
    try {
      // Input sanitization
      const sanitizedValues = {
        email: values.email.trim().toLowerCase(),
        password: values.password.trim()
      };

      console.log('Login attempt with sanitized values:', sanitizedValues);
      
      const response = await authService.login(sanitizedValues);
      
      if (!response?.token) {
        throw new Error('Authentication failed: No token received');
      }

      // Update auth context
      setAuthState({
        isAuthenticated: true,
        user: response.user,
        token: response.token
      });

      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
      console.log('Login successful, redirecting...');
      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      setStatus({
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      });
      
      setErrors({
        email: ' ',
        password: ' ' // Empty space to maintain form layout
      });
      
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      mx: 'auto', 
      mt: 8, 
      p: 3,
      boxShadow: 3,
      borderRadius: 2
    }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Login
      </Typography>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ 
          isSubmitting, 
          errors, 
          touched, 
          status 
        }) => (
          <Form noValidate autoComplete="off">
            {status?.success === false && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {status.message}
              </Alert>
            )}

            <Field
              as={TextField}
              name="email"
              label="Email Address"
              fullWidth
              margin="normal"
              variant="outlined"
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              disabled={isSubmitting}
              inputProps={{
                autoComplete: 'email'
              }}
            />

            <Field
              as={TextField}
              type="password"
              name="password"
              label="Password"
              fullWidth
              margin="normal"
              variant="outlined"
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              disabled={isSubmitting}
              inputProps={{
                autoComplete: 'current-password'
              }}
            />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1,
              mb: 2
            }}>
              <Link 
                to="/forgot-password" 
                style={{ 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  color: 'primary.main'
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ 
                mt: 2,
                height: 48,
                fontSize: '1rem'
              }}
              disabled={isSubmitting}
              startIcon={isSubmitting ? 
                <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            <Typography 
              variant="body2" 
              align="center" 
              sx={{ 
                mt: 3,
                color: 'text.secondary'
              }}
            >
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  textDecoration: 'none',
                  color: 'primary.main',
                  fontWeight: 'medium'
                }}
              >
                Register here
              </Link>
            </Typography>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default Login;