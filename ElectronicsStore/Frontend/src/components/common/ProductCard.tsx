import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Rating,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  FavoriteBorder as WishlistIcon,
  Favorite as WishlistFilledIcon,
  Share as ShareIcon,
  CompareArrows as CompareIcon,
  Visibility as QuickViewIcon,
  LocalOffer as OfferIcon,
  Star as StarIcon,
  MoreVert as MoreIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { Product } from '../../types';
import { RootState } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';

interface ProductCardProps {
  product?: Product;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showQuickActions?: boolean;
  showBadges?: boolean;
  onQuickView?: (product: Product) => void;
  onCompare?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  loading = false,
  variant = 'default',
  showQuickActions = true,
  showBadges = true,
  onQuickView,
  onCompare
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (loading || !product) {
    return <ProductCardSkeleton variant={variant} />;
  }

  const isInWishlist = wishlistItems.some(item => item.productId === product.id);
  const isInCart = cartItems.some(item => item.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addToCart({
      productId: product.id,
      quantity: 1,
      price: product.salePrice || product.price
    }));
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist({
        productId: product.id,
        addedAt: new Date()
      }));
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCompare?.(product);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareMenuAnchor(e.currentTarget);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMoreMenuAnchor(e.currentTarget);
  };

  const handleShareOption = (platform: string) => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const productTitle = encodeURIComponent(product.name);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${productTitle}&url=${encodeURIComponent(productUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${productTitle}%20${encodeURIComponent(productUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(productUrl);
        setShareMenuAnchor(null);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShareMenuAnchor(null);
  };

  const calculateDiscount = () => {
    if (product.salePrice && product.price > product.salePrice) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  };

  const renderBadges = () => {
    if (!showBadges) return null;

    const badges = [];
    const discount = calculateDiscount();

    if (discount > 0) {
      badges.push(
        <Chip
          key="discount"
          label={`${discount}% OFF`}
          color="error"
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
        />
      );
    }

    if (product.isNew) {
      badges.push(
        <Chip
          key="new"
          label="NEW"
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: discount > 0 ? 40 : 8, left: 8, zIndex: 1 }}
        />
      );
    }

    if (product.stock === 0) {
      badges.push(
        <Chip
          key="sold-out"
          label="SOLD OUT"
          color="default"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      );
    } else if (product.stock <= 5) {
      badges.push(
        <Chip
          key="low-stock"
          label={`Only ${product.stock} left`}
          color="warning"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      );
    }

    return badges;
  };

  const renderQuickActions = () => {
    if (!showQuickActions) return null;

    return (
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: 1,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          '.MuiCard-root:hover &': {
            opacity: 1
          }
        }}
      >
        <Tooltip title="Quick View">
          <IconButton
            size="small"
            onClick={handleQuickView}
            sx={{
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: theme.palette.primary.main, color: 'white' }
            }}
          >
            <QuickViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add to Compare">
          <IconButton
            size="small"
            onClick={handleCompare}
            sx={{
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: theme.palette.primary.main, color: 'white' }
            }}
          >
            <CompareIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share">
          <IconButton
            size="small"
            onClick={handleShareClick}
            sx={{
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: theme.palette.primary.main, color: 'white' }
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  const cardHeight = variant === 'compact' ? 300 : variant === 'detailed' ? 500 : 400;
  const imageHeight = variant === 'compact' ? 140 : variant === 'detailed' ? 250 : 200;

  return (
    <>
      <Card
        sx={{
          height: cardHeight,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          }
        }}
        onClick={handleProductClick}
      >
        {/* Badges */}
        {renderBadges()}

        {/* Product Image */}
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {imageLoading && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={imageHeight}
              animation="wave"
            />
          )}
          
          <CardMedia
            component="img"
            height={imageHeight}
            image={imageError ? '/placeholder-product.png' : product.imageUrl}
            alt={product.name}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            sx={{
              objectFit: 'cover',
              display: imageLoading ? 'none' : 'block'
            }}
          />

          {/* Quick Actions Overlay */}
          {renderQuickActions()}

          {/* Wishlist Button */}
          <IconButton
            onClick={handleWishlistToggle}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'white',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: 'white',
                transform: 'scale(1.1)'
              }
            }}
            size="small"
          >
            {isInWishlist ? (
              <WishlistFilledIcon color="error" fontSize="small" />
            ) : (
              <WishlistIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        {/* Product Info */}
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: '0.75rem' }}
          >
            {product.category}
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              fontSize: variant === 'compact' ? '0.9rem' : '1rem',
              fontWeight: 600,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.name}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating
              value={product.averageRating || 0}
              precision={0.1}
              size="small"
              readOnly
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({product.reviewCount || 0})
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
              sx={{ fontSize: variant === 'compact' ? '1rem' : '1.1rem' }}
            >
              ${product.salePrice || product.price}
            </Typography>
            {product.salePrice && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'line-through' }}
              >
                ${product.price}
              </Typography>
            )}
          </Box>

          {/* Additional Info for Detailed Variant */}
          {variant === 'detailed' && product.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 1
              }}
            >
              {product.description}
            </Typography>
          )}

          {/* Stock Status */}
          {product.stock <= 5 && product.stock > 0 && (
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
              Only {product.stock} left in stock
            </Typography>
          )}
        </CardContent>

        {/* Action Buttons */}
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CartIcon />}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isInCart}
            size={variant === 'compact' ? 'small' : 'medium'}
          >
            {product.stock === 0 ? 'Out of Stock' : 
             isInCart ? 'In Cart' : 'Add to Cart'}
          </Button>

          <IconButton onClick={handleMoreClick} size="small">
            <MoreIcon />
          </IconButton>
        </CardActions>
      </Card>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenuAnchor}
        open={Boolean(shareMenuAnchor)}
        onClose={() => setShareMenuAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={() => handleShareOption('facebook')}>
          <ListItemIcon><FacebookIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareOption('twitter')}>
          <ListItemIcon><TwitterIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareOption('whatsapp')}>
          <ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShareOption('copy')}>
          <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>

      {/* More Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleQuickView}>
          <ListItemIcon><QuickViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Quick View</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCompare}>
          <ListItemIcon><CompareIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Add to Compare</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareClick}>
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

// Skeleton component for loading state
const ProductCardSkeleton: React.FC<{ variant: string }> = ({ variant }) => {
  const cardHeight = variant === 'compact' ? 300 : variant === 'detailed' ? 500 : 400;
  const imageHeight = variant === 'compact' ? 140 : variant === 'detailed' ? 250 : 200;

  return (
    <Card sx={{ height: cardHeight, display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" width="100%" height={imageHeight} animation="wave" />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="80%" height={28} />
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Skeleton variant="rectangular" width="100%" height={36} />
      </CardActions>
    </Card>
  );
};

export default ProductCard;