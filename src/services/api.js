const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.discore.com'
  : 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api`;
  }

  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка API');
      }

      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания запроса');
      }
      
      throw error;
    }
  }

  // Получить серверы для публичного рейтинга
  async getPublicServers(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      sortBy: params.sortBy || 'healthScore'
    });

    return this.fetchWithTimeout(`${this.baseUrl}/servers/public?${queryParams}`);
  }

  // Получить статистику конкретного сервера
  async getServerStats(guildId, period = '7d') {
    return this.fetchWithTimeout(`${this.baseUrl}/servers/${guildId}/stats?period=${period}`);
  }

  // Получить лидерборд сервера
  async getServerLeaderboard(guildId, type = 'overall', limit = 50) {
    return this.fetchWithTimeout(`${this.baseUrl}/servers/${guildId}/leaderboard?type=${type}&limit=${limit}`);
  }

  // Поиск пользователей
  async searchUsers(username, guildId = null) {
    const queryParams = new URLSearchParams({ username });
    if (guildId) queryParams.append('guildId', guildId);

    return this.fetchWithTimeout(`${this.baseUrl}/users/search?${queryParams}`);
  }

  // Получить анализ пользователя
  async getUserAnalysis(userId, guildId = null) {
    const queryParams = guildId ? `?guildId=${guildId}` : '';
    return this.fetchWithTimeout(`${this.baseUrl}/users/${userId}/analysis${queryParams}`);
  }

  // Получить общую статистику платформы
  async getPlatformStats() {
    return this.fetchWithTimeout(`${this.baseUrl}/platform/stats`);
  }

  // Получить trending серверы
  async getTrendingServers(limit = 10, period = '24h') {
    return this.fetchWithTimeout(`${this.baseUrl}/trending/servers?limit=${limit}&period=${period}`);
  }

  // Получить категории серверов
  async getServerCategories() {
    return this.fetchWithTimeout(`${this.baseUrl}/categories`);
  }

  // Получить серверы по категории
  async getServersByCategory(category, params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20
    });

    return this.fetchWithTimeout(`${this.baseUrl}/categories/${category}/servers?${queryParams}`);
  }

  // Получить live статистику
  async getLiveStats() {
    return this.fetchWithTimeout(`${this.baseUrl}/live/stats`);
  }

  // Получить ссылку для приглашения бота
  async getBotInviteUrl() {
    return this.fetchWithTimeout(`${this.baseUrl}/bot/invite`);
  }

  // Обновить настройки приватности сервера (для владельцев)
  async updateServerPrivacy(guildId, settings, discordUserId) {
    return this.fetchWithTimeout(`${this.baseUrl}/servers/${guildId}/privacy`, {
      method: 'PUT',
      body: JSON.stringify({
        ...settings,
        discordUserId
      })
    });
  }

  // Health check
  async healthCheck() {
    return this.fetchWithTimeout(`${API_BASE_URL}/health`);
  }
}

export default new ApiService(); 