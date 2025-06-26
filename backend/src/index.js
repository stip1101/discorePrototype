import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { DiscoreBot } from './bot/index.js';
import apiRoutes from './api/routes.js';
import { DatabaseService } from './services/databaseService.js';

config();

class DiscoreServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001;
    this.bot = new DiscoreBot();
    this.db = new DatabaseService();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS для фронтенда
    this.app.use(cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://discore.com',
        'https://www.discore.com'
      ],
      credentials: true
    }));

    // Парсинг JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Логирование запросов
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Rate limiting (базовый)
    const rateLimitMap = new Map();
    this.app.use('/api', (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 минута
      const maxRequests = 100;

      if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return next();
      }

      const limit = rateLimitMap.get(ip);
      if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + windowMs;
        return next();
      }

      if (limit.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Слишком много запросов. Попробуйте позже.'
        });
      }

      limit.count++;
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        bot: this.bot.client.isReady() ? 'connected' : 'disconnected',
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);

    // Статистика в реальном времени (WebSocket будет позже)
    this.app.get('/api/live/stats', async (req, res) => {
      try {
        const liveStats = {
          guilds: this.bot.client.guilds.cache.size,
          users: this.bot.client.users.cache.size,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        };

        res.json({
          success: true,
          data: liveStats
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Ошибка получения статистики'
        });
      }
    });

    // Bot invite URL
    this.app.get('/api/bot/invite', (req, res) => {
      const permissions = [
        'ViewChannel',
        'SendMessages', 
        'ReadMessageHistory',
        'AddReactions',
        'UseSlashCommands',
        'ManageMessages'
      ].join('%20');

      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=274877906944&scope=bot%20applications.commands`;

      res.json({
        success: true,
        data: { inviteUrl }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Эндпоинт не найден'
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Ошибка сервера:', error);
      res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
      });
    });
  }

  async start() {
    try {
      // Подключаемся к БД
      await this.db.connect();
      console.log('✅ База данных подключена');

      // Запускаем бота
      await this.bot.start();
      console.log('✅ Discord бот запущен');

      // Запускаем веб-сервер
      this.app.listen(this.port, () => {
        console.log(`✅ API сервер запущен на порту ${this.port}`);
        console.log(`🌐 Health check: http://localhost:${this.port}/health`);
        console.log(`📊 API доступно на: http://localhost:${this.port}/api`);
      });

    } catch (error) {
      console.error('❌ Ошибка запуска сервера:', error);
      process.exit(1);
    }
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT. Завершение работы...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM. Завершение работы...');
  process.exit(0);
});

// Запускаем сервер
const server = new DiscoreServer();
server.start().catch(console.error); 