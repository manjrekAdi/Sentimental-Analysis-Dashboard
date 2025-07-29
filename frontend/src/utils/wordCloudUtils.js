// Common stop words to filter out
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
  'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
  'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'am', 'is', 'are', 'was', 'were',
  'be', 'being', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
  'shall', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'mine', 'yours', 'his', 'hers', 'ours', 'theirs', 'this', 'that', 'these', 'those', 'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for',
  'yet', 'so', 'as', 'if', 'than', 'because', 'although', 'while', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
  'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven',
  'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn'
]);

// Function to clean and tokenize text
export const processText = (text) => {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
    .split(' ')
    .filter(word => 
      word.length > 2 && // Filter out very short words
      !STOP_WORDS.has(word) && // Filter out stop words
      !/^\d+$/.test(word) // Filter out pure numbers
    );
};

// Function to count word frequencies
export const getWordFrequencies = (texts) => {
  const wordCount = {};
  
  texts.forEach(text => {
    const words = processText(text);
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
  });
  
  // Convert to array and sort by frequency
  return Object.entries(wordCount)
    .map(([word, frequency]) => ({ word, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 50); // Limit to top 50 words
};

// Function to generate word cloud data for different sentiment categories
export const generateWordCloudData = (posts, sentimentField = 'vader_label') => {
  const positivePosts = posts.filter(post => post[sentimentField] === 'positive');
  const negativePosts = posts.filter(post => post[sentimentField] === 'negative');
  const neutralPosts = posts.filter(post => post[sentimentField] === 'neutral');
  
  return {
    positive: getWordFrequencies(positivePosts.map(post => post.title)),
    negative: getWordFrequencies(negativePosts.map(post => post.title)),
    neutral: getWordFrequencies(neutralPosts.map(post => post.title)),
    all: getWordFrequencies(posts.map(post => post.title))
  };
};

// Function to get emotion-based word clouds
export const generateEmotionWordCloudData = (posts) => {
  const emotions = {};
  
  posts.forEach(post => {
    const emotion = post.bert_emotion;
    if (emotion) {
      if (!emotions[emotion]) {
        emotions[emotion] = [];
      }
      emotions[emotion].push(post.title);
    }
  });
  
  const result = {};
  Object.entries(emotions).forEach(([emotion, titles]) => {
    result[emotion] = getWordFrequencies(titles);
  });
  
  return result;
}; 