import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const OrderSuccessPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        OrderSuccess
      </Typography>
      <Box>
        <Typography>OrderSuccessPage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default OrderSuccessPage;
