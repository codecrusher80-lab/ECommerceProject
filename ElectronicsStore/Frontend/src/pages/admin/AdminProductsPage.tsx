import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminProductsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ProductsPage AdminProducts
      </Typography>
      <Box>
        <Typography>AdminProductsPage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default AdminProductsPage;
