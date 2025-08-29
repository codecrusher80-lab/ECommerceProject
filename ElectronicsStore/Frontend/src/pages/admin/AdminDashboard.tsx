import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard AdminDashboard
      </Typography>
      <Box>
        <Typography>AdminDashboard implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
