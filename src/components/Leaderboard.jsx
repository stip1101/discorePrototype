import React, { useState } from 'react';
import { Trophy, TrendingUp, AlertTriangle, Users, Crown, Shield, Heart, Medal, ChevronRight } from 'lucide-react';
import { leaderboardData } from '../data/mockData';
import { formatNumber, getScoreColor, formatDate } from '../utils/helpers';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('servers');

  const tabs = [
    { id: 'servers', name: 'Top Servers', icon: Trophy },
    { id: 'users', name: 'Top Users', icon: Users },
    { id: 'rising', name: 'Rising Stars', icon: TrendingUp },
    { id: 'alerts', name: 'Security Alerts', icon: AlertTriangle }
  ];

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
                  {server.score}
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
      {leaderboardData.topUsers.map((user, index) => (
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
                  <span>{formatNumber(user.messagesCount)} messages</span>
                  <span>{user.mentions} mentions</span>
                  <span>{user.aiDetection}% AI detected</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(user.score)}`}>
                {user.score}
              </div>
              <div className="text-xs text-gray-400">User Score</div>
            </div>
          </div>
          
          {/* User badges */}
          <div className="flex flex-wrap gap-1 mt-3 ml-20">
            {user.badges.slice(0, 3).map((badge, badgeIndex) => (
              <span
                key={badgeIndex}
                className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderRisingStars = () => (
    <div className="space-y-4">
      {leaderboardData.risingStars.map((server, index) => (
        <div key={server.id} className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-semibold">{server.name}</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                    Rising Fast
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <span>{formatNumber(server.memberCount)} members</span>
                  <span>{server.focusType}</span>
                  <span className="text-green-400">+{server.scoreChange} points</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(server.score)}`}>
                {server.score}
              </div>
              <div className="text-xs text-gray-400">Current Score</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {leaderboardData.alerts.map((alert, index) => (
        <div key={index} className={`p-4 rounded-xl border ${getAlertColor(alert.severity)}`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{alert.type} Alert</span>
                <span className="text-xs opacity-75">{formatDate(alert.date)}</span>
              </div>
              <p className="text-sm opacity-90">{alert.message}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full uppercase font-medium ${
                  alert.severity === 'critical' ? 'bg-red-600 text-white' :
                  alert.severity === 'high' ? 'bg-orange-600 text-white' :
                  alert.severity === 'medium' ? 'bg-yellow-600 text-black' :
                  'bg-blue-600 text-white'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
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
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Community <span className="text-gradient">Leaderboard</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Top performing servers, users, and real-time security insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="glass-effect rounded-xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-discord-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="glass-effect rounded-xl p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">#1</div>
            <div className="text-sm text-gray-400">Top Server Score: {leaderboardData.topServers[0]?.score}</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{leaderboardData.risingStars.length}</div>
            <div className="text-sm text-gray-400">Rising Star Servers</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{leaderboardData.alerts.length}</div>
            <div className="text-sm text-gray-400">Active Security Alerts</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard; 