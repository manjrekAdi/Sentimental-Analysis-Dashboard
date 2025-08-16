import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  MenuItem, 
  CircularProgress, 
  Tabs, 
  Tab, 
  AppBar, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
  Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import TableChartIcon from '@mui/icons-material/TableChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import CompareIcon from '@mui/icons-material/Compare';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import CloudIcon from '@mui/icons-material/Cloud';
import WordCloud from './components/WordCloud';
import DashboardOverview from './components/DashboardOverview';
import LoadingSkeleton from './components/LoadingSkeleton';
import SamplePreview from './components/SamplePreview';
import { generateWordCloudData, generateEmotionWordCloudData } from './utils/wordCloudUtils';
import { getColorForSentiment, getRGBAForSentiment, getBorderColorForSentiment, getMuiColorForSentiment } from './utils/colorScheme';
import 'chart.js/auto';

const sentimentMethods = [
  { value: 'all', label: 'All (VADER, TextBlob, BERT)' },
  { value: 'vader', label: 'VADER' },
  { value: 'textblob', label: 'TextBlob' },
  { value: 'bert', label: 'BERT' },
];

const searchTypes = [
  { value: 'search', label: 'Search All Reddit' },
  { value: 'subreddit', label: 'Specific Subreddit' },
];

const apiBase = process.env.NODE_ENV === 'production' 
  ? 'https://sentimental-analysis-dashboard.onrender.com/api'
  : 'http://localhost:5001/api';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [topic, setTopic] = useState('technology');
  const [limit, setLimit] = useState(10);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [method, setMethod] = useState('all');
  const [searchType, setSearchType] = useState('search');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Auto-adjust display limit when analysis limit changes
  useEffect(() => {
    if (displayLimit > limit) {
      setDisplayLimit(limit);
    }
  }, [limit, displayLimit]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    
    // Validate that display limit doesn't exceed analysis limit
    if (displayLimit > limit) {
      setError('Display limit cannot exceed analysis limit');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.post(`${apiBase}/analyze`, {
        topic,
        limit,
        search_type: searchType,
        display_limit: displayLimit,
      });
      setResults(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Prepare table columns with responsive design
  const columns = [
    { 
      field: 'title', 
      headerName: 'Post Title', 
      flex: 2,
      minWidth: isMobile ? 150 : 200,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            lineHeight: 1.3
          }}
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'subreddit', 
      headerName: 'Subreddit', 
      flex: 1,
      minWidth: isMobile ? 80 : 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
          sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
        />
      )
    },
    { 
      field: 'vader_label', 
      headerName: 'VADER', 
      flex: 1,
      minWidth: isMobile ? 60 : 80,
      renderCell: renderSentimentIcon 
    },
    { 
      field: 'textblob_label', 
      headerName: 'TextBlob', 
      flex: 1,
      minWidth: isMobile ? 60 : 80,
      renderCell: renderSentimentIcon 
    },
    { 
      field: 'bert_label', 
      headerName: 'BERT', 
      flex: 1,
      minWidth: isMobile ? 60 : 80,
      renderCell: renderSentimentIcon 
    },
    { 
      field: 'bert_emotion', 
      headerName: 'Emotion', 
      flex: 1,
      minWidth: isMobile ? 60 : 80,
      renderCell: renderEmotionIcon 
    },
  ];

  function renderSentimentIcon(params) {
    if (params.value === 'positive') return <SentimentSatisfiedAltIcon color="success" fontSize={isMobile ? "small" : "medium"} />;
    if (params.value === 'negative') return <SentimentDissatisfiedIcon color="error" fontSize={isMobile ? "small" : "medium"} />;
    return <SentimentNeutralIcon color="warning" fontSize={isMobile ? "small" : "medium"} />;
  }

  function renderEmotionIcon(params) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <EmojiEmotionsIcon sx={{ mr: 0.5, fontSize: isMobile ? "1rem" : "1.25rem" }} />
        <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
          {params.value}
        </Typography>
      </Box>
    );
  }

  // Enhanced chart data preparation with consistent color scheme
  const getPieData = (summary, label) => {
    if (!summary) return {};
    const data = summary[label] || {};
    
    return {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: Object.keys(data).map(label => getColorForSentiment(label)),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'right',
        labels: {
          padding: isMobile ? 15 : 20,
          usePointStyle: true,
          font: {
            size: isMobile ? 10 : 12
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        }
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: isMobile ? 10 : 12
          }
        },
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    },
  };

  const getBarData = (summary, label) => {
    if (!summary) return {};
    const data = summary[label] || {};
    
    return {
      labels: Object.keys(data),
      datasets: [
        {
          label: label.charAt(0).toUpperCase() + label.slice(1),
          data: Object.values(data),
          backgroundColor: Object.keys(data).map(label => getRGBAForSentiment(label)),
          borderColor: Object.keys(data).map(label => getBorderColorForSentiment(label)),
          borderWidth: 1,
        },
      ],
    };
  };

  const getDoughnutData = (summary, label) => {
    if (!summary) return {};
    const data = summary[label] || {};
    
    return {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: Object.keys(data).map(label => getColorForSentiment(label)),
          borderWidth: 3,
          borderColor: '#fff',
          cutout: '60%',
        },
      ],
    };
  };

  const getSubredditDistribution = () => {
    if (!results?.all_posts) return {};
    
    const subredditCounts = {};
    results.all_posts.forEach(post => {
      subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
    });

    return {
      labels: Object.keys(subredditCounts),
      datasets: [
        {
          label: 'Posts per Subreddit',
          data: Object.values(subredditCounts),
          backgroundColor: getRGBAForSentiment('neutral'), // blue for neutral/other data
          borderColor: getBorderColorForSentiment('neutral'), // blue border
          borderWidth: 1,
        },
      ],
    };
  };

  const getSentimentComparison = () => {
    if (!results?.sentiment_summary) return {};
    
    const methods = ['vader', 'textblob', 'bert_sentiment'];
    const labels = ['Positive', 'Negative', 'Neutral'];
    
    return {
      labels,
      datasets: methods.map((method, index) => ({
        label: method === 'bert_sentiment' ? 'BERT' : method.charAt(0).toUpperCase() + method.slice(1),
        data: labels.map(label => {
          const lowerLabel = label.toLowerCase();
          return results.sentiment_summary[method][lowerLabel] || 0;
        }),
        backgroundColor: labels.map(label => getRGBAForSentiment(label)),
        borderColor: labels.map(label => getBorderColorForSentiment(label)),
        borderWidth: 2,
      })),
    };
  };

  // Mobile navigation tabs
  const mobileTabs = [
    { label: 'Table', icon: <TableChartIcon />, value: 0 },
    { label: 'Charts', icon: <PieChartIcon />, value: 1 },
    { label: 'Bars', icon: <BarChartIcon />, value: 2 },
    { label: 'Compare', icon: <CompareIcon />, value: 3 },
    { label: 'Analytics', icon: <AnalyticsOutlinedIcon />, value: 4 },
    { label: 'Words', icon: <CloudIcon />, value: 5 },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', width: '100vw' }}>
      {/* Enhanced AppBar with mobile support */}
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Box sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <PsychologyIcon sx={{ mr: 2, fontSize: { xs: 24, md: 32 } }} />
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}
            >
              Social Media Sentiment Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ fontWeight: 700, display: { xs: 'block', sm: 'none' } }}
            >
              Sentiment Dashboard
            </Typography>
          </Box>
          
          {isMobile ? (
            <IconButton 
              color="inherit" 
              onClick={toggleMobileDrawer}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Powered by AI & NLP
            </Typography>
          )}
        </Box>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={toggleMobileDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Navigation
          </Typography>
          <IconButton onClick={toggleMobileDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ pt: 1 }}>
          {mobileTabs.map((tab) => (
            <ListItem 
              key={tab.value}
              button 
              onClick={() => handleTabChange(null, tab.value)}
              selected={tab.value === tab}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {tab.icon}
              </ListItemIcon>
              <ListItemText primary={tab.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Enhanced Search Form */}
        <Paper elevation={3} sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: 4, 
          width: '95%', 
          maxWidth: 1200, 
          borderRadius: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ mr: 2, color: 'primary.main', fontSize: { xs: 24, md: 28 } }} />
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
              Analyze Social Media Sentiment
            </Typography>
          </Box>
          
          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label="3 NLP Models" 
              color="primary" 
              variant="outlined" 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
            <Chip 
              label="Real-time Analysis" 
              color="success" 
              variant="outlined" 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
            <Chip 
              label="Interactive Charts" 
              color="info" 
              variant="outlined" 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
            <Chip 
              label="Word Clouds" 
              color="secondary" 
              variant="outlined" 
              size="small"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            />
          </Box>

          {/* Responsive Form Layout */}
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                size="small"
                fullWidth
                placeholder={searchType === 'search' ? "e.g., climate change, AI, vaccines" : "e.g., technology, politics, science"}
                helperText={searchType === 'search' ? "Search term across all Reddit" : "Specific subreddit name"}
                sx={{ 
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
              <TextField
                label="Posts to Analyze"
                type="number"
                value={limit}
                onChange={e => setLimit(Number(e.target.value))}
                size="small"
                fullWidth
                inputProps={{ min: 1, max: 100 }}
                helperText="Total posts to fetch & analyze"
                sx={{ 
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={2}>
              <TextField
                label="Posts to Display"
                type="number"
                value={displayLimit}
                onChange={e => setDisplayLimit(Number(e.target.value))}
                size="small"
                fullWidth
                inputProps={{ min: 1, max: limit }}
                helperText={`Posts shown in table (max: ${limit})`}
                error={displayLimit > limit}
                sx={{ 
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Search Type"
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                size="small"
                fullWidth
                sx={{ 
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }
                }}
              >
                {searchTypes.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={loading}
                fullWidth
                sx={{ 
                  height: 56,
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Analyze'}
              </Button>
            </Grid>
          </Grid>
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Paper>

        {/* Show home content when no results */}
        {!loading && !results && (
          <Box sx={{ width: '95%', maxWidth: 1400 }}>
            <SamplePreview />
          </Box>
        )}

        {loading ? (
          <Box sx={{ width: '95%', maxWidth: 1400, mb: 4 }}>
            <LoadingSkeleton type="cards" count={isMobile ? 4 : 6} />
          </Box>
        ) : results && (
          <>
            {/* Dashboard Overview */}
            <Box sx={{ width: '95%', maxWidth: 1400, mb: 4 }}>
              <DashboardOverview 
                results={results} 
                onCardClick={(type) => {
                  console.log(`Card clicked: ${type}`);
                  // You can add navigation logic here
                }}
              />
            </Box>
            
            {/* Enhanced Results Tabs */}
            <Paper elevation={2} sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: 4, 
              width: '95%', 
              maxWidth: 1400, 
              borderRadius: 3 
            }}>
              {/* Desktop Tabs */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Tabs value={tab} onChange={handleTabChange} centered>
                  <Tab label="Table View" />
                  <Tab label="Pie Charts" />
                  <Tab label="Bar Charts" />
                  <Tab label="Comparison" />
                  <Tab label="Analytics" />
                  <Tab label="Word Cloud" />
                </Tabs>
              </Box>

              {/* Mobile Tab Indicator */}
              <Box sx={{ 
                display: { xs: 'block', md: 'none' }, 
                mb: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  {mobileTabs[tab]?.label} View
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                {tab === 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Showing {results.sample_posts.length} of {results.posts_count} analyzed posts
                    </Typography>
                    <DataGrid
                      autoHeight
                      rows={results.sample_posts.map((row, i) => ({ id: i, ...row }))}
                      columns={columns}
                      pageSize={Math.min(displayLimit, isMobile ? 5 : 10)}
                      rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 20, 50]}
                      disableSelectionOnClick
                      sx={{ 
                        bgcolor: 'white', 
                        borderRadius: 2,
                        '& .MuiDataGrid-root': {
                          border: 'none',
                        },
                        '& .MuiDataGrid-cell': {
                          borderBottom: '1px solid #f0f0f0',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                        },
                        '& .MuiDataGrid-row:hover': {
                          backgroundColor: '#f1f5f9',
                        }
                      }}
                    />
                  </Box>
                )}
                
                {tab === 1 && (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            VADER Sentiment Distribution
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Pie data={getPieData(results.sentiment_summary, 'vader')} options={chartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            TextBlob Sentiment Distribution
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Pie data={getPieData(results.sentiment_summary, 'textblob')} options={chartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            BERT Sentiment Distribution
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Pie data={getPieData(results.sentiment_summary, 'bert_sentiment')} options={chartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            BERT Emotion Classification
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Pie data={getPieData(results.sentiment_summary, 'bert_emotion')} options={chartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {tab === 2 && (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            VADER Sentiment Analysis
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Bar data={getBarData(results.sentiment_summary, 'vader')} options={barChartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            TextBlob Sentiment Analysis
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Bar data={getBarData(results.sentiment_summary, 'textblob')} options={barChartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            BERT Sentiment Analysis
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Bar data={getBarData(results.sentiment_summary, 'bert_sentiment')} options={barChartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            BERT Emotion Analysis
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Bar data={getBarData(results.sentiment_summary, 'bert_emotion')} options={barChartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {tab === 3 && (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            Sentiment Method Comparison
                          </Typography>
                          <Box sx={{ height: { xs: 300, sm: 400 } }}>
                            <Bar data={getSentimentComparison()} options={barChartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            Subreddit Distribution
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Doughnut data={getSubredditDistribution()} options={chartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" align="center" gutterBottom>
                            VADER Sentiment (Doughnut)
                          </Typography>
                          <Box sx={{ height: { xs: 250, sm: 300 } }}>
                            <Doughnut data={getDoughnutData(results.sentiment_summary, 'vader')} options={chartOptions} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {tab === 4 && (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AnalyticsIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Summary Statistics</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Posts Analyzed: {results.posts_count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Posts Displayed: {results.sample_posts.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Topic: {results.topic}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Search Type: {results.search_type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Unique Subreddits: {Object.keys(getSubredditDistribution().labels || {}).length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingUpIcon sx={{ mr: 1 }} />
                            <Typography variant="h6">Sentiment Overview</Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {Object.entries(results.sentiment_summary.vader || {}).map(([sentiment, count]) => (
                              <Grid item xs={6} sm={4} key={sentiment}>
                                <Chip
                                  label={`${sentiment}: ${count}`}
                                  color={getMuiColorForSentiment(sentiment)}
                                  variant="outlined"
                                  sx={{ 
                                    width: '100%',
                                    // Custom colors to match chart scheme
                                    ...(sentiment === 'positive' && {
                                      borderColor: getColorForSentiment(sentiment),
                                      color: getColorForSentiment(sentiment)
                                    }),
                                    ...(sentiment === 'negative' && {
                                      borderColor: getColorForSentiment(sentiment),
                                      color: getColorForSentiment(sentiment)
                                    }),
                                    ...(sentiment === 'neutral' && {
                                      borderColor: getColorForSentiment(sentiment),
                                      color: getColorForSentiment(sentiment)
                                    })
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {tab === 5 && (
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6} md={6}>
                      <WordCloud 
                        data={generateWordCloudData(results.all_posts, 'vader_label').positive} 
                        title="Positive Posts Word Cloud"
                        height={isMobile ? 300 : 400}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <WordCloud 
                        data={generateWordCloudData(results.all_posts, 'vader_label').negative} 
                        title="Negative Posts Word Cloud"
                        height={isMobile ? 300 : 400}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <WordCloud 
                        data={generateWordCloudData(results.all_posts, 'vader_label').neutral} 
                        title="Neutral Posts Word Cloud"
                        height={isMobile ? 300 : 400}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <WordCloud 
                        data={generateWordCloudData(results.all_posts, 'vader_label').all} 
                        title="All Posts Word Cloud"
                        height={isMobile ? 300 : 400}
                      />
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Paper>
          </>
        )}

        <Box sx={{ textAlign: 'center', color: 'grey.600', mt: 6, mb: 2, width: '100%' }}>
          <Typography variant="body2">© 2025 Aditya Manjrekar</Typography>
        </Box>
      </Box>

      {/* Mobile Floating Action Button for Navigation */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="navigation"
          onClick={toggleMobileDrawer}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          <MenuIcon />
        </Fab>
      )}
    </Box>
  );
}

export default App;
