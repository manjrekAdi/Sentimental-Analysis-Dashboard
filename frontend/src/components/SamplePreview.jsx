import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const PreviewCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  border: '2px dashed',
  borderColor: theme.palette.primary.main,
  opacity: 0.8,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    opacity: 1,
    transform: 'scale(1.02)',
  },
}));

const SamplePreview = () => {
  const sampleData = {
    topic: 'Artificial Intelligence',
    totalPosts: 25,
    sentimentBreakdown: {
      positive: 12,
      negative: 8,
      neutral: 5,
    },
    samplePosts: [
      {
        title: 'AI breakthrough in medical diagnosis shows promising results',
        sentiment: 'positive',
        subreddit: 'r/technology',
        score: 245,
      },
      {
        title: 'Concerns about AI replacing human jobs continue to grow',
        sentiment: 'negative',
        subreddit: 'r/futurology',
        score: 189,
      },
      {
        title: 'New AI model demonstrates improved accuracy in predictions',
        sentiment: 'positive',
        subreddit: 'r/science',
        score: 156,
      },
    ],
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <SentimentSatisfiedAltIcon color="success" />;
      case 'negative': return <SentimentDissatisfiedIcon color="error" />;
      default: return <SentimentNeutralIcon color="warning" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Sample Analysis Preview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Sentiment Overview */}
        <Grid item xs={12} md={4}>
          <PreviewCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Sentiment Overview
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <SentimentSatisfiedAltIcon color="success" sx={{ fontSize: 32 }} />
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                    {sampleData.sentimentBreakdown.positive}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Positive
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <SentimentDissatisfiedIcon color="error" sx={{ fontSize: 32 }} />
                  <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                    {sampleData.sentimentBreakdown.negative}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Negative
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <SentimentNeutralIcon color="warning" sx={{ fontSize: 32 }} />
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                    {sampleData.sentimentBreakdown.neutral}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Neutral
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Based on {sampleData.totalPosts} posts about {sampleData.topic}
              </Typography>
            </CardContent>
          </PreviewCard>
        </Grid>

        {/* Sample Posts */}
        <Grid item xs={12} md={8}>
          <PreviewCard>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Sample Posts Analysis
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sampleData.samplePosts.map((post, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <Avatar sx={{ bgcolor: `${getSentimentColor(post.sentiment)}.main` }}>
                      {getSentimentIcon(post.sentiment)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {post.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {post.subreddit}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {post.score} points
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={post.sentiment}
                      color={getSentimentColor(post.sentiment)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </PreviewCard>
        </Grid>
      </Grid>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Ready to analyze your own topic?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter a topic above and click "Scrape & Analyze" to get started!
        </Typography>
      </Box>
    </Box>
  );
};

export default SamplePreview; 