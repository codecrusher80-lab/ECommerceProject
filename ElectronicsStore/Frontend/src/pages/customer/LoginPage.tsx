import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Grid,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import { login } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: Yup.boolean(), // Add rememberMe to validation schema
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false, // Add this field to initialValues
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
        // Navigation will be handled by useEffect
      } catch (error) {
        // Error is handled by Redux
      }
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTestLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      formik.setValues({
        email: 'admin@electronicsstore.com',
        password: 'Admin@123',
        rememberMe: false, // Make sure to set rememberMe
      });
    } else {
      formik.setValues({
        email: 'customer@electronicsstore.com',
        password: 'Customer@123',
        rememberMe: false, // Make sure to set rememberMe
      });
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Person sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Remember Me checkbox */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Checkbox
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <Typography variant="body2" color="text.secondary">
              Remember Me
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !formik.isValid}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" align="center">
                Quick Login (for testing):
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => handleTestLogin('admin')}
              >
                Admin Login
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                onClick={() => handleTestLogin('customer')}
              >
                Customer Login
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              to="/forgot-password"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                Forgot password?
              </Typography>
            </Link>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{ textDecoration: 'none' }}
              >
                <Typography component="span" variant="body2" color="primary">
                  Sign up here
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Features */}
        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'grey.200' }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Why choose Electronics Store?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  🚚 Free Shipping
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  On orders above ₹999
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  🔒 Secure Payment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  100% protected
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  ↩️ Easy Returns
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  7-day return policy
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
