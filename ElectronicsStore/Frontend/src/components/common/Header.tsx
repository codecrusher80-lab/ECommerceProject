import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Drawer
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  FavoriteBorder as WishlistIcon,
  AccountCircle as AccountIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ShoppingBag as OrdersIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Category as CategoryIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { clearWishlist } from '../../store/slices/wishlistSlice';
import { notificationService } from '../../services/notificationService';

interface HeaderProps {
  onCategoryMenuOpen?: () => void;
  showCategoryMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onCategoryMenuOpen, showCategoryMenu = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: cartItems, totalItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);

  // Load unread notifications count
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadNotifications();
    }
  }, [isAuthenticated]);

  const loadUnreadNotifications = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading unread notifications:', error);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      // This would typically call a product search service
      // For now, we'll simulate with local data
      setSearchResults([]);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearWishlist());
    handleAccountMenuClose();
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderSearchBar = () => (
    <Box sx={{ position: 'relative', flexGrow: 1, maxWidth: 600, mx: 2 }} ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none'
              }
            }
          }}
          size="small"
        />
      </form>

      {/* Search Results Dropdown */}
      {showSearchResults && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1
          }}
        >
          {searchResults.length > 0 ? (
            <List>
              {searchResults.map((result, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => {
                    navigate(`/product/${result.id}`);
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                >
                  <ListItemText primary={result.name} secondary={result.category} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box p={2}>
              <Typography variant="body2" color="text.secondary">
                {searchQuery.length < 2 ? 'Type at least 2 characters to search' : 'No results found'}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );

  const renderUserActions = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Notifications */}
      {isAuthenticated && (
        <IconButton
          color="inherit"
          onClick={handleNotificationMenuOpen}
          sx={{ color: 'white' }}
        >
          <Badge badgeContent={unreadNotifications} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      )}

      {/* Wishlist */}
      <IconButton
        color="inherit"
        onClick={() => navigate('/wishlist')}
        sx={{ color: 'white' }}
      >
        <Badge badgeContent={wishlistItems.length} color="error">
          <WishlistIcon />
        </Badge>
      </IconButton>

      {/* Cart */}
      <IconButton
        color="inherit"
        onClick={() => navigate('/cart')}
        sx={{ color: 'white' }}
      >
        <Badge badgeContent={totalItems} color="error">
          <CartIcon />
        </Badge>
      </IconButton>

      {/* Account */}
      {isAuthenticated ? (
        <IconButton onClick={handleAccountMenuOpen} sx={{ color: 'white' }}>
          <Avatar
            src={user?.avatar}
            alt={user?.name}
            sx={{ width: 32, height: 32 }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
        </IconButton>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ color: 'white' }}
          >
            Login
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/register')}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Sign Up
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ElectronicsStore
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Navigation Links */}
        <List>
          <ListItem button onClick={() => navigate('/')}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          {showCategoryMenu && (
            <ListItem button onClick={onCategoryMenuOpen}>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Categories" />
            </ListItem>
          )}

          {isAuthenticated && (
            <>
              <ListItem button onClick={() => navigate('/orders')}>
                <ListItemIcon>
                  <Badge badgeContent={0} color="primary">
                    <OrdersIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Orders" />
              </ListItem>

              <ListItem button onClick={() => navigate('/wishlist')}>
                <ListItemIcon>
                  <Badge badgeContent={wishlistItems.length} color="error">
                    <WishlistIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Wishlist" />
              </ListItem>

              <ListItem button onClick={() => navigate('/account')}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="My Account" />
              </ListItem>

              <ListItem button onClick={() => navigate('/settings')}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>

              <Divider sx={{ my: 1 }} />

              <ListItem button onClick={handleLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}

          {!isAuthenticated && (
            <>
              <ListItem button onClick={() => navigate('/login')}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="Login" />
              </ListItem>
            </>
          )}
        </List>

        <Box sx={{ mt: 'auto', p: 2 }}>
          <Chip
            label={`Cart: ${totalItems} items`}
            color="primary"
            onClick={() => navigate('/cart')}
            clickable
          />
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: theme.palette.primary.main }}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleMobileMenuToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              mr: 2,
              minWidth: 'fit-content'
            }}
          >
            ElectronicsStore
          </Typography>

          {/* Category Menu Button (Desktop) */}
          {!isMobile && showCategoryMenu && (
            <Button
              color="inherit"
              startIcon={<CategoryIcon />}
              onClick={onCategoryMenuOpen}
              sx={{ mr: 2, color: 'white' }}
            >
              Categories
            </Button>
          )}

          {/* Search Bar (Desktop) */}
          {!isMobile && renderSearchBar()}

          {/* User Actions (Desktop) */}
          {!isMobile && renderUserActions()}
        </Toolbar>

        {/* Search Bar (Mobile) */}
        {isMobile && (
          <Toolbar sx={{ pt: 0 }}>
            {renderSearchBar()}
          </Toolbar>
        )}
      </AppBar>

      {/* Mobile Menu */}
      {renderMobileMenu()}

      {/* Account Menu */}
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/account'); handleAccountMenuClose(); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          My Account
        </MenuItem>
        <MenuItem onClick={() => { navigate('/orders'); handleAccountMenuClose(); }}>
          <ListItemIcon><OrdersIcon fontSize="small" /></ListItemIcon>
          Orders
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleAccountMenuClose(); }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadNotifications > 0 && (
            <Chip
              size="small"
              label={`${unreadNotifications} unread`}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No new notifications
          </Typography>
          <Button
            size="small"
            onClick={() => {
              navigate('/notifications');
              handleNotificationMenuClose();
            }}
            sx={{ mt: 1 }}
          >
            View All
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default Header;