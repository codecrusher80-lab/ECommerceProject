import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  InputBase,
  alpha,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  FavoriteBorder,
  AccountCircle,
  Menu as MenuIcon,
  Notifications,
  Home,
  Category,
  Phone,
  Info,
  ExitToApp,
  Person,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const CustomerLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Products', icon: <Category />, path: '/products' },
    { text: 'Contact', icon: <Phone />, path: '/contact' },
    { text: 'About', icon: <Info />, path: '/about' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              flexGrow: isMobile ? 1 : 0,
              cursor: 'pointer',
              fontWeight: 'bold',
              color: 'primary.main',
              mr: 4,
            }}
          >
            Electronics Store
          </Typography>

          {/* Search Bar */}
          {!isMobile && (
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.common.black, 0.05),
                borderRadius: 1,
                px: 2,
                py: 0.5,
                mx: 2,
              }}
            >
              <Search sx={{ mr: 1, color: 'text.secondary' }} />
              <InputBase
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
          )}

          {/* Action Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAuthenticated && (
              <>
                <IconButton onClick={() => navigate('/wishlist')}>
                  <Badge badgeContent={wishlistItems.length} color="secondary">
                    <FavoriteBorder />
                  </Badge>
                </IconButton>

                <IconButton onClick={() => navigate('/cart')}>
                  <Badge badgeContent={cartItems.length} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                <IconButton>
                  <Badge badgeContent={0} color="secondary">
                    <Notifications />
                  </Badge>
                </IconButton>
              </>
            )}

            <IconButton onClick={isAuthenticated ? handleProfileMenuOpen : () => navigate('/login')}>
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Search Bar */}
      {isMobile && (
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            px: 2,
            py: 1,
          }}
        >
          <Search sx={{ mr: 1, color: 'text.secondary' }} />
          <InputBase
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
            Electronics Store
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
          <ShoppingCart sx={{ mr: 1 }} />
          My Orders
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 4,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2024 Electronics Store. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default CustomerLayout;