import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const OrdersPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders
      </Typography>
      <Box>
        <Typography>OrdersPage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default OrdersPage;
