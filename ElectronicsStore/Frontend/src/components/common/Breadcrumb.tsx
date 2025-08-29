import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumbs,
  Typography,
  Link,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  showBackButton?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
  variant?: 'default' | 'minimal';
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items: customItems,
  showHome = true,
  showBackButton = false,
  maxItems = 8,
  separator,
  variant = 'default'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auto-generate breadcrumbs from current path if no custom items provided
  const generateBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home if enabled
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        path: '/',
        icon: <HomeIcon fontSize="small" />
      });
    }

    // Generate breadcrumbs from path segments
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = formatSegmentLabel(segment);
      
      breadcrumbs.push({
        label,
        path: index === pathSegments.length - 1 ? undefined : path
      });
    });

    return breadcrumbs;
  };

  // Format path segment to readable label
  const formatSegmentLabel = (segment: string): string => {
    // Handle common routes
    const routeLabels: Record<string, string> = {
      'products': 'Products',
      'categories': 'Categories',
      'category': 'Category',
      'product': 'Product',
      'cart': 'Shopping Cart',
      'checkout': 'Checkout',
      'orders': 'My Orders',
      'order': 'Order',
      'wishlist': 'Wishlist',
      'account': 'My Account',
      'profile': 'Profile',
      'settings': 'Settings',
      'search': 'Search Results',
      'about': 'About Us',
      'contact': 'Contact Us',
      'help': 'Help',
      'faq': 'FAQ',
      'privacy': 'Privacy Policy',
      'terms': 'Terms of Service',
      'returns': 'Returns & Exchanges',
      'shipping': 'Shipping Information',
      'admin': 'Admin Panel',
      'dashboard': 'Dashboard'
    };

    // Check if it's a known route
    if (routeLabels[segment]) {
      return routeLabels[segment];
    }

    // Check if it's a UUID/ID (common pattern: contains hyphens or is all numbers)
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment) || 
        /^\d+$/.test(segment)) {
      return `#${segment.substring(0, 8)}...`;
    }

    // Convert kebab-case or snake_case to Title Case
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const breadcrumbItems = customItems || generateBreadcrumbsFromPath();

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1);
  };

  // Render minimal variant (usually for mobile)
  if (variant === 'minimal' || (isMobile && !customItems)) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          px: { xs: 1, sm: 2 }
        }}
      >
        {showBackButton && (
          <IconButton
            onClick={handleBackClick}
            size="small"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        {breadcrumbItems.length > 1 && (
          <Typography variant="body2" color="text.secondary">
            {breadcrumbItems[breadcrumbItems.length - 2]?.label} / 
          </Typography>
        )}
        
        <Typography
          variant="body2"
          color="text.primary"
          fontWeight="medium"
          sx={{ ml: 0.5 }}
        >
          {breadcrumbItems[breadcrumbItems.length - 1]?.label}
        </Typography>
      </Box>
    );
  }

  // Don't render if only home or less than 2 items
  if (breadcrumbItems.length < 2) {
    return null;
  }

  return (
    <Box
      sx={{
        py: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 2 },
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {showBackButton && (
          <IconButton
            onClick={handleBackClick}
            size="small"
            sx={{ mr: 2 }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Breadcrumbs
          separator={separator || <NavigateNextIcon fontSize="small" />}
          maxItems={isMobile ? 3 : maxItems}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={1}
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: { xs: 0.5, sm: 1 }
            }
          }}
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isClickable = !isLast && item.path;

            if (isClickable) {
              return (
                <Link
                  key={index}
                  component={RouterLink}
                  to={item.path!}
                  underline="hover"
                  color="inherit"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  {item.icon && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </Box>
                  )}
                  {item.label}
                </Link>
              );
            }

            return (
              <Typography
                key={index}
                color="text.primary"
                fontWeight={isLast ? 600 : 400}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {item.icon && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                )}
                {item.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      </Box>
    </Box>
  );
};

// Higher-order component to automatically add breadcrumbs to any page
export const withBreadcrumbs = (
  Component: React.ComponentType,
  customItems?: BreadcrumbItem[],
  options?: Partial<BreadcrumbProps>
) => {
  return (props: any) => (
    <>
      <Breadcrumb items={customItems} {...options} />
      <Component {...props} />
    </>
  );
};

// Hook to get current breadcrumb items
export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  
  const generateBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    breadcrumbs.push({
      label: 'Home',
      path: '/',
      icon: <HomeIcon fontSize="small" />
    });

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = formatSegmentLabel(segment);
      
      breadcrumbs.push({
        label,
        path: index === pathSegments.length - 1 ? undefined : path
      });
    });

    return breadcrumbs;
  };

  const formatSegmentLabel = (segment: string): string => {
    const routeLabels: Record<string, string> = {
      'products': 'Products',
      'categories': 'Categories',
      'category': 'Category',
      'product': 'Product',
      'cart': 'Shopping Cart',
      'checkout': 'Checkout',
      'orders': 'My Orders',
      'order': 'Order',
      'wishlist': 'Wishlist',
      'account': 'My Account',
      'profile': 'Profile',
      'settings': 'Settings',
      'search': 'Search Results'
    };

    if (routeLabels[segment]) {
      return routeLabels[segment];
    }

    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(segment) || 
        /^\d+$/.test(segment)) {
      return `#${segment.substring(0, 8)}...`;
    }

    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return generateBreadcrumbsFromPath();
};

export default Breadcrumb;