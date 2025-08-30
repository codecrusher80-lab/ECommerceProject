import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper,
  TextField,
  MenuItem,
  Slider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Pagination,
  Stack,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Tooltip,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  Fab,
  Badge
} from '@mui/material';
import {
  GridView,
  ViewList,
  FilterList,
  Sort,
  ExpandMore,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility,
  Star,
  Close,
  TuneRounded
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProducts, fetchCategories, fetchBrands } from '../../store/thunks/productThunks';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { Product, ProductFilter } from '../../types';
import { useNavigate, useSearchParams } from 'react-router-dom';

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'price' | 'rating' | 'newest';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { 
    items: products, 
    categories, 
    brands, 
    loading, 
    error,
    totalPages,
    currentPage 
  } = useAppSelector(state => state.products);
  
  const { items: wishlistItems } = useAppSelector(state => state.wishlist);
  const { items: cartItems } = useAppSelector(state => state.cart);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<ProductFilter>({
    categoryId: undefined,
    brandId: undefined,
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    inStock: undefined,
    isFeatured: undefined,
    colors: [],
    sizes: []
  });
  
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [searchTerm, setSearchTerm] = useState('');

  // Available filter options
  const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold'];
  const sizes = ['Small', 'Medium', 'Large', 'XL', 'XXL'];
  const ratings = [4, 3, 2, 1];

  useEffect(() => {
    // Get initial filters from URL params
    const categoryId = searchParams.get('category');
    const brandId = searchParams.get('brand');
    const search = searchParams.get('search');
    
    if (categoryId) setFilters(prev => ({ ...prev, categoryId: Number(categoryId) }));
    if (brandId) setFilters(prev => ({ ...prev, brandId: Number(brandId) }));
    if (search) setSearchTerm(search);
    
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch, searchParams]);

  useEffect(() => {
    const finalFilters = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1]
    };
    
    dispatch(fetchProducts({
      page,
      pageSize: 12,
      searchTerm,
      sortBy,
      sortDescending: sortOrder === 'desc',
      filters: finalFilters
    }));
  }, [dispatch, page, sortBy, sortOrder, filters, priceRange, searchTerm]);

  const handleFilterChange = (field: keyof ProductFilter, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

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

  const isInCart = (productId: number) => {
    return cartItems.some(item => item.productId === productId);
  };

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      brandId: undefined,
      minPrice: 0,
      maxPrice: 100000,
      minRating: 0,
      inStock: undefined,
      isFeatured: undefined,
      colors: [],
      sizes: []
    });
    setPriceRange([0, 100000]);
    setSearchTerm('');
    setPage(1);
  };

  const FilterContent = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
        <Button size="small" onClick={clearFilters} sx={{ ml: 2 }}>
          Clear All
        </Button>
      </Typography>

      {/* Search */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Search</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
          />
        </AccordionDetails>
      </Accordion>

      {/* Category Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Category</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
              input={<OutlinedInput label="Category" />}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Brand Filter */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Brand</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth size="small">
            <InputLabel>Brand</InputLabel>
            <Select
              value={filters.brandId || ''}
              onChange={(e) => handleFilterChange('brandId', e.target.value || undefined)}
              input={<OutlinedInput label="Brand" />}
            >
              <MenuItem value="">All Brands</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 2 }}>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => setPriceRange(newValue as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={100000}
              step={1000}
              marks={[
                { value: 0, label: '₹0' },
                { value: 25000, label: '₹25K' },
                { value: 50000, label: '₹50K' },
                { value: 75000, label: '₹75K' },
                { value: 100000, label: '₹1L' }
              ]}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption">
                ₹{priceRange[0].toLocaleString()}
              </Typography>
              <Typography variant="caption">
                ₹{priceRange[1].toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Rating Filter */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Rating</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            {ratings.map((rating) => (
              <Box
                key={rating}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'grey.100' },
                  bgcolor: filters.minRating === rating ? 'primary.50' : 'transparent'
                }}
                onClick={() => handleFilterChange('minRating', rating)}
              >
                <Rating value={rating} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  & up
                </Typography>
              </Box>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Stock Status */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Availability</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'grey.100' },
                bgcolor: filters.inStock === true ? 'primary.50' : 'transparent'
              }}
              onClick={() => handleFilterChange('inStock', filters.inStock === true ? undefined : true)}
            >
              <Checkbox 
                checked={filters.inStock === true} 
                size="small"
              />
              <Typography variant="body2">In Stock Only</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'grey.100' },
                bgcolor: filters.isFeatured === true ? 'primary.50' : 'transparent'
              }}
              onClick={() => handleFilterChange('isFeatured', filters.isFeatured === true ? undefined : true)}
            >
              <Checkbox 
                checked={filters.isFeatured === true} 
                size="small"
              />
              <Typography variant="body2">Featured Only</Typography>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" onClick={() => navigate('/')}>
          Home
        </Link>
        <Typography color="text.primary">Products</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        
        {/* Mobile Filter Button */}
        <IconButton
          onClick={() => setFiltersOpen(true)}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <TuneRounded />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filters Sidebar - Desktop */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper>
            <FilterContent />
          </Paper>
        </Grid>

        {/* Products Content */}
        <Grid item xs={12} md={9}>
          {/* Controls */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body1">
                Showing {products.length} products
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Sort */}
                <TextField
                  select
                  size="small"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as SortBy);
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="newest-desc">Newest First</MenuItem>
                  <MenuItem value="name-asc">Name A-Z</MenuItem>
                  <MenuItem value="name-desc">Name Z-A</MenuItem>
                  <MenuItem value="price-asc">Price Low to High</MenuItem>
                  <MenuItem value="price-desc">Price High to Low</MenuItem>
                  <MenuItem value="rating-desc">Highest Rated</MenuItem>
                </TextField>
                
                {/* View Mode */}
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Grid View">
                    <IconButton
                      onClick={() => setViewMode('grid')}
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                    >
                      <GridView />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="List View">
                    <IconButton
                      onClick={() => setViewMode('list')}
                      color={viewMode === 'list' ? 'primary' : 'default'}
                    >
                      <ViewList />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Box>
          </Paper>

          {/* Products Grid/List */}
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(12)].map((_, index) => (
                <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" height={250} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : products.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No products found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or search terms.
              </Typography>
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={product.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: viewMode === 'grid' ? 'column' : 'row',
                      position: 'relative',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
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

                    {/* Product Image */}
                    <CardMedia
                      component="img"
                      sx={{
                        width: viewMode === 'grid' ? '100%' : 200,
                        height: viewMode === 'grid' ? 250 : 200,
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                      image={product.images?.[0]?.imageUrl || '/placeholder-product.png'}
                      alt={product.name}
                      onClick={() => navigate(`/products/${product.id}`)}
                    />

                    {/* Product Info */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          gutterBottom
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
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
                          {product.discountPrice && (
                            <Chip 
                              label={`${Math.round((1 - product.discountPrice / product.price) * 100)}% OFF`}
                              color="secondary" 
                              size="small" 
                            />
                          )}
                        </Box>

                        {product.isFeatured && (
                          <Chip label="Featured" color="primary" size="small" sx={{ mr: 1 }} />
                        )}
                        
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
                          fullWidth={viewMode === 'grid'}
                        >
                          {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                        </Button>
                        
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 300, position: 'relative' }}>
          <IconButton
            onClick={() => setFiltersOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          >
            <Close />
          </IconButton>
          <FilterContent />
        </Box>
      </Drawer>

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/cart')}
        >
          <Badge badgeContent={cartItems.length} color="secondary">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}
    </Container>
  );
};

export default ProductsPage;