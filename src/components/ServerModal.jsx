import React, { useState, useEffect } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { X, Users, Calendar, TrendingUp, Award, MessageSquare, Shield, Crown, Heart, Zap, AlertTriangle, Activity } from 'lucide-react';
import { formatNumber, formatDate, getScoreColor, getSentimentColor, getEngagementColor } from '../utils/helpers';
import ApiService from '../services/api';

const ServerModal = ({ server, isOpen, onClose }) => {
  const [serverDetails, setServerDetails] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    if (isOpen && server) {
      fetchServerDetails();
      fetchLeaderboard();
    }
  }, [isOpen, server]);

  const fetchServerDetails = async () => {
    try {
      setLoading(true);
      const details = await ApiService.getServerStats(server.id);
      setServerDetails(details);
      setError(null);
    } catch (err) {
      console.error('Error fetching server details:', err);
      setError('Failed to load server details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leaderboardData = await ApiService.getServerLeaderboard(server.id);
      setLeaderboard(leaderboardData.slice(0, 10)); // Top 10 users
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  if (!server) return null;

  const tabs = [
    { name: 'Overview', icon: TrendingUp },
    { name: 'Top Users', icon: Users },
    { name: 'Events', icon: Calendar },
    { name: 'Analytics', icon: Award }
  ];

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': 
      case 'administrator': 
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': 
      case 'mod': 
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'contributor': 
      case 'helper': 
        return <Heart className="w-4 h-4 text-purple-500" />;
      case 'member': 
      default: 
        return <Users className="w-4 h-4 text-green-500" />;
    }
  };

  // Mock events based on server activity - replace with real data when available
  const generateServerEvents = () => {
    if (!serverDetails?.stats) return [];
    
    const events = [];
    const now = new Date();
    
    // Generate events based on server activity patterns
    if (serverDetails.stats.dailyMessages > 100) {
      events.push({
        type: 'high_activity',
        title: 'High Activity Period',
        description: `${serverDetails.stats.dailyMessages} messages today`,
        timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
        icon: 'activity'
      });
    }
    
    if (serverDetails.stats.newMembers > 0) {
      events.push({
        type: 'member_growth',
        title: 'New Members Joined',
        description: `${serverDetails.stats.newMembers} new members this week`,
        timestamp: new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000),
        icon: 'member_join'
      });
    }
    
    if (serverDetails.analysis?.healthScore > 0.8) {
      events.push({
        type: 'community_health',
        title: 'Excellent Community Health',
        description: 'Community health metrics are performing well',
        timestamp: new Date(now - Math.random() * 3 * 24 * 60 * 60 * 1000),
        icon: 'achievement'
      });
    }
    
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'member_join': 
      case 'member_growth': 
        return <Users className="w-4 h-4 text-green-500" />;
      case 'high_activity': 
      case 'activity': 
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'moderation': 
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'achievement': 
      case 'community_health': 
        return <Award className="w-4 h-4 text-green-500" />;
      case 'announcement': 
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: 
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  // Generate community interests based on server focus
  const getCommunityInterests = () => {
    if (!server.focusType) return ['General Discussion', 'Community'];
    
    const interests = [];
    switch (server.focusType?.toLowerCase()) {
      case 'gaming':
        interests.push('Gaming', 'Esports', 'Streaming', 'Game Reviews');
        break;
      case 'technology':
      case 'tech':
        interests.push('Programming', 'AI/ML', 'Web Development', 'Tech News');
        break;
      case 'product/technical':
        interests.push('Product Development', 'Technical Discussion', 'Innovation', 'Development');
        break;
      case 'education':
        interests.push('Learning', 'Tutorials', 'Knowledge Sharing', 'Study Groups');
        break;
      case 'art':
        interests.push('Digital Art', 'Creative Projects', 'Design', 'Art Sharing');
        break;
      default:
        interests.push('General Discussion', 'Community Building', 'Social', 'Chat');
    }
    
    return interests.slice(0, 6);
  };

  // Calculate health metrics from real data
  const getHealthMetrics = () => {
    if (!serverDetails?.analysis) {
      return {
        engagement: 50,
        sentiment: 50,
        growth: 50
      };
    }
    
    const { analysis } = serverDetails;
    
    return {
      engagement: Math.round((analysis.engagementScore || analysis.avgEngagement || 0.5) * 100),
      sentiment: Math.round(((analysis.sentimentScore ?? analysis.avgSentiment ?? 0) + 1) / 2 * 100),
      growth: Math.round((1 - (analysis.toxicityLevel ?? analysis.avgToxicity ?? 0)) * 100)
    };
  };

  const healthMetrics = getHealthMetrics();
  const events = generateServerEvents();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full max-h-[90vh] bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-discord-900 to-discord-700 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-2xl font-bold text-white mb-2 flex items-center">
                  {server.name}
                  {server.trending && (
                    <span className="ml-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs">
                      🔥 Trending
                    </span>
                  )}
                </Dialog.Title>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {formatNumber(server.memberCount)} members
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(server.lastAnalyzed || server.createdAt)}
                  </span>
                </div>
                
                {/* Info note – analysis is automatic */}
                <div className="mt-4 text-sm text-gray-400">
                  🔄 Analysis updates automatically every hour.
                </div>
                
                {/* Analysis Results Summary */}
                {analysisResults && (
                  <div className="mt-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="text-green-300 text-sm font-medium">
                      ✅ Analysis Complete
                    </div>
                    <div className="text-green-200 text-xs mt-1">
                      Analyzed {analysisResults.stats?.messagesAnalyzed || 0} messages • 
                      Health Score: {Math.round((analysisResults.analysis?.healthScore || 0) * 100)}%
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(server.score || 50)}`}>
                  {server.score || 50}
                </div>
                <div className="flex items-center mt-1">
                  <span className={`text-sm font-medium ${(server.scoreChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(server.scoreChange || 0) >= 0 ? '+' : ''}{server.scoreChange || 0}
                  </span>
                  <TrendingUp className={`w-4 h-4 ml-1 ${(server.scoreChange || 0) >= 0 ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getEngagementColor(server.engagement || 'Medium')}`}>
                  {server.engagement || 'Medium'}
                </div>
                <div className="text-xs text-gray-400">Engagement</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getSentimentColor(server.sentiment || 'Neutral')}`}>
                  {server.sentiment || 'Neutral'}
                </div>
                <div className="text-xs text-gray-400">Sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">
                  {server.focusType || 'General'}
                </div>
                <div className="text-xs text-gray-400">Focus</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-y-auto max-h-[60vh]">
            <Tab.Group>
              <Tab.List className="flex border-b border-gray-700 px-6">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                        selected
                          ? 'text-discord-400 border-b-2 border-discord-400'
                          : 'text-gray-400 hover:text-white'
                      }`
                    }
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </Tab>
                ))}
              </Tab.List>

              <Tab.Panels className="p-6">
                {/* Overview Tab */}
                <Tab.Panel className="space-y-6">
                  {loading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-400"></div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Community Interests */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Community Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {getCommunityInterests().map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-discord-500/20 text-discord-300 text-sm rounded-full border border-discord-500/30"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Health Score Breakdown */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Health Score Breakdown</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Engagement</span>
                            <span className="text-white">{healthMetrics.engagement}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full transition-all duration-500" 
                              style={{ width: `${healthMetrics.engagement}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Sentiment</span>
                            <span className="text-white">{healthMetrics.sentiment}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full transition-all duration-500" 
                              style={{ width: `${healthMetrics.sentiment}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Community Health</span>
                            <span className="text-white">{healthMetrics.growth}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-purple-500 rounded-full transition-all duration-500" 
                              style={{ width: `${healthMetrics.growth}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  {serverDetails?.analysis && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {(serverDetails.analysis.positive_indicators || ['Active community']).map((strength, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {serverDetails.analysis.concerns && serverDetails.analysis.concerns.length > 0 && (
                        <div>
                          <h4 className="text-white font-medium mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-1">
                            {serverDetails.analysis.concerns.map((concern, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-start">
                                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </Tab.Panel>

                {/* Top Users Tab */}
                <Tab.Panel className="space-y-4">
                  <h3 className="text-white font-semibold">Top Contributors</h3>
                  {leaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboard.map((user, index) => (
                        <div key={user.id || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-discord-500 rounded-full text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-white font-medium">{user.username || `User ${index + 1}`}</div>
                              <div className="text-sm text-gray-400 flex items-center">
                                {getRoleIcon(user.role)}
                                <span className="ml-1">{user.role || 'Member'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{user.score || Math.floor(Math.random() * 100) + 50}</div>
                            <div className="text-xs text-gray-400">Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No user data available</p>
                    </div>
                  )}
                </Tab.Panel>

                {/* Events Tab */}
                <Tab.Panel className="space-y-4">
                  <h3 className="text-white font-semibold">Recent Activity</h3>
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                          <div className="mt-1">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{event.title}</div>
                            <div className="text-sm text-gray-400">{event.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(event.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recent events</p>
                    </div>
                  )}
                </Tab.Panel>

                {/* Analytics Tab */}
                <Tab.Panel className="space-y-4">
                  <h3 className="text-white font-semibold">Server Analytics</h3>
                  {serverDetails?.stats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-400">{serverDetails.stats.dailyMessages || 0}</div>
                        <div className="text-sm text-gray-400">Daily Messages</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-400">{serverDetails.stats.activeUsers || 0}</div>
                        <div className="text-sm text-gray-400">Active Users</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-400">{healthMetrics.engagement}%</div>
                        <div className="text-sm text-gray-400">Engagement Rate</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-400">{serverDetails.stats.newMembers || 0}</div>
                        <div className="text-sm text-gray-400">New Members</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Analytics data loading...</p>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ServerModal; 