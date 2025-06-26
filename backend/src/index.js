import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import DiscoreBot from './bot/index.js';
import { DatabaseService } from './services/databaseService.js';
import apiRoutes from './api/routes.js';
import { startHourlyAnalysis } from './scheduler/hourlyAnalysis.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Discore Backend',
    version: '2.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🤖 Discore AI Backend',
    version: '2.0.0',
    status: 'Running',
    features: [
      'Discord Bot Integration',
      'AI Message Analysis (OpenAI)',
      'Real-time Statistics',
      'User & Server Analytics',
      'Toxicity Detection',
      'Quality Assessment',
      'AI Content Detection',
      'MySQL Database'
    ],
    ai_model: process.env.OPENAI_MODEL || 'gpt-4.1-nano-2025-04-14',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: ['/health', '/api']
  });
});

async function startApplication() {
  try {
    console.log('🚀 Starting Discore Application...');
    
    // Initialize database connection
    console.log('📦 Connecting to MySQL database...');
    const databaseService = new DatabaseService();
    await databaseService.connect();
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🌐 API Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
    });

    // Initialize Discord Bot
    console.log('🤖 Starting Discord Bot...');
    const bot = new DiscoreBot();
    await bot.start();
    
    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Close Discord bot
        if (bot.client) {
          console.log('🤖 Closing Discord bot...');
          bot.client.destroy();
        }
        
        // Close database connection
        console.log('📦 Closing database connection...');
        await databaseService.disconnect();
        
        // Close Express server
        console.log('🌐 Closing HTTP server...');
        server.close(() => {
          console.log('✅ Application shutdown complete');
          process.exit(0);
        });
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    console.log('✅ Discore Application started successfully!');
    console.log('📊 Ready to analyze Discord servers with AI');
    
    // Start background hourly analysis scheduler
    startHourlyAnalysis(databaseService);
    console.log('⏰ Hourly analysis scheduler initialised (runs at the top of every hour)');
    
  } catch (error) {
    console.error('💥 Failed to start application:', error);
    process.exit(1);
  }
}

// Start the application
startApplication(); 