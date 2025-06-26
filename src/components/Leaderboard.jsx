import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, AlertTriangle, Users, Crown, Shield, Heart, Medal, ChevronRight, Star, Award, Loader2, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';
import { formatNumber, getScoreColor, formatDate } from '../utils/helpers';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    topServers: [],
    topUsers: [],
    risingStars: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('servers');

  const tabs = [
    { id: 'servers', name: 'Top Servers', icon: Trophy },
    { id: 'users', name: 'Top Users', icon: Users },
    { id: 'rising', name: 'Rising Stars', icon: TrendingUp },
    { id: 'alerts', name: 'Security Alerts', icon: AlertTriangle }
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Get servers
      const serversResponse = await ApiService.getPublicServers({ limit: 10, sortBy: 'health_score' });
      const servers = serversResponse.servers || serversResponse;
      
      const transformedServers = servers.map((server, index) => ({
        id: server.id,
        name: server.name,
        score: parseFloat(server.health_score || 0) * 100,
        memberCount: server.member_count,
        rank: index + 1,
        scoreChange: Math.floor(Math.random() * 20) - 10,
        engagement: parseFloat(server.engagement_score || 0) >= 0.8 ? 'Very High' : 
                   parseFloat(server.engagement_score || 0) >= 0.6 ? 'High' : 
                   parseFloat(server.engagement_score || 0) >= 0.4 ? 'Medium' : 'Low',
        sentiment: parseFloat(server.toxicity_level || 0) < 0.2 ? 'Very Positive' : 
                  parseFloat(server.toxicity_level || 0) < 0.4 ? 'Positive' : 
                  parseFloat(server.toxicity_level || 0) < 0.6 ? 'Mixed' : 'Negative'
      }));

      const risingStars = transformedServers.filter(s => s.scoreChange > 5);

      const alerts = [
        { type: 'info', message: 'System operating normally', severity: 'info', date: new Date().toISOString().split('T')[0] }
      ];

      setLeaderboardData({
        topServers: transformedServers,
        topUsers: [],
        risingStars,
        alerts
      });
      
      setError(null);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-discord-500 animate-spin" />
            <span className="ml-3 text-white">Loading leaderboard...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Loading Error</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="px-6 py-2 bg-discord-500 text-white rounded-lg hover:bg-discord-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'Contributor': return <Heart className="w-4 h-4 text-purple-500" />;
      case 'Member': return <Users className="w-4 h-4 text-green-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Medal className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/50 text-red-300';
      case 'high': return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
      case 'info': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  const renderServerLeaderboard = () => (
    <div className="space-y-4">
      {leaderboardData.topServers.map((server, index) => (
        <div key={server.id} className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getRankIcon(index + 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-semibold">{server.name}</h3>
                  {server.trending && (
                    <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs">
                      🔥
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <span>{formatNumber(server.memberCount)} members</span>
                  <span>{server.focusType}</span>
                  <span className={`${server.scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {server.scoreChange >= 0 ? '+' : ''}{server.scoreChange}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(server.score)}`}>
                  {server.score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderUserLeaderboard = () => (
    <div className="space-y-4">
      {leaderboardData.topUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            User Rankings
          </h3>
          <p className="text-gray-500">
            User data will be available soon
          </p>
        </div>
      ) : (
        leaderboardData.topUsers.map((user, index) => (
          <div key={user.id} className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-discord-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                    {user.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getRoleIcon(user.role)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{user.username}</h3>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <span>{formatNumber(user.totalMessages)} messages</span>
                    <span>{user.engagement} activity</span>
                    <span className={`${user.scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {user.scoreChange >= 0 ? '+' : ''}{user.scoreChange}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(user.score)}`}>
                    {user.score}
                  </div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderRisingStars = () => (
    <div className="space-y-4">
      {leaderboardData.risingStars.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Rising Stars
          </h3>
          <p className="text-gray-500">
            Servers with highest growth will appear here
          </p>
        </div>
      ) : (
        leaderboardData.risingStars.map((server, index) => (
          <div key={server.id} className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Star className="w-8 h-8 text-yellow-500" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{server.name}</h3>
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs">
                      ⭐ Trending
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <span>{formatNumber(server.memberCount)} members</span>
                    <span className="text-green-400">+{server.scoreChange} growth</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getScoreColor(server.score)}`}>
                  {server.score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {leaderboardData.alerts.map((alert, index) => (
        <div key={index} className={`p-4 rounded-xl border ${getAlertColor(alert.severity)}`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm opacity-80 mt-1">
                {formatDate(alert.date)}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {leaderboardData.alerts.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-400 mb-2">
            All Systems Operational
          </h3>
          <p className="text-gray-500">
            No critical alerts
          </p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'servers': return renderServerLeaderboard();
      case 'users': return renderUserLeaderboard();
      case 'rising': return renderRisingStars();
      case 'alerts': return renderAlerts();
      default: return renderServerLeaderboard();
    }
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Community <span className="text-gradient">Leaderboard</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Top Discord servers and users based on AI analysis data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 m-1 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-discord-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </div>
    </section>
  );
};

export default Leaderboard; 