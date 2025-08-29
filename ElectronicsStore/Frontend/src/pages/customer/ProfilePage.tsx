import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      <Box>
        <Typography>ProfilePage implementation coming soon...</Typography>
      </Box>
    </Container>
  );
};

export default ProfilePage;
