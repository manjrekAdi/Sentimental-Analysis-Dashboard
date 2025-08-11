import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const EnhancedCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  onClick, 
  sx = {},
  variant = 'default',
  trend,
  trendValue,
  trendDirection = 'up'
}) => {
  const getColorValue = (colorName) => {
    const colorMap = {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };
    return colorMap[colorName] || colorMap.primary;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const renderTrendIcon = () => {
    if (!trend) return null;
    
    const iconColor = trendDirection === 'up' ? '#10b981' : '#ef4444';
    const iconSymbol = trendDirection === 'up' ? '↗' : '↘';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5,
        color: iconColor,
        fontSize: '0.75rem',
        fontWeight: 600
      }}>
        <span>{iconSymbol}</span>
        <span>{trendValue}%</span>
      </Box>
    );
  };

  if (variant === 'glassmorphism') {
    return (
      <MotionCard
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onClick={onClick}
        sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          cursor: onClick ? 'pointer' : 'default',
          height: '100%',
          minHeight: { xs: 140, sm: 160, md: 180 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          ...sx
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 3, 
              bgcolor: `${getColorValue(color)}15`,
              color: getColorValue(color),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
            {trend && renderTrendIcon()}
          </Box>
          
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              color: 'text.primary'
            }}
          >
            {value}
          </Typography>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </Typography>
        </CardContent>
      </MotionCard>
    );
  }

  // Default variant with enhanced styling
  return (
    <MotionCard
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={onClick}
      sx={{
        background: `linear-gradient(135deg, ${getColorValue(color)}08 0%, ${getColorValue(color)}15 100%)`,
        border: `1px solid ${getColorValue(color)}20`,
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        minHeight: { xs: 140, sm: 160, md: 180 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${getColorValue(color)} 0%, ${getColorValue(color)}80 100%)`,
        },
        ...sx
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 3, 
            bgcolor: `${getColorValue(color)}15`,
            color: getColorValue(color),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              bgcolor: `${getColorValue(color)}25`,
            }
          }}>
            {icon}
          </Box>
          {trend && renderTrendIcon()}
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            color: 'text.primary',
            background: `linear-gradient(135deg, ${getColorValue(color)} 0%, ${getColorValue(color)}80 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {value}
        </Typography>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 600, 
            mb: 1,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            lineHeight: 1.4
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

export default EnhancedCard; 