import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, X, Loader2, AlertCircle } from 'lucide-react';
import ServerCard from './ServerCard';
import ServerModal from './ServerModal';
import { serverTypes, communityInterests } from '../data/mockData';
import ApiService from '../services/api';

const ServerGrid = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFocus, setSelectedFocus] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [scoreChangeFilter, setScoreChangeFilter] = useState('all'); // all, positive, negative, rising_stars
  const [sortBy, setSortBy] = useState('health_score');
  const [selectedServer, setSelectedServer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async (filters = {}) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy: sortBy,
        ...filters
      };
      
      const response = await ApiService.getPublicServers(params);
      const serversData = response.servers || response; // Поддержка разных форматов
      
      // Преобразуем данные из базы в формат, ожидаемый компонентами
      const transformedServers = serversData.map(server => ({
        id: server.id,
        name: server.name,
        memberCount: server.member_count,
        score: parseFloat(server.health_score || 0) * 100, // Конвертируем в проценты
        scoreChange: Math.floor(Math.random() * 20) - 10, // Временно, пока нет данных об изменениях
        engagement: getEngagementLevel(parseFloat(server.engagement_score || 0)),
        sentiment: getSentimentLevel(parseFloat(server.toxicity_level || 0)),
        lastAnalyzed: server.last_analyzed
          ? new Date(server.last_analyzed).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        trending: parseFloat(server.health_score || 0) > 0.85,
        focusType: 'Product/Technical', // Временно, пока нет категоризации
        sentimentType: parseFloat(server.toxicity_level || 0) < 0.3 ? 'Support/Contribution' : 'Critical Discussion',
        communityInterests: ['Community Contributors'], // Временно
        topUsers: [], // Временно
        events: [], // Временно
        analysis: {
          strengths: ['Active community'],
          weaknesses: ['Needs improvement'],
          recommendations: ['Continue engagement']
        }
      }));
      
      setServers(transformedServers);
      setTotalPages(response.totalPages || Math.ceil((response.total || serversData.length) / 12));
      setError(null);
    } catch (err) {
      console.error('Error loading servers:', err);
      setError('Failed to load server list');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevel = (score) => {
    if (score >= 0.8) return 'Very High';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  const getSentimentLevel = (toxicity) => {
    if (toxicity < 0.2) return 'Very Positive';
    if (toxicity < 0.4) return 'Positive';
    if (toxicity < 0.6) return 'Mixed';
    return 'Negative';
  };

  const handleServerClick = (server) => {
    setSelectedServer(server);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedServer(null);
  };

  const filteredAndSortedServers = useMemo(() => {
    let filtered = servers.filter(server => {
      const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          server.communityInterests.some(interest => 
                            interest.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesFocus = !selectedFocus || server.focusType === selectedFocus;
      const matchesSentiment = !selectedSentiment || server.sentimentType === selectedSentiment;
      const matchesInterest = !selectedInterest || 
                            server.communityInterests.includes(selectedInterest);
      
      const matchesScoreChange = (() => {
        switch (scoreChangeFilter) {
          case 'positive': return server.scoreChange > 0;
          case 'negative': return server.scoreChange < 0;
          case 'rising_stars': return server.scoreChange >= 5;
          default: return true;
        }
      })();

      return matchesSearch && matchesFocus && matchesSentiment && matchesInterest && matchesScoreChange;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'health_score':
        case 'score':
          return b.score - a.score;
        case 'members':
          return b.memberCount - a.memberCount;
        case 'scoreChange':
          return b.scoreChange - a.scoreChange;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastAnalyzed':
          return new Date(b.lastAnalyzed) - new Date(a.lastAnalyzed);
        default:
          return b.score - a.score;
      }
    });

    return filtered;
  }, [servers, searchTerm, selectedFocus, selectedSentiment, selectedInterest, scoreChangeFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFocus('');
    setSelectedSentiment('');
    setSelectedInterest('');
    setScoreChangeFilter('all');
    setSortBy('health_score');
  };

  const hasActiveFilters = searchTerm || selectedFocus || selectedSentiment || selectedInterest || scoreChangeFilter !== 'all' || sortBy !== 'health_score';

  const scoreChangeOptions = [
    { value: 'all', label: 'All Changes', icon: Filter },
    { value: 'positive', label: 'Positive (+)', icon: TrendingUp },
    { value: 'negative', label: 'Negative (-)', icon: TrendingDown },
    { value: 'rising_stars', label: 'Rising Stars (+5)', icon: TrendingUp }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-discord-500 animate-spin" />
            <span className="ml-3 text-white">Загружаем серверы...</span>
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
            <h3 className="text-xl font-semibold text-white mb-2">Failed to load servers</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchServers}
              className="px-6 py-2 bg-discord-500 text-white rounded-lg hover:bg-discord-600 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Server <span className="text-gradient">Analytics</span>
          </h2>
          <p className="text-gray-400 text-lg text-center max-w-2xl mx-auto mb-8">
            Explore detailed analytics for top Discord servers across various categories
          </p>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search servers or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-discord-500 focus:border-transparent"
              />
            </div>

            {/* Score Change Filter */}
            <div className="relative">
              <select
                value={scoreChangeFilter}
                onChange={(e) => setScoreChangeFilter(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-500 appearance-none cursor-pointer min-w-[160px]"
              >
                {scoreChangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-500 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="health_score">Sort by Score</option>
                <option value="scoreChange">Score Change</option>
                <option value="members">Members</option>
                <option value="name">Name</option>
                <option value="lastAnalyzed">Last Analyzed</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Focus Type Filter */}
            <select
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-500 appearance-none cursor-pointer"
            >
              <option value="">All Focus Types</option>
              {serverTypes.focusType.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Sentiment Filter */}
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-500 appearance-none cursor-pointer"
            >
              <option value="">All Sentiment Types</option>
              {serverTypes.sentimentType.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Community Interest Filter */}
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-discord-500 appearance-none cursor-pointer"
            >
              <option value="">All Interests</option>
              {communityInterests.map((interest) => (
                <option key={interest} value={interest}>{interest}</option>
              ))}
            </select>
          </div>

          {/* Active Filters & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="px-2 py-1 bg-discord-500/20 text-discord-300 text-xs rounded border border-discord-500/30">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedFocus && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                      Focus: {selectedFocus}
                    </span>
                  )}
                  {selectedSentiment && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                      Sentiment: {selectedSentiment}
                    </span>
                  )}
                  {selectedInterest && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                      Interest: {selectedInterest}
                    </span>
                  )}
                  {scoreChangeFilter !== 'all' && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded border border-orange-500/30">
                      {scoreChangeOptions.find(opt => opt.value === scoreChangeFilter)?.label}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              Showing {filteredAndSortedServers.length} of {servers.length} servers
            </p>
            
            {/* Quick Filter Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setScoreChangeFilter('rising_stars')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  scoreChangeFilter === 'rising_stars'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🌟 Rising Stars
              </button>
              <button
                onClick={() => setSortBy('scoreChange')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  sortBy === 'scoreChange'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📈 Trending
              </button>
            </div>
          </div>
        </div>

        {/* Server Grid */}
        {filteredAndSortedServers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedServers.map((server) => (
              <ServerCard 
                key={server.id} 
                server={server} 
                onServerClick={handleServerClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No servers found</div>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-discord-500 hover:bg-discord-600 text-white rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Server Details Modal */}
        <ServerModal 
          server={selectedServer}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </section>
  );
};

export default ServerGrid; 