import express from 'express';
import { DatabaseService } from '../services/databaseService.js';
import { AnalysisService } from '../services/analysisService.js';

const router = express.Router();
const db = new DatabaseService();
const analysis = new AnalysisService();

// Получить список серверов для публичного рейтинга
router.get('/servers/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'healthScore' } = req.query;
    
    const servers = await db.getPublicServers({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy
    });

    res.json({
      success: true,
      data: servers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: servers.total
      }
    });
  } catch (error) {
    console.error('Ошибка получения серверов:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить детальную статистику сервера
router.get('/servers/:guildId/stats', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { period = '7d' } = req.query;

    // Проверяем, разрешен ли публичный доступ к серверу
    const server = await db.getGuild(guildId);
    if (!server || !server.isPublic) {
      return res.status(404).json({ 
        success: false, 
        error: 'Сервер не найден или закрыт' 
      });
    }

    const stats = await db.getServerStats(guildId, period);
    const analysis = await db.getServerAnalysis(guildId);

    res.json({
      success: true,
      data: {
        server: {
          name: server.name,
          memberCount: server.memberCount,
          createdAt: server.createdAt
        },
        stats,
        analysis
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики сервера:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить лидерборд пользователей сервера
router.get('/servers/:guildId/leaderboard', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { type = 'overall', limit = 50 } = req.query;

    const server = await db.getGuild(guildId);
    if (!server || !server.isPublic) {
      return res.status(404).json({ 
        success: false, 
        error: 'Сервер не найден или закрыт' 
      });
    }

    const leaderboard = await db.getLeaderboard(guildId, type, parseInt(limit));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Ошибка получения лидерборда:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Поиск пользователя для анализа
router.get('/users/search', async (req, res) => {
  try {
    const { username, guildId } = req.query;

    if (!username || username.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Минимум 2 символа для поиска' 
      });
    }

    const users = await db.searchUsers(username, guildId);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Ошибка поиска пользователя:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить анализ пользователя
router.get('/users/:userId/analysis', async (req, res) => {
  try {
    const { userId } = req.params;
    const { guildId } = req.query;

    // Проверяем приватность данных пользователя
    const user = await db.getUser(userId, guildId);
    if (!user || !user.isPublic) {
      return res.status(404).json({ 
        success: false, 
        error: 'Пользователь не найден или скрыл данные' 
      });
    }

    const userAnalysis = await db.getUserAnalysis(userId, guildId);
    const userStats = await db.getUserStats(userId, guildId);

    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          avatar: user.avatar,
          joinedAt: user.joinedAt
        },
        analysis: userAnalysis,
        stats: userStats
      }
    });
  } catch (error) {
    console.error('Ошибка получения анализа пользователя:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить общую статистику платформы
router.get('/platform/stats', async (req, res) => {
  try {
    const stats = await db.getPlatformStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики платформы:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить trending серверы
router.get('/trending/servers', async (req, res) => {
  try {
    const { limit = 10, period = '24h' } = req.query;

    const trendingServers = await db.getTrendingServers(parseInt(limit), period);

    res.json({
      success: true,
      data: trendingServers
    });
  } catch (error) {
    console.error('Ошибка получения trending серверов:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить категории серверов
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.getServerCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить серверы по категории
router.get('/categories/:category/servers', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const servers = await db.getServersByCategory(category, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    console.error('Ошибка получения серверов по категории:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// API для владельцев серверов - настройки приватности
router.put('/servers/:guildId/privacy', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { isPublic, discordUserId } = req.body;

    // Проверяем, что пользователь - владелец сервера
    const isOwner = await db.verifyServerOwner(guildId, discordUserId);
    if (!isOwner) {
      return res.status(403).json({ 
        success: false, 
        error: 'Нет прав для изменения настроек' 
      });
    }

    await db.updateServerPrivacy(guildId, { isPublic });

    res.json({
      success: true,
      message: 'Настройки приватности обновлены'
    });
  } catch (error) {
    console.error('Ошибка обновления настроек приватности:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

export default router; 