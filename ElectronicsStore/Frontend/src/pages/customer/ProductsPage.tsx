import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProductsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
      </Typography>
      <Box>
        <Typography>Products catalog will be implemented here.</Typography>
      </Box>
    </Container>
  );
};

export default ProductsPage;