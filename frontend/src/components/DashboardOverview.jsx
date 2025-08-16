import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import EnhancedCard from './EnhancedCard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { getMuiColorForSentiment } from '../utils/colorScheme';

const DashboardOverview = ({ results, onCardClick }) => {
  if (!results) return null;

  const { posts_count, sentiment_summary, topic, search_type } = results;
  
  // Calculate sentiment percentages
  const vaderData = sentiment_summary?.vader || {};
  const totalVader = Object.values(vaderData).reduce((sum, count) => sum + count, 0);
  
  const positiveCount = vaderData.positive || 0;
  const negativeCount = vaderData.negative || 0;
  const neutralCount = vaderData.neutral || 0;
  
  const positivePercent = totalVader > 0 ? Math.round((positiveCount / totalVader) * 100) : 0;
  const negativePercent = totalVader > 0 ? Math.round((negativeCount / totalVader) * 100) : 0;
  const neutralPercent = totalVader > 0 ? Math.round((neutralCount / totalVader) * 100) : 0;

  const kpiCards = [
    {
      title: 'Total Posts Analyzed',
      value: posts_count,
      subtitle: `Topic: ${topic}`,
      icon: <AnalyticsIcon fontSize="large" />,
      color: 'primary',
      onClick: () => onCardClick && onCardClick('posts'),
    },
    {
      title: 'Positive Sentiment',
      value: `${positivePercent}%`,
      subtitle: `${positiveCount} out of ${totalVader} posts`,
      icon: <SentimentSatisfiedAltIcon fontSize="large" />,
      color: getMuiColorForSentiment('positive'),
      onClick: () => onCardClick && onCardClick('positive'),
    },
    {
      title: 'Negative Sentiment',
      value: `${negativePercent}%`,
      subtitle: `${negativeCount} out of ${totalVader} posts`,
      icon: <SentimentDissatisfiedIcon fontSize="large" />,
      color: getMuiColorForSentiment('negative'),
      onClick: () => onCardClick && onCardClick('negative'),
    },
    {
      title: 'Neutral Sentiment',
      value: `${neutralPercent}%`,
      subtitle: `${neutralCount} out of ${totalVader} posts`,
      icon: <SentimentNeutralIcon fontSize="large" />,
      color: getMuiColorForSentiment('neutral'),
      onClick: () => onCardClick && onCardClick('neutral'),
    },
    {
      title: 'Analysis Method',
      value: 'Multi-Model',
      subtitle: 'VADER, TextBlob & BERT',
      icon: <PsychologyIcon fontSize="large" />,
      color: 'info',
      onClick: () => onCardClick && onCardClick('methods'),
    },
    {
      title: 'Search Type',
      value: search_type === 'search' ? 'All Reddit' : 'Subreddit',
      subtitle: search_type === 'subreddit' ? `r/${topic}` : 'Cross-platform',
      icon: <TrendingUpIcon fontSize="large" />,
      color: 'secondary',
      onClick: () => onCardClick && onCardClick('search'),
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          mb: 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Analysis Overview
      </Typography>
      
      <Grid container spacing={3}>
        {kpiCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <EnhancedCard
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              icon={card.icon}
              color={card.color}
              onClick={card.onClick}
              sx={{ height: '100%' }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardOverview; 