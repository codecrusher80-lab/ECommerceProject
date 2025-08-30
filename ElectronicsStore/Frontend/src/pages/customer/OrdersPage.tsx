import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  Skeleton,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ShoppingBag,
  Visibility,
  RateReview,
  Download,
  LocalShipping,
  CheckCircle,
  Cancel,
  Refresh,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../store/store';

// Mock orders data - In real app, this would come from API
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'Delivered',
    totalAmount: 25999,
    items: [
      {
        id: 1,
        productName: 'Arduino Uno R3',
        quantity: 2,
        price: 12999,
        imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=150',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St, City, State 12345',
    },
    trackingSteps: [
      { label: 'Order Placed', completed: true, date: '2024-01-15' },
      { label: 'Processing', completed: true, date: '2024-01-16' },
      { label: 'Shipped', completed: true, date: '2024-01-17' },
      { label: 'Delivered', completed: true, date: '2024-01-18' },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'Shipped',
    totalAmount: 8500,
    items: [
      {
        id: 2,
        productName: 'ESP32 Development Board',
        quantity: 1,
        price: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=150',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St, City, State 12345',
    },
    trackingSteps: [
      { label: 'Order Placed', completed: true, date: '2024-01-20' },
      { label: 'Processing', completed: true, date: '2024-01-21' },
      { label: 'Shipped', completed: true, date: '2024-01-22' },
      { label: 'Delivered', completed: false, date: '' },
    ],
  },
];

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
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [orders] = useState(mockOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load orders
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [isAuthenticated, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle />;
      case 'shipped':
        return <LocalShipping />;
      case 'processing':
        return <Refresh />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <ShoppingBag />;
    }
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleWriteReview = (product: any) => {
    setSelectedProduct(product);
    setReviewDialogOpen(true);
  };

  const filterOrdersByStatus = (status?: string) => {
    if (!status) return orders;
    return orders.filter(order => order.status.toLowerCase() === status.toLowerCase());
  };

  const getTabOrders = () => {
    switch (tabValue) {
      case 0: return orders; // All
      case 1: return filterOrdersByStatus('processing'); // Processing
      case 2: return filterOrdersByStatus('shipped'); // Shipped
      case 3: return filterOrdersByStatus('delivered'); // Delivered
      case 4: return filterOrdersByStatus('cancelled'); // Cancelled
      default: return orders;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>My Orders</Typography>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Skeleton variant="rectangular" width={80} height={80} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Orders
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
      </Box>

      {/* Order Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${orders.length})`} />
          <Tab label={`Processing (${filterOrdersByStatus('processing').length})`} />
          <Tab label={`Shipped (${filterOrdersByStatus('shipped').length})`} />
          <Tab label={`Delivered (${filterOrdersByStatus('delivered').length})`} />
          <Tab label={`Cancelled (${filterOrdersByStatus('cancelled').length})`} />
        </Tabs>
      </Box>

      {/* Orders List */}
      <TabPanel value={tabValue} index={tabValue}>
        {getTabOrders().length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingBag sx={{ fontSize: 120, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start shopping to see your orders here!
            </Typography>
            <Button variant="contained" onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </Box>
        ) : (
          getTabOrders().map((order) => (
            <Card key={order.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box>
                      <Typography variant="subtitle1" color="primary">
                        {order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ordered on {order.date}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      icon={getStatusIcon(order.status)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {order.items.slice(0, 3).map((item, index) => (
                        <Avatar
                          key={index}
                          src={item.imageUrl}
                          alt={item.productName}
                          sx={{ width: 40, height: 40 }}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <Typography variant="body2" color="text.secondary">
                          +{order.items.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="h6" color="primary.main">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </Button>
                      {order.status === 'Delivered' && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RateReview />}
                          onClick={() => handleWriteReview(order.items[0])}
                        >
                          Review
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </TabPanel>

      {/* Order Detail Dialog */}
      <Dialog 
        open={orderDetailOpen} 
        onClose={() => setOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - {selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Order Status Tracking */}
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              <Stepper activeStep={selectedOrder.trackingSteps.filter((step: any) => step.completed).length - 1} sx={{ mb: 3 }}>
                {selectedOrder.trackingSteps.map((step: any, index: number) => (
                  <Step key={index}>
                    <StepLabel>
                      <Typography variant="body2">{step.label}</Typography>
                      {step.date && (
                        <Typography variant="caption" color="text.secondary">
                          {step.date}
                        </Typography>
                      )}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <Typography variant="h6" gutterBottom>
                Items Ordered
              </Typography>
              {selectedOrder.items.map((item: any) => (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Avatar
                    src={item.imageUrl}
                    alt={item.productName}
                    variant="rounded"
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{item.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatPrice(item.price * item.quantity)}
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Shipping Address */}
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography variant="body2">
                {selectedOrder.shippingAddress.name}<br />
                {selectedOrder.shippingAddress.address}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Order Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total Amount</Typography>
                <Typography variant="h6" color="primary.main">
                  {formatPrice(selectedOrder.totalAmount)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />}>
            Download Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.productName}
                  variant="rounded"
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  <Typography variant="subtitle1">{selectedProduct.productName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rate this product
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography component="legend">Rating</Typography>
                <Rating name="rating" size="large" />
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Write your review"
                placeholder="Share your experience with this product..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Submit Review</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersPage;