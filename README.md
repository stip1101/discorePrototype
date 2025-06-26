# 🤖 Discore - AI-платформа анализа Discord серверов

Discore предоставляет глубокую аналитику и AI-анализ для Discord сообществ, помогая владельцам серверов понимать и улучшать свои сообщества.

## ✨ Особенности

- 🧠 **AI-анализ** сообщений через Gemini API
- 📊 **Детальная аналитика** активности пользователей
- 🎯 **Детекция токсичности** в реальном времени  
- 📈 **Предиктивная аналитика** для роста сообщества
- 🏆 **Рейтинги и лидерборды** пользователей
- 🌐 **Красивый веб-интерфейс** для просмотра статистики

## 🏗️ Архитектура

```
discore/
├── src/                    # React фронтенд
│   ├── components/         # UI компоненты
│   ├── services/          # API сервисы
│   └── data/              # Mock данные (для разработки)
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── bot/          # Discord бот
│   │   ├── services/     # Бизнес-логика
│   │   └── api/          # REST API
│   └── package.json
├── marketing-strategy.md  # Стратегия развития
└── README.md
```

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- MongoDB 6.0+
- Redis 6.0+
- Discord Application с ботом
- Gemini API ключ

### 1. Настройка Discord бота

1. Перейдите на [Discord Developer Portal](https://discord.com/developers/applications)
2. Создайте новое приложение
3. В разделе "Bot" создайте бота и скопируйте токен
4. В "OAuth2 > URL Generator" выберите scopes: `bot`, `applications.commands`
5. Permissions: `Read Messages`, `Send Messages`, `Read Message History`, `Add Reactions`

### 2. Получение Gemini API ключа

1. Перейдите на [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Создайте новый API ключ
3. Сохраните ключ для использования в проекте

### 3. Установка и настройка

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/discore.git
cd discore

# Установите зависимости фронтенда
npm install

# Установите зависимости backend
cd backend
npm install

# Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими ключами
```

### 4. Настройка .env файла

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id

# Gemini AI Configuration  
GEMINI_API_KEY=your_gemini_api_key

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/discore
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 5. Запуск базы данных

```bash
# MongoDB
mongod --dbpath ./data/db

# Redis  
redis-server
```

### 6. Запуск приложения

```bash
# Терминал 1: Backend
cd backend
npm run dev

# Терминал 2: Frontend  
npm run dev
```

Приложение будет доступно на:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## 📦 Структура API

### Основные эндпоинты

```
GET  /api/servers/public              # Публичные серверы
GET  /api/servers/:id/stats          # Статистика сервера
GET  /api/servers/:id/leaderboard    # Лидерборд пользователей
GET  /api/users/search               # Поиск пользователей
GET  /api/users/:id/analysis         # Анализ пользователя
GET  /api/platform/stats             # Общая статистика
GET  /api/trending/servers           # Trending серверы
GET  /api/categories                 # Категории серверов
```

### Команды Discord бота

```
/analyze setup    # Настройка анализа сервера
/analyze stats    # Статистика сервера  
/analyze user     # Анализ пользователя
/leaderboard      # Топ пользователей
/settings         # Настройки бота
```

## 🔧 Разработка

### Добавление новых AI анализов

1. Обновите `AnalysisService.js`:
```javascript
async analyzeNewMetric(data) {
  const prompt = `Анализируй новую метрику: ${data}`;
  const result = await this.model.generateContent(prompt);
  return this.parseResponse(result.response.text());
}
```

2. Добавьте в схему базы данных
3. Обновите API эндпоинты
4. Добавьте UI компоненты

### Создание новых команд бота

```javascript
// backend/src/bot/commands/newCommand.js
export default {
  data: new SlashCommandBuilder()
    .setName('newcommand')
    .setDescription('Описание команды'),
  async execute(interaction) {
    // Логика команды
  }
};
```

### Тестирование

```bash
# Запуск тестов backend
cd backend
npm test

# Запуск тестов frontend
npm test
```

## 📈 Деплой

### Production билд

```bash
# Frontend
npm run build

# Backend
cd backend  
npm run build
```

### Docker

```bash
# Билд образов
docker-compose build

# Запуск
docker-compose up -d
```

### Environment variables для production

```env
NODE_ENV=production
DATABASE_URL=mongodb://prod-mongo:27017/discore
REDIS_URL=redis://prod-redis:6379
DISCORD_TOKEN=prod_token
GEMINI_API_KEY=prod_key
```

## 📊 Мониторинг

### Health checks

```bash
curl http://localhost:3001/health
```

### Логи

```bash
# Просмотр логов
docker-compose logs -f discore-backend
docker-compose logs -f discore-frontend
```

### Метрики

- Количество анализируемых серверов
- API response времена
- Gemini API usage
- Ошибки и исключения

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/new-feature`
3. Commit изменения: `git commit -am 'Add new feature'`
4. Push в branch: `git push origin feature/new-feature`  
5. Создайте Pull Request

### Code style

- ESLint для JavaScript
- Prettier для форматирования
- Комментарии на русском языке
- Commit сообщения на английском

## 📝 Лицензия

MIT License. Смотрите [LICENSE](LICENSE) файл.

## 🆘 Поддержка

- 📧 Email: support@discore.com
- 💬 Discord: [Наш сервер](https://discord.gg/discore)
- 📖 Документация: [docs.discore.com](https://docs.discore.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/discore/issues)

## 🚦 Статус

- ✅ Discord бот - Реализован
- ✅ Gemini AI интеграция - Реализована  
- ✅ Базовая аналитика - Реализована
- 🔄 Веб-интерфейс - В разработке
- ⏳ Premium функции - Планируется
- ⏳ Мобильное приложение - Планируется

---

**⭐ Если проект полезен, поставьте звезду!** 