import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const CartPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Cart
      </Typography>
      <Box>
        <Typography>CartPage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default CartPage;
