import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProductDetailPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ProductDetail
      </Typography>
      <Box>
        <Typography>ProductDetailPage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
