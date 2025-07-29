import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components for enhanced visual effects
const StyledCard = styled(Card)(({ theme, variant = 'default' }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 20,
  background: variant === 'gradient' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : theme.palette.background.paper,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    '& .card-overlay': {
      opacity: 1,
    },
    
    '& .card-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: variant === 'gradient' 
      ? 'linear-gradient(90deg, #667eea, #764ba2)'
      : theme.palette.primary.main,
    transform: 'scaleX(0)',
    transition: 'transform 0.3s ease',
  },
  
  '&:hover::before': {
    transform: 'scaleX(1)',
  },
}));

const CardOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: 12,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease',
  
  '& .card-icon': {
    transition: 'transform 0.3s ease',
  },
}));

const MetricValue = styled(Typography)(({ theme, color = 'primary' }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
}));

const EnhancedCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  variant = 'default',
  onClick,
  children,
  elevation = 1,
  ...props 
}) => {
  return (
    <StyledCard 
      variant={variant} 
      elevation={elevation}
      onClick={onClick}
      {...props}
    >
      <CardOverlay className="card-overlay">
        <Typography variant="body2" color="primary" fontWeight={600}>
          Click to view details
        </Typography>
      </CardOverlay>
      
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        {icon && (
          <IconWrapper>
            <Box className="card-icon" color={`${color}.main`}>
              {icon}
            </Box>
          </IconWrapper>
        )}
        
        {value && (
          <MetricValue color={color}>
            {value}
          </MetricValue>
        )}
        
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            color: variant === 'gradient' ? 'white' : 'text.primary'
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="body2" 
            color={variant === 'gradient' ? 'rgba(255,255,255,0.8)' : 'text.secondary'}
            sx={{ mb: 2 }}
          >
            {subtitle}
          </Typography>
        )}
        
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default EnhancedCard; 