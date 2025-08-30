import React from 'react';
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
} from '@mui/material';
import {
  LocalShipping,
  Security,
  Support,
  Replay,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const featuredCategories = [
    { id: 1, name: 'Smartphones', image: '/images/smartphones.jpg', count: 150 },
    { id: 2, name: 'Laptops', image: '/images/laptops.jpg', count: 85 },
    { id: 3, name: 'Headphones', image: '/images/headphones.jpg', count: 120 },
    { id: 4, name: 'Smart Watches', image: '/images/smartwatches.jpg', count: 75 },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 134900,
      originalPrice: 144900,
      image: '/images/iphone15pro.jpg',
      rating: 4.8,
      discount: '7% OFF',
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      price: 79999,
      originalPrice: 89999,
      image: '/images/galaxys24.jpg',
      rating: 4.6,
      discount: '11% OFF',
    },
    {
      id: 3,
      name: 'MacBook Pro M3',
      price: 199900,
      originalPrice: 219900,
      image: '/images/macbookpro.jpg',
      rating: 4.9,
      discount: '9% OFF',
    },
    {
      id: 4,
      name: 'AirPods Pro 2',
      price: 24900,
      originalPrice: 27900,
      image: '/images/airpodspro.jpg',
      rating: 4.7,
      discount: '11% OFF',
    },
  ];

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
          {featuredCategories.map((category) => (
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
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={category.image}
                  alt={category.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} Products
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Featured Products Section */}
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
          Featured Products
        </Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card
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
                    image={product.image}
                    alt={product.name}
                  />
                  <Chip
                    label={product.discount}
                    color="secondary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                    }}
                  />
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" color="primary.main">
                      ₹{product.price.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                    >
                      ₹{product.originalPrice.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    ⭐ {product.rating} Rating
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
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