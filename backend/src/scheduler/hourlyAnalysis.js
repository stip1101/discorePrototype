import cron from 'node-cron';
import { getAnalysisService } from '../services/analysisService.js';

/**
 * Starts hourly analysis of all public, active guilds.
 *
 * @param {import('../services/databaseService.js').DatabaseService} dbService - Connected database service instance.
 */
export function startHourlyAnalysis(dbService) {
  if (!dbService) {
    throw new Error('DatabaseService instance is required to start scheduler');
  }

  const analysisService = getAnalysisService();

  // Run at minute 0 of every hour (UTC)
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Hourly analysis job started');

    try {
      const guilds = await dbService.Guild.findAll({
        where: { is_active: true, is_public: true },
        attributes: ['id', 'name', 'last_analyzed']
      });

      for (const guild of guilds) {
        // Skip if analyzed in the last 55 minutes (safety margin)
        if (guild.last_analyzed && Date.now() - new Date(guild.last_analyzed).getTime() < 55 * 60 * 1000) {
          continue;
        }

        console.log(`🔍 Analyzing guild ${guild.name} (${guild.id})`);

        const recentMessages = await dbService.getRecentMessages(guild.id, 50);
        if (recentMessages.length === 0) {
          console.log(`ℹ️  No recent messages for guild ${guild.name}, skipping.`);
          continue;
        }

        const analysisResults = await analysisService.analyzeMessagesBatch(recentMessages);
        const healthMetrics = analysisService.calculateServerHealth(analysisResults);

        await dbService.updateGuildMetrics(guild.id, {
          healthScore: healthMetrics.healthScore,
          engagementLevel: healthMetrics.metrics.engagementLevel,
          avgToxicity: healthMetrics.metrics.avgToxicity,
          engagementScore: healthMetrics.metrics.avgEngagement
        });

        console.log(`✅ Hourly analysis saved for guild ${guild.name}`);
      }

      console.log('⏰ Hourly analysis job finished');
    } catch (error) {
      console.error('❌ Hourly analysis job failed:', error);
    }
  }, {
    timezone: 'UTC'
  });
} 