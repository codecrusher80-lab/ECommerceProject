import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  Inventory,
  AttachMoney,
  Visibility,
  MoreVert,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { AppDispatch, RootState } from '../../store/store';

// Mock data - In real app, this would come from API
const mockStats = {
  totalRevenue: 1245600,
  totalOrders: 1847,
  totalCustomers: 892,
  totalProducts: 156,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 5.1,
};

const mockSalesData = [
  { name: 'Jan', sales: 65000 },
  { name: 'Feb', sales: 59000 },
  { name: 'Mar', sales: 80000 },
  { name: 'Apr', sales: 81000 },
  { name: 'May', sales: 56000 },
  { name: 'Jun', sales: 55000 },
  { name: 'Jul', sales: 40000 },
];

const mockCategoryData = [
  { name: 'Electronics', value: 45, color: '#0088FE' },
  { name: 'Computers', value: 30, color: '#00C49F' },
  { name: 'Accessories', value: 15, color: '#FFBB28' },
  { name: 'Others', value: 10, color: '#FF8042' },
];

const mockRecentOrders = [
  {
    id: '#ORD-001',
    customer: 'John Doe',
    amount: 15999,
    status: 'Completed',
    date: '2024-01-15',
  },
  {
    id: '#ORD-002',
    customer: 'Jane Smith',
    amount: 8500,
    status: 'Pending',
    date: '2024-01-15',
  },
  {
    id: '#ORD-003',
    customer: 'Mike Johnson',
    amount: 25000,
    status: 'Processing',
    date: '2024-01-14',
  },
  {
    id: '#ORD-004',
    customer: 'Sarah Wilson',
    amount: 3200,
    status: 'Shipped',
    date: '2024-01-14',
  },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && !user.roles?.includes('Admin')) {
      navigate('/');
      return;
    }

    // Load dashboard data
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000);
  }, [isAuthenticated, user, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon, 
    color = 'primary' 
  }: { 
    title: string; 
    value: string | number; 
    growth: number; 
    icon: React.ReactNode; 
    color?: 'primary' | 'success' | 'info' | 'warning'; 
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {growth > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              <Typography 
                variant="body2" 
                color={growth > 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {Math.abs(growth)}% from last month
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={140} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/admin/analytics')}>
          View Full Analytics
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(mockStats.totalRevenue)}
            growth={mockStats.revenueGrowth}
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={mockStats.totalOrders.toLocaleString()}
            growth={mockStats.ordersGrowth}
            icon={<ShoppingCart />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={mockStats.totalCustomers.toLocaleString()}
            growth={mockStats.customersGrowth}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={mockStats.totalProducts.toLocaleString()}
            growth={mockStats.productsGrowth}
            icon={<Inventory />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Sales Overview
              </Typography>
              <Button size="small" onClick={() => navigate('/admin/analytics')}>
                View Details
              </Button>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {mockCategoryData.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: entry.color,
                      borderRadius: '50%',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {entry.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entry.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Recent Orders
              </Typography>
              <Button onClick={() => navigate('/admin/orders')}>
                View All Orders
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRecentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {order.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/products')}
                >
                  Manage Products
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/orders')}
                >
                  View Orders
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/categories')}
                >
                  Categories
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/coupons')}
                >
                  Coupons
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/admin/settings')}
                >
                  Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;