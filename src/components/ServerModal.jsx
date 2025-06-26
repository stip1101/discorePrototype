import React, { useState } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import { X, Users, Calendar, TrendingUp, Award, MessageSquare, Shield, Crown, Heart, Zap, AlertTriangle } from 'lucide-react';
import { formatNumber, formatDate, getScoreColor, getSentimentColor, getEngagementColor } from '../utils/helpers';

const ServerModal = ({ server, isOpen, onClose }) => {
  if (!server) return null;

  const tabs = [
    { name: 'Overview', icon: TrendingUp },
    { name: 'Top Users', icon: Users },
    { name: 'Events', icon: Calendar },
    { name: 'Analytics', icon: Award }
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

  const getEventIcon = (type) => {
    switch (type) {
      case 'member_join': return <Users className="w-4 h-4 text-green-500" />;
      case 'big_message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'moderation': return <Shield className="w-4 h-4 text-red-500" />;
      case 'trading_alert': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'message_deleted': return <X className="w-4 h-4 text-red-500" />;
      case 'meme_contest': return <Heart className="w-4 h-4 text-purple-500" />;
      case 'educational_event': return <Award className="w-4 h-4 text-blue-500" />;
      case 'networking_event': return <Users className="w-4 h-4 text-green-500" />;
      case 'partnership': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'nft_drop': return <Award className="w-4 h-4 text-purple-500" />;
      case 'achievement': return <Award className="w-4 h-4 text-green-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

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
                    {formatDate(server.lastAnalyzed)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(server.score)}`}>
                  {server.score}
                </div>
                <div className="flex items-center mt-1">
                  <span className={`text-sm font-medium ${server.scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {server.scoreChange >= 0 ? '+' : ''}{server.scoreChange}
                  </span>
                  <TrendingUp className={`w-4 h-4 ml-1 ${server.scoreChange >= 0 ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getEngagementColor(server.engagement)}`}>
                  {server.engagement}
                </div>
                <div className="text-xs text-gray-400">Engagement</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getSentimentColor(server.sentiment)}`}>
                  {server.sentiment}
                </div>
                <div className="text-xs text-gray-400">Sentiment</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-400">
                  {server.focusType}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Community Interests */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Community Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {server.communityInterests.map((interest, index) => (
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
                            <span className="text-white">85%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Sentiment</span>
                            <span className="text-white">78%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Growth</span>
                            <span className="text-white">92%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-2 bg-purple-500 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {server.analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start">
                            <span className="text-green-400 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-400" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {server.analysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start">
                            <span className="text-orange-400 mr-2">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Tab.Panel>

                {/* Top Users Tab */}
                <Tab.Panel>
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold mb-4">Top Community Members</h3>
                    {server.topUsers.map((user, index) => (
                      <div key={user.id} className="glass-effect rounded-xl p-4 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-discord-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                                {user.avatar}
                              </div>
                              <div className="absolute -bottom-1 -right-1">
                                {getRoleIcon(user.role)}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-white font-medium">{user.username}</h4>
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                                  {user.role}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <span>{formatNumber(user.messagesCount)} messages</span>
                                <span>{user.mentions} mentions</span>
                                <span>{formatNumber(user.reactions)} reactions</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${getScoreColor(user.score)}`}>
                              {user.score}
                            </div>
                            <div className="text-xs text-gray-400">User Score</div>
                          </div>
                        </div>
                        
                        {/* User badges */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {user.badges.map((badge, badgeIndex) => (
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
                </Tab.Panel>

                {/* Events Tab */}
                <Tab.Panel>
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold mb-4">Recent Events</h3>
                    {server.events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 glass-effect rounded-xl">
                        <div className="flex-shrink-0 p-2 bg-gray-800 rounded-lg">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-white font-medium capitalize">
                              {event.type.replace('_', ' ')}
                            </h4>
                            <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{event.content}</p>
                          {event.author && (
                            <p className="text-gray-400 text-xs mt-1">by {event.author}</p>
                          )}
                          {event.count && (
                            <p className="text-gray-400 text-xs mt-1">{event.count} new members</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Tab.Panel>

                {/* Analytics Tab */}
                <Tab.Panel>
                  <div className="space-y-6">
                    <h3 className="text-white font-semibold mb-4">Advanced Analytics</h3>
                    
                    {/* Growth Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-effect rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-400">+{Math.abs(server.scoreChange)}</div>
                        <div className="text-sm text-gray-400">Score Change</div>
                      </div>
                      <div className="glass-effect rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {server.events.filter(e => e.type === 'member_join').reduce((sum, e) => sum + (e.count || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-400">New Members (7d)</div>
                      </div>
                      <div className="glass-effect rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {server.events.length}
                        </div>
                        <div className="text-sm text-gray-400">Recent Events</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-purple-400" />
                        AI Recommendations
                      </h4>
                      <div className="space-y-2">
                        {server.analysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Zap className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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