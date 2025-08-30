import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  Payment,
  LocalShipping,
  Security,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCart } from '../../store/thunks/cartThunks';
import { toast } from 'react-toastify';

const steps = ['Shipping Address', 'Payment Method', 'Review Order'];

const addressValidationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  addressLine1: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  postalCode: Yup.string().required('Postal code is required'),
  country: Yup.string().required('Country is required'),
});

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    items, 
    totalAmount, 
    totalItems, 
    isLoading 
  } = useSelector((state: RootState) => state.cart);
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (!items || items.length === 0) {
      navigate('/cart');
      return;
    }

    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, items, navigate]);

  const addressFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    validationSchema: addressValidationSchema,
    onSubmit: (values) => {
      setActiveStep(1);
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const calculateShipping = () => {
    if (totalAmount >= 999) return 0;
    return shippingMethod === 'express' ? 100 : 50;
  };

  const calculateTax = () => {
    return Math.round(totalAmount * 0.18); // 18% GST
  };

  const calculateTotal = () => {
    return totalAmount + calculateShipping() + calculateTax();
  };

  const handleNext = () => {
    if (activeStep === 0) {
      addressFormik.handleSubmit();
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, this would be an API call
      const orderData = {
        shippingAddress: addressFormik.values,
        paymentMethod,
        shippingMethod,
        items,
        subtotal: totalAmount,
        shipping: calculateShipping(),
        tax: calculateTax(),
        total: calculateTotal(),
      };

      console.log('Order placed:', orderData);
      
      toast.success('Order placed successfully!');
      navigate('/order-success', { 
        state: { 
          orderId: 'ORD-' + Date.now(),
          total: calculateTotal() 
        } 
      });
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAddressForm = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
        Shipping Address
      </Typography>
      <Box component="form" onSubmit={addressFormik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="firstName"
              label="First Name"
              value={addressFormik.values.firstName}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.firstName && Boolean(addressFormik.errors.firstName)}
              helperText={addressFormik.touched.firstName && addressFormik.errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="lastName"
              label="Last Name"
              value={addressFormik.values.lastName}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.lastName && Boolean(addressFormik.errors.lastName)}
              helperText={addressFormik.touched.lastName && addressFormik.errors.lastName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={addressFormik.values.email}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.email && Boolean(addressFormik.errors.email)}
              helperText={addressFormik.touched.email && addressFormik.errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={addressFormik.values.phone}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.phone && Boolean(addressFormik.errors.phone)}
              helperText={addressFormik.touched.phone && addressFormik.errors.phone}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="addressLine1"
              label="Address Line 1"
              value={addressFormik.values.addressLine1}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.addressLine1 && Boolean(addressFormik.errors.addressLine1)}
              helperText={addressFormik.touched.addressLine1 && addressFormik.errors.addressLine1}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="addressLine2"
              label="Address Line 2 (Optional)"
              value={addressFormik.values.addressLine2}
              onChange={addressFormik.handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="city"
              label="City"
              value={addressFormik.values.city}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.city && Boolean(addressFormik.errors.city)}
              helperText={addressFormik.touched.city && addressFormik.errors.city}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="state"
              label="State"
              value={addressFormik.values.state}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.state && Boolean(addressFormik.errors.state)}
              helperText={addressFormik.touched.state && addressFormik.errors.state}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="postalCode"
              label="Postal Code"
              value={addressFormik.values.postalCode}
              onChange={addressFormik.handleChange}
              onBlur={addressFormik.handleBlur}
              error={addressFormik.touched.postalCode && Boolean(addressFormik.errors.postalCode)}
              helperText={addressFormik.touched.postalCode && addressFormik.errors.postalCode}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                name="country"
                value={addressFormik.values.country}
                onChange={addressFormik.handleChange}
                label="Country"
              >
                <MenuItem value="India">India</MenuItem>
                <MenuItem value="USA">United States</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="UK">United Kingdom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );

  const renderPaymentMethod = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
        Payment Method
      </Typography>
      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <FormControlLabel
          value="razorpay"
          control={<Radio />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security />
              <Box>
                <Typography>Razorpay (Credit/Debit Cards, UPI, Net Banking)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Secure payment powered by Razorpay
                </Typography>
              </Box>
            </Box>
          }
        />
        <FormControlLabel
          value="cod"
          control={<Radio />}
          label={
            <Box>
              <Typography>Cash on Delivery</Typography>
              <Typography variant="body2" color="text.secondary">
                Pay when you receive your order
              </Typography>
            </Box>
          }
        />
      </RadioGroup>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
        Shipping Method
      </Typography>
      <RadioGroup
        value={shippingMethod}
        onChange={(e) => setShippingMethod(e.target.value)}
      >
        <FormControlLabel
          value="standard"
          control={<Radio />}
          label={
            <Box>
              <Typography>Standard Shipping (5-7 days) - ₹50</Typography>
              <Typography variant="body2" color="text.secondary">
                Free for orders above ₹999
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="express"
          control={<Radio />}
          label={
            <Box>
              <Typography>Express Shipping (2-3 days) - ₹100</Typography>
              <Typography variant="body2" color="text.secondary">
                Faster delivery available
              </Typography>
            </Box>
          }
        />
      </RadioGroup>
    </Paper>
  );

  const renderOrderReview = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Review Your Order
      </Typography>
      
      {/* Order Items */}
      {items.map((item) => (
        <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Avatar
            src={item.productImage}
            alt={item.productName}
            variant="rounded"
            sx={{ width: 80, height: 80 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">{item.productName}</Typography>
            <Typography variant="body2" color="text.secondary">
              Quantity: {item.quantity}
            </Typography>
            <Typography variant="h6" color="primary.main">
              {formatPrice(item.currentPrice * item.quantity)}
            </Typography>
          </Box>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Address Summary */}
      <Typography variant="subtitle1" gutterBottom>Shipping Address:</Typography>
      <Typography variant="body2">
        {addressFormik.values.firstName} {addressFormik.values.lastName}<br />
        {addressFormik.values.addressLine1}<br />
        {addressFormik.values.addressLine2 && `${addressFormik.values.addressLine2}\n`}
        {addressFormik.values.city}, {addressFormik.values.state} {addressFormik.values.postalCode}<br />
        {addressFormik.values.country}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Payment Summary */}
      <Typography variant="subtitle1" gutterBottom>Payment Method:</Typography>
      <Typography variant="body2">
        {paymentMethod === 'razorpay' ? 'Razorpay (Online Payment)' : 'Cash on Delivery'}
      </Typography>
    </Paper>
  );

  const renderOrderSummary = () => (
    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Subtotal ({totalItems} items)</Typography>
          <Typography>{formatPrice(totalAmount)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Shipping</Typography>
          <Typography>
            {calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Tax (GST 18%)</Typography>
          <Typography>{formatPrice(calculateTax())}</Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" color="primary.main">
            {formatPrice(calculateTotal())}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          🔒 Your payment information is secure and encrypted
        </Typography>
      </Alert>
    </Paper>
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {activeStep === 0 && renderAddressForm()}
          {activeStep === 1 && renderPaymentMethod()}
          {activeStep === 2 && renderOrderReview()}
        </Grid>

        <Grid item xs={12} md={4}>
          {renderOrderSummary()}
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isProcessing || (activeStep === 0 && !addressFormik.isValid)}
        >
          {isProcessing ? (
            <CircularProgress size={24} color="inherit" />
          ) : activeStep === steps.length - 1 ? (
            'Place Order'
          ) : (
            'Next'
          )}
        </Button>
      </Box>
    </Container>
  );
};

export default CheckoutPage;