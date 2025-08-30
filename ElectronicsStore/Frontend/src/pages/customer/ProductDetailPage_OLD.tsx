import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  Rating,
  Chip,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  Stack,
  CardContent,
  CardActions
} from '@mui/material';
import {
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Share,
  Add,
  Remove,
  LocalShipping,
  Security,
  Replay,
  ArrowBack
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProductById } from '../../store/thunks/productThunks';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { Product } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { 
    items: products,
    loading,
    error 
  } = useAppSelector((state) => state.products);
  
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id);
      const product = products.find(p => p.id === productId);
      if (product) {
        setCurrentProduct(product);
        // Get related products from same category
        const related = products.filter(p => 
          p.id !== productId && 
          p.category.id === product.category.id
        ).slice(0, 4);
        setRelatedProducts(related);
      } else {
        // Try to fetch if not in store
        dispatch(fetchProductById(productId));
      }
    }
  }, [dispatch, id, products]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!currentProduct) return;

    dispatch(addToCart({ productId: currentProduct.id, quantity }));
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (currentProduct?.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!currentProduct) return;
    
    const isInWishlist = wishlistItems.some(item => item.productId === currentProduct.id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(currentProduct.id));
    } else {
      dispatch(addToWishlist(currentProduct.id));
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const isInCart = (productId: number) => {
    return cartItems.some(item => item.productId === productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const calculateDiscount = (originalPrice: number, discountPrice: number) => {
    const discount = ((originalPrice - discountPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={30} width="60%" />
            <Skeleton variant="text" height={60} />
            <Skeleton variant="rectangular" height={80} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !currentProduct) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Product not found'}
        </Alert>
        <Button onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  const product = currentProduct;
  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Product not found
        </Alert>
        <Button 
          onClick={() => navigate('/products')} 
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const discount = product.discountPrice 
    ? calculateDiscount(product.price, product.discountPrice)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/')}>
          Home
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/products')}>
          Products
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate(`/products?category=${product.category.id}`)}>
          {product.category.name}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images?.[selectedImageIndex]?.imageUrl || '/images/default-product.jpg'}
              alt={product.name}
            />
          </Card>
          {product.images && product.images.length > 1 && (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              {product.images.map((image, index) => (
                <Grid item xs={2} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? 2 : 0,
                      borderColor: 'primary.main'
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <CardMedia
                      component="img"
                      height="80"
                      image={image.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              by {product.brand.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Rating value={product.averageRating || 0} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary">
                ({product.totalReviews || 0} reviews)
              </Typography>
              {product.stockQuantity > 0 ? (
                <Chip label="In Stock" color="success" size="small" />
              ) : (
                <Chip label="Out of Stock" color="error" size="small" />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4" color="primary.main">
                {formatPrice(product.discountPrice || product.price)}
              </Typography>
              {product.discountPrice && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                  <Chip label={`${discount}% OFF`} color="secondary" />
                </>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            {/* Quantity Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1">Quantity:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Remove />
                </IconButton>
                <Typography sx={{ px: 2, py: 1, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton onClick={() => handleQuantityChange(1)} disabled={quantity >= (product.stockQuantity || 0)}>
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {product.stockQuantity} available
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
                sx={{ flex: 1 }}
              >
                {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
              </Button>
              <IconButton
                onClick={handleWishlistToggle}
                color={isInWishlist(product.id) ? 'error' : 'default'}
                sx={{ border: 1, borderColor: 'grey.300' }}
              >
                {isInWishlist(product.id) ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton sx={{ border: 1, borderColor: 'grey.300' }}>
                <Share />
              </IconButton>
            </Box>

            {/* Features */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Chip icon={<LocalShipping />} label="Free Shipping" variant="outlined" />
              <Chip icon={<Security />} label="Secure Payment" variant="outlined" />
              <Chip icon={<Replay />} label="Easy Returns" variant="outlined" />
            </Box>

            {/* Product Info */}
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Product Information</Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{product.category.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Brand:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{product.brand.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">SKU:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{product.sku}</Typography>
                </Grid>
                {product.weight && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Weight:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">{product.weight} grams</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Tabs Section */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Description" />
            <Tab label="Specifications" />
            <Tab label="Reviews" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">
            {product.longDescription || product.description}
          </Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Technical Specifications</Typography>
          {product.technicalSpecifications ? (
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              {product.technicalSpecifications}
            </pre>
          ) : (
            <Typography>No specifications available.</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Customer Reviews</Typography>
          <Typography>Reviews will be implemented here.</Typography>
        </TabPanel>
      </Box>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom>Related Products</Typography>
          <Grid container spacing={2}>
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                <Card
                  sx={{ 
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={relatedProduct.images?.[0]?.imageUrl || '/api/placeholder/300/200'}
                    alt={relatedProduct.name}
                    sx={{ objectFit: 'contain', p: 1 }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" noWrap gutterBottom>
                      {relatedProduct.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {relatedProduct.brand.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary.main">
                        {formatPrice(relatedProduct.discountPrice || relatedProduct.price)}
                      </Typography>
                      {relatedProduct.discountPrice && (
                        <Typography
                          variant="body2"
                          sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                        >
                          {formatPrice(relatedProduct.price)}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ShoppingCart />}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(addToCart({ productId: relatedProduct.id, quantity: 1 }));
                      }}
                      disabled={relatedProduct.stockQuantity <= 0}
                    >
                      {isInCart(relatedProduct.id) ? 'In Cart' : 'Add to Cart'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default ProductDetailPage;