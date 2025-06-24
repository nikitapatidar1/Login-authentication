import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: localStorage.getItem('token') ? true : false,
    user: JSON.parse(localStorage.getItem('user') || 'null')
  });

  const login = async (email, password) => {
    try {
      // ये API call आपके backend से match करें
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setAuthState({
        isAuthenticated: true,
        user: data.user
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// ये लाइन जरूर add करें
export const useAuth = () => useContext(AuthContext);