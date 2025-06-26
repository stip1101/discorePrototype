import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import ApiService from '../services/api';
import { formatNumber } from '../utils/helpers';

const StatsOverview = () => {
  const [stats, setStats] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchLiveStats();
    
    // Update live stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const platformStats = await ApiService.getPlatformStats();
      setStats(platformStats);
      setError(null);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveStats = async () => {
    try {
      const live = await ApiService.getLiveStats();
      setLiveStats(live);
    } catch (err) {
      console.error('Error loading live stats:', err);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-discord-500 animate-spin" />
            <span className="ml-3 text-white">Loading statistics...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </section>
    );
  }

  const statCards = [
    {
      title: 'Analyzed Servers',
      value: liveStats?.guilds || stats?.totalGuilds || 0,
      icon: <BarChart3 className="w-8 h-8" />,
      trend: stats?.serverGrowth || '+12%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      isLive: true
    },
    {
      title: 'Active Users',
      value: liveStats?.users || stats?.totalUsers || 0,
      icon: <Users className="w-8 h-8" />,
      trend: stats?.userGrowth || '+23%',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    }
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Platform <span className="text-gradient">Statistics</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time Discord server monitoring and analysis
          </p>
          {liveStats && (
            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Uptime: {Math.floor(liveStats.uptime / 3600)}h {Math.floor((liveStats.uptime % 3600) / 60)}m
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              {/* Icon and trend */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.trend}
                </div>
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className="text-2xl font-bold text-white flex items-center">
                  {formatNumber(stat.value)}
                  {stat.isLive && (
                    <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="text-gray-400 text-sm">
                {stat.title}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average server health */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3">Community Health</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {(parseFloat(stats.avgHealthScore || 0) * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full"
                  style={{ width: `${parseFloat(stats.avgHealthScore || 0) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Average activity */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-white font-semibold mb-3">Activity</h3>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatNumber(stats.totalMembers) || 'Loading data'}
              </div>
              <div className="text-gray-400 text-sm">
                {formatNumber(stats.totalMembers || 0)} members
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsOverview; 