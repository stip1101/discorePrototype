import React, { useState } from 'react';
import { Users, Calendar, TrendingUp, Heart, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber, getScoreColor, getEngagementColor, getSentimentColor, formatDate } from '../utils/helpers';

const ServerCard = ({ server, onServerClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreColor = getScoreColor(server.score);
  const engagementColor = getEngagementColor(server.engagement);
  const sentimentColor = getSentimentColor(server.sentiment);

  const handleCardClick = () => {
    if (onServerClick) {
      onServerClick(server);
    }
  };

  return (
    <div 
      className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {server.name}
            </h3>
            {server.trending && (
              <div className="ml-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                <span className="text-xs font-medium text-white">🔥 Trending</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {formatNumber(server.memberCount)} members
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(server.lastAnalyzed)}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {server.score}
          </div>
          <div className="flex items-center justify-end mt-1">
            <span className={`text-sm font-medium ${server.scoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {server.scoreChange >= 0 ? '+' : ''}{server.scoreChange}
            </span>
            <TrendingUp className={`w-4 h-4 ml-1 ${server.scoreChange >= 0 ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-sm font-medium ${engagementColor}`}>
            {server.engagement}
          </div>
          <div className="text-xs text-gray-400">Engagement</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-medium ${sentimentColor}`}>
            {server.sentiment}
          </div>
          <div className="text-xs text-gray-400">Sentiment</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-blue-400">
            {server.focusType}
          </div>
          <div className="text-xs text-gray-400">Focus</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {server.communityInterests.slice(0, 2).map((interest, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-discord-500/20 text-discord-300 text-xs rounded-full border border-discord-500/30"
          >
            {interest}
          </span>
        ))}
        {server.communityInterests.length > 2 && (
          <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full border border-gray-600/30">
            +{server.communityInterests.length - 2} more
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Community Health</span>
          <span>{server.score}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${
              server.score >= 90 ? 'from-green-500 to-green-400' :
              server.score >= 80 ? 'from-blue-500 to-blue-400' :
              server.score >= 70 ? 'from-yellow-500 to-yellow-400' :
              'from-orange-500 to-red-500'
            } transition-all duration-1000`}
            style={{ width: `${server.score}%` }}
          ></div>
        </div>
      </div>

      {/* Top Users Preview */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Top Contributors</div>
        <div className="flex -space-x-2">
          {server.topUsers?.slice(0, 3).map((user, index) => (
            <div 
              key={user.id}
              className="w-8 h-8 bg-gradient-to-r from-discord-500 to-purple-600 rounded-full flex items-center justify-center text-sm border-2 border-gray-900"
              title={user.username}
            >
              {user.avatar}
            </div>
          ))}
          {server.topUsers?.length > 3 && (
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400 border-2 border-gray-900">
              +{server.topUsers.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Click to view hint */}
      <div className="text-center pt-2 border-t border-gray-700">
        <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
          Click to view detailed analytics
        </span>
      </div>
    </div>
  );
};

export default ServerCard; 