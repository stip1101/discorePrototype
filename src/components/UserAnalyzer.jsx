import React, { useState } from 'react';
import { Search, Shield, Bot, TrendingUp, Users, Award, AlertTriangle, Eye, MessageSquare, Heart, Zap, Loader2 } from 'lucide-react';
import ApiService from '../services/api';
import { formatNumber, getScoreColor, formatDate } from '../utils/helpers';

const UserAnalyzer = () => {
  const [searchUser, setSearchUser] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async (username) => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);
      const results = await ApiService.searchUsers(username.trim());
      
      // Преобразуем результаты в формат, ожидаемый компонентом
      const transformedResults = results.map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar || '👤',
        role: 'Member', // Временно, пока нет ролевой системы
        score: user.overall_score,
        serverScore: user.overall_score,
        messagesCount: user.total_messages,
        mentions: user.total_mentions,
        reactions: user.total_reactions_received,
        banned: user.ban_count > 0,
        aiDetection: user.ai_detection_score,
        languageRatio: { en: 80, ru: 20 }, // Временно
        joinDate: formatDate(user.first_seen),
        lastActive: formatDate(user.updated_at),
        badges: user.overall_score > 90 ? ['High Performer'] : 
               user.overall_score > 70 ? ['Active Member'] : []
      }));
      
      setSearchResults(transformedResults);
    } catch (err) {
      console.error('Ошибка поиска пользователей:', err);
      setSearchError('Не удалось найти пользователей');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInputChange = (value) => {
    setSearchUser(value);
    // Поиск с задержкой
    if (value.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  };

  const getLanguageFlag = (lang) => {
    const flags = {
      en: '🇺🇸',
      ru: '🇷🇺',
      es: '🇪🇸',
      zh: '🇨🇳',
      fr: '🇫🇷',
      de: '🇩🇪'
    };
    return flags[lang] || '🌐';
  };

  const getAIDetectionColor = (percentage) => {
    if (percentage <= 5) return 'text-green-400';
    if (percentage <= 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getUserRiskLevel = (user) => {
    if (user.banned) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (user.aiDetection > 20) return { level: 'Medium', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (user.aiDetection > 10) return { level: 'Low', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Safe', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            User <span className="text-gradient">Account Analyzer</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Advanced Discord user analysis with AI detection, language patterns, and behavior scoring
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchUser}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-discord-500"
            />
          </div>
        </div>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {searchResults.map((user) => {
            const risk = getUserRiskLevel(user);
            return (
              <div
                key={user.id}
                className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
              >
                {/* User Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-discord-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                        {user.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1 bg-gray-900 rounded-full">
                        {user.role === 'Admin' && <Shield className="w-3 h-3 text-yellow-500" />}
                        {user.role === 'Moderator' && <Shield className="w-3 h-3 text-blue-500" />}
                        {user.role === 'Contributor' && <Heart className="w-3 h-3 text-purple-500" />}
                        {user.role === 'Member' && <Users className="w-3 h-3 text-green-500" />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{user.username}</h3>
                      <span className="text-xs text-gray-400">{user.role}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${risk.bg} ${risk.color}`}>
                    {risk.level}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getScoreColor(user.score)}`}>
                      {user.score}
                    </div>
                    <div className="text-xs text-gray-400">User Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getAIDetectionColor(user.aiDetection)}`}>
                      {user.aiDetection}%
                    </div>
                    <div className="text-xs text-gray-400">AI Content</div>
                  </div>
                </div>

                {/* Language Distribution */}
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-2">Language Usage</div>
                  <div className="flex space-x-1">
                    {Object.entries(user.languageRatio).map(([lang, percentage]) => (
                      <div
                        key={lang}
                        className="flex items-center space-x-1 text-xs"
                        title={`${lang.toUpperCase()}: ${percentage}%`}
                      >
                        <span>{getLanguageFlag(lang)}</span>
                        <span className="text-gray-400">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Metrics */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Messages</span>
                    <span className="text-white">{formatNumber(user.messagesCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mentions</span>
                    <span className="text-white">{user.mentions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reactions</span>
                    <span className="text-white">{formatNumber(user.reactions)}</span>
                  </div>
                </div>

                {/* Expand indicator */}
                {selectedUser?.id === user.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    {/* Detailed Analysis */}
                    <div className="space-y-4">
                      {/* Badges */}
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Achievements</div>
                        <div className="flex flex-wrap gap-1">
                          {user.badges.map((badge, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Activity Timeline */}
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Activity</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Joined</span>
                            <span className="text-white">{formatDate(user.joinDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Active</span>
                            <span className="text-white">{formatDate(user.lastActive)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Security Analysis */}
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Security Analysis</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400">AI Detection</span>
                            </div>
                            <span className={`text-xs ${getAIDetectionColor(user.aiDetection)}`}>
                              {user.aiDetection}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400">Banned Status</span>
                            </div>
                            <span className={`text-xs ${user.banned ? 'text-red-400' : 'text-green-400'}`}>
                              {user.banned ? 'Banned' : 'Clean'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className={`p-3 rounded-lg ${risk.bg}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className={`w-4 h-4 ${risk.color}`} />
                          <span className={`text-sm font-medium ${risk.color}`}>
                            Risk Level: {risk.level}
                          </span>
                        </div>
                        <div className="text-xs text-gray-300">
                          {risk.level === 'High' && 'User is banned or shows suspicious behavior'}
                          {risk.level === 'Medium' && 'High AI content detection, monitor activity'}
                          {risk.level === 'Low' && 'Moderate AI usage, generally trustworthy'}
                          {risk.level === 'Safe' && 'Low risk, active community member'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-effect rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">{searchResults.length}</div>
            <div className="text-sm text-gray-400">Total Users Analyzed</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <Bot className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {Math.round(searchResults.reduce((sum, user) => sum + user.aiDetection, 0) / searchResults.length)}%
            </div>
            <div className="text-sm text-gray-400">Avg AI Detection</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {searchResults.filter(user => !user.banned).length}
            </div>
            <div className="text-sm text-gray-400">Clean Accounts</div>
          </div>
          <div className="glass-effect rounded-xl p-6 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">
              {Math.round(searchResults.reduce((sum, user) => sum + user.score, 0) / searchResults.length)}
            </div>
            <div className="text-sm text-gray-400">Avg User Score</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserAnalyzer; 