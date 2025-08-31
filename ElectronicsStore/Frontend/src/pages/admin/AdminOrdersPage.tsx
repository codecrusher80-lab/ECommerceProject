import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  LinearProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Visibility,
  Edit,
  LocalShipping,
  Cancel,
  CheckCircle,
  Pending,
  Search,
  FilterList,
  Refresh,
  Download
} from '@mui/icons-material';
import { orderService, Order, OrderStatus, PaymentStatus } from '../../services/orderService';
import { format } from 'date-fns';

interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: '',
    status: undefined,
    paymentStatus: undefined
  });

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders({
        page: page + 1,
        pageSize: rowsPerPage,
        ...filters
      });
      setOrders(response.items);
      setTotalCount(response.totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      await fetchOrders();
      setStatusUpdateOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const getStatusChip = (status: OrderStatus) => {
    const statusConfig = {
      [OrderStatus.PENDING]: { color: 'warning' as const, icon: <Pending /> },
      [OrderStatus.CONFIRMED]: { color: 'info' as const, icon: <CheckCircle /> },
      [OrderStatus.PROCESSING]: { color: 'primary' as const, icon: <LocalShipping /> },
      [OrderStatus.SHIPPED]: { color: 'secondary' as const, icon: <LocalShipping /> },
      [OrderStatus.DELIVERED]: { color: 'success' as const, icon: <CheckCircle /> },
      [OrderStatus.CANCELLED]: { color: 'error' as const, icon: <Cancel /> }
    };

    const config = statusConfig[status];
    return (
      <Chip
        label={status.replace('_', ' ')}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  const getPaymentStatusChip = (status: PaymentStatus) => {
    const statusConfig = {
      [PaymentStatus.PENDING]: { color: 'warning' as const },
      [PaymentStatus.PAID]: { color: 'success' as const },
      [PaymentStatus.FAILED]: { color: 'error' as const },
      [PaymentStatus.REFUNDED]: { color: 'info' as const }
    };

    return (
      <Chip
        label={status.replace('_', ' ')}
        color={statusConfig[status].color}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  const handleFilterChange = (field: keyof OrderFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Order Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search Orders"
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Order Status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <MenuItem value="">All Status</MenuItem>
              {Object.values(OrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Payment Status"
              value={filters.paymentStatus || ''}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value || undefined)}
            >
              <MenuItem value="">All Payment Status</MenuItem>
              {Object.values(PaymentStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchOrders}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Download />}
              onClick={() => {/* Implement export */}}
            >
              Export Orders
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {order.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{order.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(order.status)}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusChip(order.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderDetailOpen(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                            setStatusUpdateOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Order Detail Dialog */}
      <Dialog
        open={orderDetailOpen}
        onClose={() => setOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={3}>
              {/* Order Info */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography><strong>Order Date:</strong> {format(new Date(selectedOrder.createdAt), 'PPP')}</Typography>
                    <Typography><strong>Status:</strong> {getStatusChip(selectedOrder.status)}</Typography>
                    <Typography><strong>Payment:</strong> {getPaymentStatusChip(selectedOrder.paymentStatus)}</Typography>
                    <Typography><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</Typography>
                    {selectedOrder.trackingNumber && (
                      <Typography><strong>Tracking:</strong> {selectedOrder.trackingNumber}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Shipping Address */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</Typography>
                    <Typography>{selectedOrder.shippingAddress.addressLine1}</Typography>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <Typography>{selectedOrder.shippingAddress.addressLine2}</Typography>
                    )}
                    <Typography>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</Typography>
                    <Typography>{selectedOrder.shippingAddress.country}</Typography>
                    {selectedOrder.shippingAddress.phone && (
                      <Typography><strong>Phone:</strong> {selectedOrder.shippingAddress.phone}</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Order Items</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">₹{item.price.toLocaleString()}</TableCell>
                            <TableCell align="right">₹{item.totalPrice.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Typography><strong>Subtotal:</strong> ₹{selectedOrder.subtotal.toLocaleString()}</Typography>
                      <Typography><strong>Tax:</strong> ₹{selectedOrder.tax.toLocaleString()}</Typography>
                      <Typography><strong>Shipping:</strong> ₹{selectedOrder.shipping.toLocaleString()}</Typography>
                      {selectedOrder.discount > 0 && (
                        <Typography><strong>Discount:</strong> -₹{selectedOrder.discount.toLocaleString()}</Typography>
                      )}
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        <strong>Total: ₹{selectedOrder.total.toLocaleString()}</strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog
        open={statusUpdateOpen}
        onClose={() => setStatusUpdateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            sx={{ mt: 2 }}
          >
            {Object.values(OrderStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleOrderStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrdersPage;
