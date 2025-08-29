import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Paper
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon
} from '@mui/icons-material';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription submitted');
  };

  if (variant === 'minimal') {
    return (
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 3,
          backgroundColor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                © {currentYear} ElectronicsStore. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 2 }}>
                <Link to="/privacy" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Privacy Policy
                  </Typography>
                </Link>
                <Link to="/terms" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Terms of Service
                  </Typography>
                </Link>
                <Link to="/contact" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Contact
                  </Typography>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: theme.palette.grey[900],
        color: 'white',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        {/* Newsletter Section */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            p: 4,
            mb: 4,
            borderRadius: 2
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Stay Updated!
              </Typography>
              <Typography variant="body1">
                Get the latest deals, new products, and exclusive offers delivered to your inbox.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box component="form" onSubmit={handleNewsletterSubmit} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  sx={{
                    flexGrow: 1,
                    backgroundColor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none'
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100]
                    }
                  }}
                  startIcon={<SendIcon />}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              ElectronicsStore
            </Typography>
            <Typography variant="body2" color="grey.400" paragraph>
              Your one-stop destination for all electronic needs. We provide high-quality products
              with excellent customer service and competitive prices.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <IconButton
                href="https://facebook.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: '#1877F2' } }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                href="https://twitter.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: '#1DA1F2' } }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: '#E4405F' } }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                href="https://youtube.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: '#FF0000' } }}
              >
                <YouTubeIcon />
              </IconButton>
              <IconButton
                href="https://linkedin.com"
                target="_blank"
                sx={{ color: 'grey.400', '&:hover': { color: '#0A66C2' } }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <List sx={{ p: 0 }}>
              {[
                { text: 'About Us', to: '/about' },
                { text: 'Contact Us', to: '/contact' },
                { text: 'Track Order', to: '/track-order' },
                { text: 'Return Policy', to: '/returns' },
                { text: 'Shipping Info', to: '/shipping' },
                { text: 'FAQ', to: '/faq' }
              ].map((link) => (
                <ListItem key={link.text} sx={{ p: 0 }}>
                  <ListItemText>
                    <Link
                      to={link.to}
                      style={{
                        textDecoration: 'none',
                        color: theme.palette.grey[400],
                        fontSize: '0.875rem'
                      }}
                    >
                      {link.text}
                    </Link>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Categories */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Categories
            </Typography>
            <List sx={{ p: 0 }}>
              {[
                { text: 'Smartphones', to: '/category/smartphones' },
                { text: 'Laptops', to: '/category/laptops' },
                { text: 'Tablets', to: '/category/tablets' },
                { text: 'Headphones', to: '/category/headphones' },
                { text: 'Smart Watches', to: '/category/smartwatches' },
                { text: 'Gaming', to: '/category/gaming' }
              ].map((link) => (
                <ListItem key={link.text} sx={{ p: 0 }}>
                  <ListItemText>
                    <Link
                      to={link.to}
                      style={{
                        textDecoration: 'none',
                        color: theme.palette.grey[400],
                        fontSize: '0.875rem'
                      }}
                    >
                      {link.text}
                    </Link>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon sx={{ color: 'grey.400', fontSize: '1.2rem' }} />
                <Typography variant="body2" color="grey.400">
                  123 Electronics Street<br />
                  Tech City, TC 12345
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: 'grey.400', fontSize: '1.2rem' }} />
                <Typography variant="body2" color="grey.400">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: 'grey.400', fontSize: '1.2rem' }} />
                <Typography variant="body2" color="grey.400">
                  support@electronicsstore.com
                </Typography>
              </Box>
            </Box>

            {/* Business Hours */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Business Hours
              </Typography>
              <Typography variant="body2" color="grey.400">
                Monday - Friday: 9:00 AM - 8:00 PM<br />
                Saturday: 10:00 AM - 6:00 PM<br />
                Sunday: 12:00 PM - 5:00 PM
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'grey.700' }} />

        {/* Bottom Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="grey.400">
              © {currentYear} ElectronicsStore. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 3 }}>
              <Link to="/privacy" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'white' } }}>
                  Privacy Policy
                </Typography>
              </Link>
              <Link to="/terms" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'white' } }}>
                  Terms of Service
                </Typography>
              </Link>
              <Link to="/cookies" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'white' } }}>
                  Cookie Policy
                </Typography>
              </Link>
              <Link to="/accessibility" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="grey.400" sx={{ '&:hover': { color: 'white' } }}>
                  Accessibility
                </Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Payment Methods & Security */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="grey.500" gutterBottom>
            Secure payments powered by industry-leading encryption
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            {/* Payment method icons would go here */}
            <Typography variant="body2" color="grey.500">
              💳 Visa • Mastercard • PayPal • Apple Pay • Google Pay
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;