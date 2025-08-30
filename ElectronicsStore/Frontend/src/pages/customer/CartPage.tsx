import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Avatar,
  Skeleton,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  LocalShipping,
  Security,
  ArrowBack,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../../store/thunks/cartThunks';
import { toast } from 'react-toastify';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    items, 
    totalAmount, 
    totalItems, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.cart);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQuantityUpdate = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const calculateItemTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const calculateSavings = () => {
    return items.reduce((savings, item) => {
      const originalPrice = item.priceAtTime || item.currentPrice;
      return savings + ((originalPrice - item.currentPrice) * item.quantity);
    }, 0);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Please log in to view your cart.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="rectangular" width={100} height={100} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={24} width="60%" />
                      <Skeleton variant="text" height={20} width="40%" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => dispatch(fetchCart())} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCartOutlined sx={{ fontSize: 120, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Add some products to your cart to get started!
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  const savings = calculateSavings();
  const shippingCost = totalAmount >= 999 ? 0 : 50;
  const finalTotal = totalAmount + shippingCost;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/products')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Shopping Cart ({totalItems} items)
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Cart Items</Typography>
            <Button 
              color="error" 
              onClick={handleClearCart}
              disabled={items.length === 0}
            >
              Clear Cart
            </Button>
          </Box>

          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar
                    src={item.productImage}
                    alt={item.productName}
                    variant="rounded"
                    sx={{ width: 100, height: 100 }}
                  />
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {item.productName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h6" color="primary.main">
                        {formatPrice(item.currentPrice)}
                      </Typography>
                      {item.priceAtTime && item.priceAtTime > item.currentPrice && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          {formatPrice(item.priceAtTime)}
                        </Typography>
                      )}
                    </Box>
                    {item.quantity <= 5 && (
                      <Chip 
                        label={`Only ${item.quantity} left!`} 
                        color="warning" 
                        size="small" 
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                      <IconButton 
                        size="small"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          handleQuantityUpdate(item.id, newQuantity);
                        }}
                        inputProps={{
                          min: 1,
                          max: item.quantity,
                          style: { textAlign: 'center', width: '60px' }
                        }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { border: 'none' } } }}
                      />
                      <IconButton 
                        size="small"
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.quantity}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    {/* Item Total */}
                    <Typography variant="h6" color="primary.main">
                      {formatPrice(calculateItemTotal(item.currentPrice, item.quantity))}
                    </Typography>

                    {/* Remove Button */}
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal ({totalItems} items)</Typography>
                <Typography>{formatPrice(totalAmount)}</Typography>
              </Box>
              
              {savings > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="success.main">You Save</Typography>
                  <Typography color="success.main">-{formatPrice(savings)}</Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography color={shippingCost === 0 ? 'success.main' : 'text.primary'}>
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </Typography>
              </Box>
              
              {totalAmount < 999 && (
                <Typography variant="body2" color="info.main" sx={{ mb: 1 }}>
                  Add {formatPrice(999 - totalAmount)} more for FREE shipping!
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main">
                  {formatPrice(finalTotal)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/checkout')}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>

            {/* Benefits */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalShipping color="primary" fontSize="small" />
                <Typography variant="body2">Free shipping on orders above ₹999</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Security color="primary" fontSize="small" />
                <Typography variant="body2">100% secure checkout</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;