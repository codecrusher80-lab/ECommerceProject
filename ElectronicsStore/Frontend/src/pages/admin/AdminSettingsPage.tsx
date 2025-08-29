import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminSettingsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        SettingsPage AdminSettings
      </Typography>
      <Box>
        <Typography>AdminSettingsPage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default AdminSettingsPage;
