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
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Divider,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Delete,
  ShoppingCart,
  FavoriteBorder,
  Favorite,
  Share,
  Visibility,
  FilterList,
  Sort,
  GridView,
  ViewList,
  Star,
  LocalOffer
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addToCart } from '../../store/slices/cartSlice';
import { removeFromWishlist, fetchWishlist, clearWishlist } from '../../store/slices/wishlistSlice';
import { WishlistItem } from '../../types';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type SortBy = 'name' | 'price' | 'added_date' | 'rating';
type ViewMode = 'grid' | 'list';

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems, loading, error } = useAppSelector(state => state.wishlist);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('added_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedItemForShare, setSelectedItemForShare] = useState<WishlistItem | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleAddToCart = (item: WishlistItem, quantity: number = 1) => {
    dispatch(addToCart({
      productId: item.productId,
      quantity
    }));
  };

  const handleRemoveFromWishlist = (item: WishlistItem) => {
    dispatch(removeFromWishlist(item.productId));
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleBulkDelete = () => {
    selectedItems.forEach(itemId => {
      const item = wishlistItems.find(item => item.id === itemId);
      if (item) {
        dispatch(removeFromWishlist(item.productId));
      }
    });
    setSelectedItems([]);
    setBulkDeleteOpen(false);
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
  };

  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleShare = (item: WishlistItem) => {
    const url = `${window.location.origin}/products/${item.productId}`;
    const text = `Check out this product: ${item.product.name}`;
    
    if (navigator.share) {
      navigator.share({
        title: item.product.name,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Product link copied to clipboard!');
    }
  };

  const sortedItems = React.useMemo(() => {
    const sorted = [...wishlistItems].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' 
            ? a.product.name.localeCompare(b.product.name)
            : b.product.name.localeCompare(a.product.name);
        case 'price':
          return sortOrder === 'asc'
            ? a.product.price - b.product.price
            : b.product.price - a.product.price;
        case 'rating':
          return sortOrder === 'asc'
            ? a.product.averageRating - b.product.averageRating
            : b.product.averageRating - a.product.averageRating;
        case 'added_date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return sorted;
  }, [wishlistItems, sortBy, sortOrder]);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please Login to View Your Wishlist
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You need to be logged in to access your wishlist.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Wishlist
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved for later
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {wishlistItems.length === 0 && !loading ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Save items you love to your wishlist and shop them later.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <>
          {/* Controls */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value="added_date">Date Added</option>
                  <option value="name">Product Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="Order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
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
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < wishlistItems.length}
                      onChange={handleSelectAll}
                    />
                  }
                  label="Select All"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={1}>
                  {selectedItems.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setBulkDeleteOpen(true)}
                      size="small"
                    >
                      Delete Selected ({selectedItems.length})
                    </Button>
                  )}
                  {wishlistItems.length > 0 && (
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleClearWishlist}
                      size="small"
                    >
                      Clear All
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Wishlist Items */}
          <Grid container spacing={3}>
            {sortedItems.map((item) => (
              <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} lg={viewMode === 'grid' ? 3 : 12} key={item.id}>
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
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                      bgcolor: 'white',
                      borderRadius: '50%',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  />
                  
                  <CardMedia
                    component="img"
                    sx={{
                      width: viewMode === 'grid' ? '100%' : 200,
                      height: viewMode === 'grid' ? 250 : 150,
                      objectFit: 'contain',
                      cursor: 'pointer'
                    }}
                    image={item.product.images?.[0]?.imageUrl || '/placeholder-product.png'}
                    alt={item.product.name}
                    onClick={() => navigate(`/products/${item.productId}`)}
                  />

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' }
                        }}
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.product.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.product.brand?.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Star sx={{ color: 'gold', fontSize: 18 }} />
                        <Typography variant="body2">
                          {item.product.averageRating.toFixed(1)} ({item.product.totalReviews} reviews)
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h6" color="primary.main">
                          ₹{item.product.discountPrice || item.product.price.toLocaleString()}
                        </Typography>
                        {item.product.discountPrice && (
                          <Typography 
                            variant="body2" 
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            ₹{item.product.price.toLocaleString()}
                          </Typography>
                        )}
                        {item.product.discountPrice && (
                          <Chip 
                            label={`${Math.round((1 - item.product.discountPrice / item.product.price) * 100)}% OFF`}
                            color="secondary" 
                            size="small" 
                          />
                        )}
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Added on {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                      </Typography>

                      {item.product.stockQuantity === 0 && (
                        <Chip label="Out of Stock" color="error" size="small" sx={{ mt: 1 }} />
                      )}
                      {item.product.stockQuantity > 0 && item.product.stockQuantity <= 5 && (
                        <Chip label="Low Stock" color="warning" size="small" sx={{ mt: 1 }} />
                      )}
                    </CardContent>

                    <CardActions>
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(item)}
                        disabled={item.product.stockQuantity === 0}
                        size="small"
                        fullWidth={viewMode === 'grid'}
                      >
                        Add to Cart
                      </Button>
                      
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Remove from Wishlist">
                          <IconButton
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteConfirmOpen(true);
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Share Product">
                          <IconButton
                            onClick={() => handleShare(item)}
                          >
                            <Share />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="View Product">
                          <IconButton
                            onClick={() => navigate(`/products/${item.productId}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardActions>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Remove from Wishlist</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{itemToDelete?.product.name}" from your wishlist?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => itemToDelete && handleRemoveFromWishlist(itemToDelete)} 
            color="error" 
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
      >
        <DialogTitle>Remove Selected Items</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''} from your wishlist?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkDelete}
            color="error" 
            variant="contained"
          >
            Remove Selected
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WishlistPage;
