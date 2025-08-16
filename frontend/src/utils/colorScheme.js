// Color scheme utilities for sentiment analysis visualization
// Following user preferences: green=positive, red=negative, blue=neutral

// Base colors for different sentiment types
const SENTIMENT_COLORS = {
  positive: '#4CAF50',    // Green
  negative: '#F44336',    // Red
  neutral: '#2196F3',     // Blue
  joy: '#FF9800',         // Orange
  sadness: '#9C27B0',     // Purple
  anger: '#D32F2F',       // Dark Red
  fear: '#607D8B',        // Blue Grey
  surprise: '#FFC107',    // Amber
  love: '#E91E63',        // Pink
  disgust: '#795548'      // Brown
};

// Get base color for sentiment
export const getColorForSentiment = (sentiment) => {
  const lowerSentiment = sentiment?.toLowerCase();
  return SENTIMENT_COLORS[lowerSentiment] || SENTIMENT_COLORS.neutral;
};

// Get RGBA color with transparency for charts
export const getRGBAForSentiment = (sentiment) => {
  const baseColor = getColorForSentiment(sentiment);
  return baseColor + '80'; // Add 50% transparency
};

// Get border color for charts
export const getBorderColorForSentiment = (sentiment) => {
  const baseColor = getColorForSentiment(sentiment);
  return baseColor;
};

// Get MUI color prop for components
export const getMuiColorForSentiment = (sentiment) => {
  const lowerSentiment = sentiment?.toLowerCase();
  
  switch (lowerSentiment) {
    case 'positive':
      return 'success';
    case 'negative':
      return 'error';
    case 'neutral':
      return 'info';
    case 'joy':
      return 'warning';
    case 'sadness':
      return 'secondary';
    case 'anger':
      return 'error';
    case 'fear':
      return 'info';
    case 'surprise':
      return 'warning';
    case 'love':
      return 'secondary';
    case 'disgust':
      return 'default';
    default:
      return 'default';
  }
};

// Get emotion color
export const getEmotionColor = (emotion) => {
  return getColorForSentiment(emotion);
};

// Get sentiment intensity color (for scores)
export const getIntensityColor = (score, sentimentType = 'compound') => {
  if (sentimentType === 'compound') {
    // VADER compound score: -1 to 1
    if (score >= 0.05) return SENTIMENT_COLORS.positive;
    if (score <= -0.05) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  } else if (sentimentType === 'polarity') {
    // TextBlob polarity: -1 to 1
    if (score > 0.05) return SENTIMENT_COLORS.positive;
    if (score < -0.05) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  }
  return SENTIMENT_COLORS.neutral;
};

// Get chart color palette
export const getChartColors = (count = 3) => {
  const colors = [
    SENTIMENT_COLORS.positive,
    SENTIMENT_COLORS.negative,
    SENTIMENT_COLORS.neutral,
    SENTIMENT_COLORS.joy,
    SENTIMENT_COLORS.sadness,
    SENTIMENT_COLORS.anger,
    SENTIMENT_COLORS.fear,
    SENTIMENT_COLORS.surprise,
    SENTIMENT_COLORS.love,
    SENTIMENT_COLORS.disgust
  ];
  
  return colors.slice(0, count);
};

// Get gradient colors for advanced visualizations
export const getGradientColors = (sentiment) => {
  const baseColor = getColorForSentiment(sentiment);
  return {
    start: baseColor + '20',  // Very light
    middle: baseColor + '60', // Medium
    end: baseColor            // Full color
  };
};
