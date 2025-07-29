import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

const LoadingSkeleton = ({ type = 'cards', count = 6 }) => {
  if (type === 'cards') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={16} />
                  </Box>
                </Box>
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="100%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (type === 'table') {
    return (
      <Box>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
            <Skeleton variant="text" width="10%" height={20} />
            <Skeleton variant="text" width="10%" height={20} />
            <Skeleton variant="text" width="10%" height={20} />
            <Skeleton variant="text" width="15%" height={20} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'chart') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Skeleton variant="circular" width={200} height={200} />
      </Box>
    );
  }

  return (
    <Box>
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
    </Box>
  );
};

export default LoadingSkeleton; 