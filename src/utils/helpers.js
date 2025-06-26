export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 80) return 'text-blue-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-500';
};

export const getScoreBg = (score) => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-blue-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getEngagementColor = (engagement) => {
  switch (engagement.toLowerCase()) {
    case 'very high': return 'text-purple-500';
    case 'high': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-orange-500';
    default: return 'text-gray-500';
  }
};

export const getSentimentColor = (sentiment) => {
  switch (sentiment.toLowerCase()) {
    case 'very positive': return 'text-green-500';
    case 'positive': return 'text-blue-500';
    case 'neutral': return 'text-gray-500';
    case 'mixed': return 'text-yellow-500';
    case 'negative': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const calculateTrendDirection = (current, previous) => {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 