const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Platform statistics
  async getPlatformStats() {
    return this.request('/platform/stats');
  }

  // Live statistics
  async getLiveStats() {
    return this.request('/live/stats');
  }

  // Public servers
  async getPublicServers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/servers/public${queryString ? `?${queryString}` : ''}`);
  }

  // Server details and stats
  async getServerStats(serverId, period = '7d') {
    return this.request(`/servers/${serverId}/stats?period=${period}`);
  }

  // Trigger real-time OpenAI analysis for a server
  async analyzeServer(serverId) {
    return this.request(`/servers/${serverId}/analyze`, {
      method: 'POST'
    });
  }

  // Server leaderboard
  async getServerLeaderboard(serverId, type = 'overall', limit = 50) {
    return this.request(`/servers/${serverId}/leaderboard?type=${type}&limit=${limit}`);
  }

  // Trending servers
  async getTrendingServers(limit = 10, period = '24h') {
    return this.request(`/trending/servers?limit=${limit}&period=${period}`);
  }

  // User search and analysis
  async searchUsers(username, guildId = null) {
    const params = new URLSearchParams({ username });
    if (guildId) params.append('guildId', guildId);
    return this.request(`/users/search?${params.toString()}`);
  }

  async getUserAnalysis(userId, guildId = null) {
    const params = guildId ? `?guildId=${guildId}` : '';
    return this.request(`/users/${userId}/analysis${params}`);
  }

  // Server categories
  async getCategories() {
    return this.request('/categories');
  }

  async getServersByCategory(category, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/categories/${category}/servers${queryString ? `?${queryString}` : ''}`);
  }

  // Bot invitation
  async getBotInvite() {
    return this.request('/bot/invite');
  }

  // Server privacy settings (for server owners)
  async updateServerPrivacy(serverId, settings) {
    return this.request(`/servers/${serverId}/privacy`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Batch operations with retry logic
  async withRetry(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  // Cached requests (simple in-memory cache)
  _cache = new Map();
  _cacheExpiry = new Map();

  async getCached(key, fetcher, ttl = 30000) { // 30 seconds default TTL
    const now = Date.now();
    const expiry = this._cacheExpiry.get(key);
    
    if (this._cache.has(key) && expiry && now < expiry) {
      return this._cache.get(key);
    }
    
    const data = await fetcher();
    this._cache.set(key, data);
    this._cacheExpiry.set(key, now + ttl);
    
    return data;
  }

  clearCache() {
    this._cache.clear();
    this._cacheExpiry.clear();
  }

  // Real-time updates simulation (replace with WebSocket when available)
  startLiveUpdates(callback, interval = 30000) {
    const updateLoop = async () => {
      try {
        const liveStats = await this.getLiveStats();
        callback(liveStats);
      } catch (error) {
        console.error('Live update failed:', error);
      }
    };

    updateLoop(); // Initial call
    const intervalId = setInterval(updateLoop, interval);
    
    return () => clearInterval(intervalId);
  }
}

export default new ApiService(); 