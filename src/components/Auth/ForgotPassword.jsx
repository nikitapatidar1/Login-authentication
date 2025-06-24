import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Link, CircularProgress, Alert } from "@mui/material";
import authService from "../../services/authService";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.message || "Reset link sent to your email!");
      setTimeout(() => navigate("/login"), 3000); // 3 सेकंड बाद लॉगिन पेज पर रीडायरेक्ट
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Failed to send reset link. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Forgot Password
      </Typography>
      
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          type="email"
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      
      <Typography sx={{ mt: 2, textAlign: 'center' }}>
        Remember your password?{" "}
        <Link 
          component="button" 
          onClick={() => navigate("/login")}
          sx={{ cursor: 'pointer' }}
        >
          Login
        </Link>
      </Typography>
    </Box>
  );
}

export default ForgotPasswordPage;