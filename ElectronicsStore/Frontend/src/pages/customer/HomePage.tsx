import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Paper,
  Chip,
  Skeleton,
  CardActions,
  IconButton,
  Rating,
  Stack,
  Alert,
  Avatar,
  TextField
} from '@mui/material';
import {
  LocalShipping,
  Security,
  Support,
  Replay,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Star,
  TrendingUp,
  Category,
  LocalOffer,
  ArrowForward
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchFeaturedProducts, fetchCategories } from '../../store/thunks/productThunks';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { 
    featuredProducts, 
    categories, 
    loading: productsLoading, 
    error 
  } = useAppSelector(state => state.products);
  
  const { items: wishlistItems } = useAppSelector(state => state.wishlist);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Mock homepage statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    happyCustomers: 0,
    ordersDelivered: 0
  });

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
    
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalProducts: 2500,
        totalCategories: 24,
        happyCustomers: 15000,
        ordersDelivered: 25000
      });
      setStatsLoading(false);
    }, 1000);
  }, [dispatch]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const handleToggleWishlist = (product: Product) => {
    const isInWishlist = wishlistItems.some(item => item.productId === product.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product.id));
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const offers = [
    {
      title: 'Flash Sale',
      description: 'Up to 70% OFF on Electronics',
      color: '#f44336',
      action: 'Shop Now'
    },
    {
      title: 'New Arrivals',
      description: 'Latest Electronic Components',
      color: '#2196f3',
      action: 'Explore'
    },
    {
      title: 'Bundle Deals',
      description: 'Buy 2 Get 1 Free on Select Items',
      color: '#4caf50',
      action: 'View Deals'
    }
  ];

  const features = [
    {
      icon: <LocalShipping />,
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹999',
      color: '#2196f3'
    },
    {
      icon: <Security />,
      title: 'Secure Payments',
      description: '100% secure payment gateway',
      color: '#4caf50'
    },
    {
      icon: <Support />,
      title: '24/7 Support',
      description: 'Round the clock customer support',
      color: '#ff9800'
    },
    {
      icon: <Replay />,
      title: 'Easy Returns',
      description: '7-day hassle-free returns',
      color: '#9c27b0'
    },
  ];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4,
          borderRadius: 2
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Electronics Store
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                Your One-Stop Shop for Electronic Components
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                From Arduino boards to sensors, capacitors to ICs - find all your electronic components 
                with genuine products, competitive prices, and fast delivery.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  onClick={() => navigate('/products')}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                  onClick={() => navigate('/products?category=1')}
                >
                  View Categories
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                <img
                  src="/api/placeholder/600/400"
                  alt="Electronic Components"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    maxHeight: '400px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            { label: 'Products', value: stats.totalProducts, icon: <LocalOffer /> },
            { label: 'Categories', value: stats.totalCategories, icon: <Category /> },
            { label: 'Happy Customers', value: stats.happyCustomers, icon: <Star /> },
            { label: 'Orders Delivered', value: stats.ordersDelivered, icon: <TrendingUp /> }
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(45deg, #f5f5f5 0%, #ffffff 100%)'
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {React.cloneElement(stat.icon, { fontSize: 'large' })}
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {statsLoading ? (
                    <Skeleton width={80} />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Features Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}25 100%)`,
                  border: `1px solid ${feature.color}30`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ color: feature.color, mb: 2 }}>
                  {React.cloneElement(feature.icon, { fontSize: 'large' })}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ color: feature.color }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Special Offers Section */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {offers.map((offer, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  background: `linear-gradient(135deg, ${offer.color}15 0%, ${offer.color}25 100%)`,
                  border: `1px solid ${offer.color}30`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate('/products')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalOffer sx={{ color: offer.color, mr: 1 }} />
                  <Typography variant="h6" sx={{ color: offer.color }}>
                    {offer.title}
                  </Typography>
                </Box>
                <Typography variant="body1" gutterBottom>
                  {offer.description}
                </Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    bgcolor: offer.color,
                    '&:hover': { bgcolor: offer.color }
                  }}
                  endIcon={<ArrowForward />}
                >
                  {offer.action}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Categories Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {productsLoading ? (
            [...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            categories.slice(0, 8).map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => navigate(`/products?category=${category.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.imageUrl || '/api/placeholder/300/200'}
                    alt={category.name}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description || 'Explore products in this category'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        
        {categories.length > 8 && (
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
              endIcon={<ArrowForward />}
            >
              View All Categories
            </Button>
          </Box>
        )}

        {/* Featured Products Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Featured Products
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {productsLoading ? (
            [...Array(8)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={250} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            featuredProducts.slice(0, 8).map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {/* Wishlist Button */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWishlist(product);
                    }}
                  >
                    {isInWishlist(product.id) ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>

                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="250"
                      image={product.images?.[0]?.imageUrl || '/api/placeholder/300/250'}
                      alt={product.name}
                      sx={{ 
                        objectFit: 'contain', 
                        cursor: 'pointer',
                        p: 1
                      }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    />
                    {product.discountPrice && (
                      <Chip
                        label={`${Math.round((1 - product.discountPrice / product.price) * 100)}% OFF`}
                        color="secondary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                        }}
                      />
                    )}
                  </Box>
                  
                  <CardContent sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      noWrap
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {product.brand?.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={product.averageRating} readOnly size="small" />
                      <Typography variant="body2">
                        ({product.totalReviews})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="h6" color="primary.main">
                        ₹{(product.discountPrice || product.price).toLocaleString()}
                      </Typography>
                      {product.discountPrice && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          ₹{product.price.toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    {product.stockQuantity === 0 && (
                      <Chip label="Out of Stock" color="error" size="small" />
                    )}
                    {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
                      <Chip label="Low Stock" color="warning" size="small" />
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity === 0}
                      size="small"
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
        
        {featuredProducts.length > 8 && (
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products?featured=true')}
              endIcon={<ArrowForward />}
            >
              View All Featured Products
            </Button>
          </Box>
        )}

        {/* Newsletter Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mb: 4,
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom>
            Stay Updated with Latest Products
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Subscribe to our newsletter and get notified about new arrivals, special offers, and electronic component deals
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}
          >
            <TextField
              fullWidth
              placeholder="Enter your email address"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused fieldset': { borderColor: 'transparent' }
                }
              }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255,255,255,0.5)'
                },
                minWidth: { xs: 'auto', sm: '140px' }
              }}
            >
              Subscribe
            </Button>
          </Stack>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': { 
                borderColor: 'white', 
                bgcolor: 'rgba(255,255,255,0.1)' 
              },
            }}
            onClick={() => navigate('/products')}
            endIcon={<ArrowForward />}
          >
            Browse All Products
          </Button>
        </Paper>
      </Container>

      {/* Footer Features */}
      <Box sx={{ bgcolor: 'grey.50', py: 4, mt: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" component="h2" textAlign="center" gutterBottom sx={{ mb: 4 }}>
            Why Choose Our Electronics Store?
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                icon: <Security />,
                title: 'Genuine Products',
                description: 'All our electronic components are sourced directly from authorized manufacturers'
              },
              {
                icon: <LocalShipping />,
                title: 'Fast Delivery',
                description: 'Quick delivery across India with real-time tracking and secure packaging'
              },
              {
                icon: <Support />,
                title: 'Expert Support',
                description: 'Technical support from electronics experts to help you choose the right components'
              },
              {
                icon: <Star />,
                title: 'Quality Assurance',
                description: 'Rigorous quality checks and testing to ensure you receive the best products'
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;