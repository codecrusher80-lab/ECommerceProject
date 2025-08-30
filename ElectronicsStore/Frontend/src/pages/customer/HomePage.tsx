import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Rating,
  Skeleton,
} from '@mui/material';
import {
  LocalShipping,
  Security,
  Support,
  Replay,
  ShoppingCart,
  FavoriteBorder,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';
import { fetchFeaturedProducts, fetchCategories } from '../../store/thunks/productThunks';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { 
    featuredProducts, 
    categories, 
    isFeaturedLoading, 
    isCategoriesLoading, 
    error 
  } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?category=${categoryId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const features = [
    {
      icon: <LocalShipping />,
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹999',
    },
    {
      icon: <Security />,
      title: 'Secure Payments',
      description: '100% secure payment gateway',
    },
    {
      icon: <Support />,
      title: '24/7 Support',
      description: 'Round the clock customer support',
    },
    {
      icon: <Replay />,
      title: 'Easy Returns',
      description: '7-day hassle-free returns',
    },
  ];

  if (error) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">
            Error loading page: {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Latest Electronics
              </Typography>
              <Typography variant="h5" component="h2" gutterBottom>
                Discover the Best Deals on Premium Electronics
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                From smartphones to laptops, find everything you need with genuine products,
                competitive prices, and excellent customer service.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Shop Now
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/images/hero-electronics.jpg"
                alt="Latest Electronics"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
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
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {React.cloneElement(feature.icon, { fontSize: 'large' })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Categories Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Shop by Category
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {isCategoriesLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            categories.slice(0, 4).map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Card
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.imageUrl || '/images/default-category.jpg'}
                    alt={category.name}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Featured Products Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Featured Products
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {isFeaturedLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={250} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} width="40%" />
                    <Skeleton variant="text" height={20} width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            featuredProducts.slice(0, 8).map((product) => {
              const discount = product.originalPrice && product.originalPrice > product.price 
                ? calculateDiscount(product.originalPrice, product.price)
                : 0;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Card
                    onClick={() => handleProductClick(product.id)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="250"
                        image={product.images?.[0]?.imageUrl || '/images/default-product.jpg'}
                        alt={product.name}
                      />
                      {discount > 0 && (
                        <Chip
                          label={`${discount}% OFF`}
                          color="secondary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          <FavoriteBorder fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" color="primary.main">
                          {formatPrice(product.price)}
                        </Typography>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Typography
                            variant="body2"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            {formatPrice(product.originalPrice)}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Rating value={product.averageRating || 0} precision={0.1} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary">
                          ({product.reviewCount || 0} reviews)
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        size="small"
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Call to Action */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
            mb: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Ready to Shop?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Discover thousands of products with best prices and fastest delivery
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Browse All Products
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;