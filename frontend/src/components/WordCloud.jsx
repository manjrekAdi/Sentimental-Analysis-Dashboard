import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Chart } from 'chart.js/auto';

const WordCloud = ({ data, title, height = 300 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    
    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create word cloud data
    const words = data.map(item => ({
      text: item.word,
      value: item.frequency,
      size: Math.max(12, Math.min(60, 12 + (item.frequency * 8))) // Scale font size
    }));

    // Sort by frequency for better layout
    words.sort((a, b) => b.value - a.value);

    // Create custom word cloud chart
    chartRef.current = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          data: words.map((word, index) => ({
            x: Math.random() * 100, // Random x position
            y: Math.random() * 100, // Random y position
            r: word.size / 3, // Bubble size based on word frequency
            word: word.text,
            frequency: word.value
          })),
          backgroundColor: words.map(() => 
            `hsl(${Math.random() * 360}, 70%, 60%)`
          ),
          borderColor: words.map(() => 
            `hsl(${Math.random() * 360}, 70%, 40%)`
          ),
          borderWidth: 1,
          label: 'words'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.raw.word}: ${context.raw.frequency} times`;
              }
            }
          }
        },
        scales: {
          x: {
            display: false,
            min: 0,
            max: 100
          },
          y: {
            display: false,
            min: 0,
            max: 100
          }
        },
        elements: {
          point: {
            radius: 0
          }
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const word = elements[0].raw.word;
            console.log(`Clicked word: ${word}`);
            // You can add click handling here
          }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No data available for word cloud
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, height }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', height: height - 60 }}>
        <canvas ref={canvasRef} />
      </Box>
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {data.slice(0, 5).map((item, index) => (
          <Box
            key={index}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'grey.100',
              fontSize: `${Math.max(10, Math.min(16, 10 + (item.frequency * 2)))}px`,
              fontWeight: 'bold'
            }}
          >
            {item.word} ({item.frequency})
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default WordCloud; 