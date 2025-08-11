import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const LoadingSkeleton = ({ type = 'cards', count = 6, height = 200 }) => {
  const shimmerAnimation = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay: i * 0.1,
        ease: "easeOut"
      }
    }),
  };

  const renderCardSkeleton = (index) => (
    <MotionBox
      key={index}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      component={Card}
      sx={{
        height: { xs: 140, sm: 160, md: height },
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton
            variant="circular"
            width={48}
            height={48}
            sx={{
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              ...shimmerAnimation
            }}
          />
          <Skeleton
            variant="rectangular"
            width={60}
            height={20}
            sx={{
              borderRadius: 2,
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              ...shimmerAnimation
            }}
          />
        </Box>
        
        <Skeleton
          variant="text"
          width="80%"
          height={32}
          sx={{
            mb: 1,
            bgcolor: 'rgba(99, 102, 241, 0.1)',
            ...shimmerAnimation
          }}
        />
        
        <Skeleton
          variant="text"
          width="60%"
          height={24}
          sx={{
            mb: 1,
            bgcolor: 'rgba(99, 102, 241, 0.1)',
            ...shimmerAnimation
          }}
        />
        
        <Skeleton
          variant="text"
          width="90%"
          height={16}
          sx={{
            bgcolor: 'rgba(99, 102, 241, 0.1)',
            ...shimmerAnimation
          }}
        />
      </CardContent>
    </MotionBox>
  );

  const renderTableSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <MotionBox
          key={index}
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 1,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Skeleton variant="rectangular" width="60%" height={20} />
          <Skeleton variant="rectangular" width="15%" height={20} />
          <Skeleton variant="rectangular" width="15%" height={20} />
          <Skeleton variant="rectangular" width="10%" height={20} />
        </MotionBox>
      ))}
    </Box>
  );

  const renderChartSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <MotionBox
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            component={Card}
            sx={{
              height: 300,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              }
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Skeleton
                variant="text"
                width="70%"
                height={24}
                sx={{ mb: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', ...shimmerAnimation }}
              />
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 'calc(100% - 60px)',
                bgcolor: 'rgba(99, 102, 241, 0.05)',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'rgba(99, 102, 241, 0.2)'
              }}>
                <Skeleton
                  variant="circular"
                  width={80}
                  height={80}
                  sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', ...shimmerAnimation }}
                />
              </Box>
            </CardContent>
          </MotionBox>
        </Grid>
      ))}
    </Grid>
  );

  const renderListSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <MotionBox
          key={index}
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 1,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        </MotionBox>
      ))}
    </Box>
  );

  // Add CSS keyframes for shimmer animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  switch (type) {
    case 'cards':
      return (
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {Array.from({ length: count }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              {renderCardSkeleton(index)}
            </Grid>
          ))}
        </Grid>
      );
    
    case 'table':
      return renderTableSkeleton();
    
    case 'charts':
      return renderChartSkeleton();
    
    case 'list':
      return renderListSkeleton();
    
    case 'grid':
      return (
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {Array.from({ length: count }).map((_, index) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
              <MotionBox
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                sx={{
                  height: 120,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shimmerAnimation
                }}
              />
            </Grid>
          ))}
        </Grid>
      );
    
    default:
      return (
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {Array.from({ length: count }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              {renderCardSkeleton(index)}
            </Grid>
          ))}
        </Grid>
      );
  }
};

export default LoadingSkeleton; 