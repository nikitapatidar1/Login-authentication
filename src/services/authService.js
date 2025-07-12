// const controller = new AbortController();
// const timeoutId = setTimeout(() => controller.abort(), 10000);


// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:50001/api/auth';

// const authService = {
//   // ----------- User Functions -----------
//   getCurrentUser: () => {
//     const token = localStorage.getItem('authToken');
//     if (!token) return null;

//     try {
//       // Decode JWT token payload
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return {
//         id: payload.id,
//         name: payload.name,
//         email: payload.email,
//         role: payload.role
//       };
//     } catch (error) {
//       console.error('Error decoding token:', error);
//       return null;
//     }
//   },

//   isAuthenticated: () => {
//     return !!localStorage.getItem('authToken');
//   },

//   // ----------- Auth Functions -----------
//   login: async (credentials) => {
//     try {
//       console.log('1. Starting login process...');
      
//       // Validate input
//       if (!credentials?.email || !credentials?.password) {
//         console.error('Validation failed - missing email or password');
//         throw new Error('Email and password are required');
//       }

//       // Sanitize credentials
//       const sanitizedCredentials = {
//         email: credentials.email.trim().toLowerCase(),
//         password: credentials.password.trim()
//       };
//       console.log('2. Sanitized credentials:', sanitizedCredentials);

//       // API request details
//       console.log(`3. Making request to: ${API_BASE_URL}/login`);
//       console.log('4. Request payload:', sanitizedCredentials);
      
//       const response = await fetch(`${API_BASE_URL}/login`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(sanitizedCredentials),
//         signal: AbortSignal.timeout(10000)
//       });

//       console.log('5. Received response status:', response.status);
      
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('6. Error response data:', errorData);
//         throw new Error(errorData.message || 'Login failed');
//       }

//       const data = await response.json();
//       console.log('7. Successful response data:', data);
      
//       if (data.token) {
//         localStorage.setItem('authToken', data.token);
//         console.log('8. Auth token stored in localStorage');
//       }
      
//       return data;
//     } catch (error) {
//       console.error('9. Login process failed:', {
//         errorName: error.name,
//         errorMessage: error.message,
//         stack: error.stack
//       });
//       throw new Error(error.message || 'Login failed. Please try again.');
//     }
//   },

//   logout: () => {
//     localStorage.removeItem('authToken');
//     // Optional: Add API call to invalidate token on server
//   },

//   getToken: () => {
//     return localStorage.getItem('authToken');
//   },

//   // ----------- Password Functions -----------
//   register: async (userData) => {
//     try {
//       if (!userData?.email || !userData?.password || !userData?.name) {
//         throw new Error('Name, email and password are required');
//       }

//       const sanitizedData = {
//         name: userData.name.trim(),
//         email: userData.email.trim().toLowerCase(),
//         password: userData.password.trim()
//       };

//       const response = await fetch(`${API_BASE_URL}/register`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(sanitizedData),
//         signal: AbortSignal.timeout(10000)
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || 'Registration failed');
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Registration error:', error.message || error);
//       throw new Error(error.message || 'Registration failed. Please try again.');
//     }
//   },

//   forgotPassword: async (email) => {
//     try {
//       if (!email) throw new Error('Email is required');

//       const sanitizedEmail = email.trim().toLowerCase();

//       const response = await fetch(`${API_BASE_URL}/forgot-password`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: sanitizedEmail }),
//         signal: AbortSignal.timeout(10000)
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(
//           errorData.message || 
//           errorData.error || 
//           `Password reset failed (Status: ${response.status})`
//         );
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Forgot password error:', error.message || error);
//       throw new Error(error.message || 'Failed to send reset link. Please try again.');
//     }
//   },

//   resetPassword: async (token, newPassword) => {
//     try {
//       if (!token || !newPassword) {
//         throw new Error('Token and new password are required');
//       }

//       const response = await fetch(`${API_BASE_URL}/reset-password`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ 
//           token, 
//           newPassword: newPassword.trim() 
//         }),
//         signal: AbortSignal.timeout(10000)
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || 'Password reset failed');
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Reset password error:', error.message || error);
//       throw new Error(error.message || 'Failed to reset password. Please try again.');
//     }
//   }
// };

// export default authService;

const API_BASE_URL = "http://localhost:50001/api/auth";

const login = async (credentials) => {
  try {
    const sanitizedCredentials = {
      email: credentials.email.trim(),
      password: credentials.password
    };

    console.log(`3. Making request to: ${API_BASE_URL}/login`);
    console.log('4. Request payload:', sanitizedCredentials);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedCredentials),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    console.log('5. Received response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('6. Error response data:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('7. Successful response data:', data);

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      console.log('8. Auth token stored in localStorage');
    }

    return data;
  } catch (error) {
    console.error('9. Login process failed:', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};


export default authService;