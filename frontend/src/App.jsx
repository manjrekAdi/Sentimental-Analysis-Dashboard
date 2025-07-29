import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, MenuItem, CircularProgress, Tabs, Tab, AppBar, Grid, Card, CardContent, Chip } from '@mui/material';
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
import WordCloud from './components/WordCloud';
import DashboardOverview from './components/DashboardOverview';
import LoadingSkeleton from './components/LoadingSkeleton';
import SamplePreview from './components/SamplePreview';
import { generateWordCloudData, generateEmotionWordCloudData } from './utils/wordCloudUtils';
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

const apiBase = 'http://localhost:5001/api';

function App() {
  const [topic, setTopic] = useState('technology');
  const [limit, setLimit] = useState(10);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [method, setMethod] = useState('all');
  const [searchType, setSearchType] = useState('search');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

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
  };

  // Prepare table columns
  const columns = [
    { field: 'title', headerName: 'Post Title', flex: 2 },
    { field: 'subreddit', headerName: 'Subreddit', flex: 1 },
    { field: 'vader_label', headerName: 'VADER', flex: 1, renderCell: renderSentimentIcon },
    { field: 'textblob_label', headerName: 'TextBlob', flex: 1, renderCell: renderSentimentIcon },
    { field: 'bert_label', headerName: 'BERT', flex: 1, renderCell: renderSentimentIcon },
    { field: 'bert_emotion', headerName: 'Emotion', flex: 1, renderCell: renderEmotionIcon },
  ];

  function renderSentimentIcon(params) {
    if (params.value === 'positive') return <SentimentSatisfiedAltIcon color="success" />;
    if (params.value === 'negative') return <SentimentDissatisfiedIcon color="error" />;
    return <SentimentNeutralIcon color="warning" />;
  }

  function renderEmotionIcon(params) {
    return <Box sx={{ display: 'flex', alignItems: 'center' }}><EmojiEmotionsIcon sx={{ mr: 0.5 }} />{params.value}</Box>;
  }

  // Enhanced chart data preparation
  const getPieData = (summary, label) => {
    if (!summary) return {};
    const data = summary[label] || {};
    return {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data),
          backgroundColor: [
            '#4caf50', // green
            '#f44336', // red
            '#ff9800', // orange
            '#2196f3', // blue
            '#9c27b0', // purple
            '#ffeb3b', // yellow
          ],
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
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
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
        },
      },
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
          backgroundColor: [
            'rgba(76, 175, 80, 0.8)',
            'rgba(244, 67, 54, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(33, 150, 243, 0.8)',
            'rgba(156, 39, 176, 0.8)',
            'rgba(255, 235, 59, 0.8)',
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(244, 67, 54, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(255, 235, 59, 1)',
          ],
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
          backgroundColor: [
            '#4caf50',
            '#f44336',
            '#ff9800',
            '#2196f3',
            '#9c27b0',
            '#ffeb3b',
          ],
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
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
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
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)',
          'rgba(244, 67, 54, 0.6)',
          'rgba(255, 152, 0, 0.6)',
        ][index],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(255, 152, 0, 1)',
        ][index],
        borderWidth: 2,
      })),
    };
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', width: '100vw' }}>
      <AppBar position="static" color="primary" sx={{ mb: 4 }}>
        <Box sx={{ py: 3, px: 4, display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <PsychologyIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Social Media Sentiment Dashboard
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Powered by AI & NLP
          </Typography>
        </Box>
      </AppBar>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4, width: '95%', maxWidth: 1200, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SearchIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Analyze Social Media Sentiment
            </Typography>
          </Box>
          
          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label="3 NLP Models" 
              color="primary" 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label="Real-time Analysis" 
              color="success" 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label="Interactive Charts" 
              color="info" 
              variant="outlined" 
              size="small"
            />
            <Chip 
              label="Word Clouds" 
              color="secondary" 
              variant="outlined" 
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="Topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
              placeholder={searchType === 'search' ? "e.g., climate change, AI, vaccines" : "e.g., technology, politics, science"}
              helperText={searchType === 'search' ? "Search term across all Reddit" : "Specific subreddit name"}
            />
            <TextField
              label="Posts to Analyze"
              type="number"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 140 }}
              inputProps={{ min: 1, max: 100 }}
              helperText="Total posts to fetch & analyze"
            />
            <TextField
              label="Posts to Display"
              type="number"
              value={displayLimit}
              onChange={e => setDisplayLimit(Number(e.target.value))}
              size="small"
              sx={{ minWidth: 140 }}
              inputProps={{ min: 1, max: limit }}
              helperText={`Posts shown in table (max: ${limit})`}
              error={displayLimit > limit}
            />
            <TextField
              select
              label="Sentiment Method"
              value={method}
              onChange={e => setMethod(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {sentimentMethods.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Search Type"
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              {searchTypes.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              disabled={loading}
              sx={{ minWidth: 180 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Scrape & Analyze'}
            </Button>
          </Box>
          {error && <Typography color="error">{error}</Typography>}
        </Paper>

        {/* Show home content when no results */}
        {!loading && !results && (
          <Box sx={{ width: '95%', maxWidth: 1400 }}>
            <SamplePreview />
          </Box>
        )}

        {loading ? (
          <Box sx={{ width: '95%', maxWidth: 1400, mb: 4 }}>
            <LoadingSkeleton type="cards" count={6} />
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
            
            {/* Results Tabs */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, width: '95%', maxWidth: 1400, borderRadius: 3 }}>
              <Tabs value={tab} onChange={handleTabChange} centered>
                <Tab label="Table View" />
                <Tab label="Pie Charts" />
                <Tab label="Bar Charts" />
                <Tab label="Comparison" />
                <Tab label="Analytics" />
                <Tab label="Word Cloud" />
              </Tabs>
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
                    pageSize={Math.min(displayLimit, 10)}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    disableSelectionOnClick
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                  />
                </Box>
              )}
              
              {tab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          VADER Sentiment Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Pie data={getPieData(results.sentiment_summary, 'vader')} options={chartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          TextBlob Sentiment Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Pie data={getPieData(results.sentiment_summary, 'textblob')} options={chartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          BERT Sentiment Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Pie data={getPieData(results.sentiment_summary, 'bert_sentiment')} options={chartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          BERT Emotion Classification
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Pie data={getPieData(results.sentiment_summary, 'bert_emotion')} options={chartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tab === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          VADER Sentiment Analysis
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Bar data={getBarData(results.sentiment_summary, 'vader')} options={barChartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          TextBlob Sentiment Analysis
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Bar data={getBarData(results.sentiment_summary, 'textblob')} options={barChartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          BERT Sentiment Analysis
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Bar data={getBarData(results.sentiment_summary, 'bert_sentiment')} options={barChartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          BERT Emotion Analysis
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Bar data={getBarData(results.sentiment_summary, 'bert_emotion')} options={barChartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          Sentiment Method Comparison
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <Bar data={getSentimentComparison()} options={barChartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          Subreddit Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Doughnut data={getSubredditDistribution()} options={chartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" align="center" gutterBottom>
                          VADER Sentiment (Doughnut)
                        </Typography>
                        <Box sx={{ height: 300 }}>
                          <Doughnut data={getDoughnutData(results.sentiment_summary, 'vader')} options={chartOptions} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {tab === 4 && (
                <Grid container spacing={3}>
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
                            <Grid item xs={4} key={sentiment}>
                              <Chip
                                label={`${sentiment}: ${count}`}
                                color={sentiment === 'positive' ? 'success' : sentiment === 'negative' ? 'error' : 'warning'}
                                variant="outlined"
                                sx={{ width: '100%' }}
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
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <WordCloud 
                      data={generateWordCloudData(results.all_posts, 'vader_label').positive} 
                      title="Positive Posts Word Cloud"
                      height={400}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <WordCloud 
                      data={generateWordCloudData(results.all_posts, 'vader_label').negative} 
                      title="Negative Posts Word Cloud"
                      height={400}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <WordCloud 
                      data={generateWordCloudData(results.all_posts, 'vader_label').neutral} 
                      title="Neutral Posts Word Cloud"
                      height={400}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <WordCloud 
                      data={generateWordCloudData(results.all_posts, 'vader_label').all} 
                      title="All Posts Word Cloud"
                      height={400}
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
    </Box>
  );
}

export default App;
