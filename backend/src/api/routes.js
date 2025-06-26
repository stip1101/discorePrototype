import express from 'express';
import { DatabaseService } from '../services/databaseService.js';
import { getAnalysisService } from '../services/analysisService.js';

const router = express.Router();
const db = new DatabaseService();

// Get public servers for ranking
router.get('/servers/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'health_score' } = req.query;
    
    // Mapping from frontend field names to database field names
    const sortMapping = {
      'healthScore': 'health_score',
      'health_score': 'health_score',
      'member_count': 'member_count',
      'memberCount': 'member_count',
      'daily_messages': 'daily_messages',
      'dailyMessages': 'daily_messages',
      'engagement_score': 'engagement_score',
      'engagementScore': 'engagement_score'
    };
    
    const dbSortBy = sortMapping[sortBy] || 'health_score';
    
    const servers = await db.getPublicServers({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: dbSortBy
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
    console.error('Error fetching servers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get detailed server statistics
router.get('/servers/:guildId/stats', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { period = '7d' } = req.query;

    // Check if server allows public access
    const server = await db.getGuild(guildId);
    if (!server || !server.is_public) {
      return res.status(404).json({ 
        success: false, 
        error: 'Server not found or private' 
      });
    }

    const stats = await db.getGuildStats(guildId, period);
    const analysis = await db.getServerAnalysis(guildId);

    res.json({
      success: true,
      data: {
        server: {
          name: server.name,
          memberCount: server.member_count,
          createdAt: server.created_at
        },
        stats,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching server stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Trigger real-time analysis for a server using OpenAI
router.post('/servers/:guildId/analyze', async (req, res) => {
  try {
    const { guildId } = req.params;

    // Check if server exists and is public
    const server = await db.getGuild(guildId);
    if (!server) {
      return res.status(404).json({ 
        success: false, 
        error: 'Server not found' 
      });
    }

    // Get recent messages for analysis
    let recentMessages = await db.getRecentMessages(guildId, 50);
    
    // If no recent messages in last 24h, try last 30 days
    if (recentMessages.length === 0) {
      recentMessages = await db.Message.findAll({
        where: { guild_id: guildId },
        include: [{ model: db.User, attributes: ['username'] }],
        order: [['sent_at', 'DESC']],
        limit: 50
      }).then(rows => rows.map(r => ({ id: r.id, content: r.content, author: r.User?.username || 'Unknown' })));
    }
    
    if (recentMessages.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No messages found for analysis',
          analysis: {
            healthScore: 0.5,
            avgSentiment: 0,
            avgToxicity: 0,
            avgEngagement: 0.5,
            summary: 'Insufficient data for analysis'
          }
        }
      });
    }

    console.log(`🔄 Starting OpenAI analysis for server ${server.name} (${recentMessages.length} messages)`);

    // Analyze messages using OpenAI
    const analysisService = getAnalysisService();
    const analysisResults = await analysisService.analyzeMessagesBatch(recentMessages);
    
    // Calculate overall server health
    const healthMetrics = analysisService.calculateServerHealth(analysisResults);
    
    // Extract nested metrics for easier usage
    const {
      avgSentiment,
      avgToxicity,
      avgEngagement,
      engagementLevel,
      totalAnalyzed
    } = healthMetrics.metrics;

    // Get community health analysis
    const communityHealth = await analysisService.analyzeCommunityHealth(
      recentMessages.map(m => ({
        content: m.content,
        author: m.author || 'User'
      }))
    );

    // Build finalAnalysis using extracted metrics
    const finalAnalysis = {
      healthScore: healthMetrics.healthScore,
      avgSentiment,
      avgToxicity,
      avgEngagement,
      engagementLevel,
      totalAnalyzed,
      summary: healthMetrics.summary,
      positive_indicators: communityHealth.positive_indicators || ['Active community'],
      concerns: communityHealth.concerns || [],
      recommendations: communityHealth.recommendations || ['Continue engaging with community'],
      lastAnalyzed: new Date()
    };

    // Update guild metrics with correct fields
    await db.updateGuildMetrics(guildId, {
      healthScore: finalAnalysis.healthScore,
      engagementLevel: finalAnalysis.engagementLevel,
      avgToxicity: finalAnalysis.avgToxicity,
      engagementScore: finalAnalysis.avgEngagement
    });

    console.log(`✅ Analysis completed for server ${server.name}:`, finalAnalysis);

    res.json({
      success: true,
      data: {
        message: 'Analysis completed successfully',
        analysis: finalAnalysis,
        stats: {
          messagesAnalyzed: recentMessages.length,
          validAnalyses: totalAnalyzed,
          analysisDate: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Error during server analysis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Analysis failed',
      details: error.message
    });
  }
});

// Get server leaderboard
router.get('/servers/:guildId/leaderboard', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { type = 'overall', limit = 50 } = req.query;

    const server = await db.getGuild(guildId);
    if (!server || !server.is_public) {
      return res.status(404).json({ 
        success: false, 
        error: 'Server not found or private' 
      });
    }

    const rawLeaderboard = await db.getLeaderboard(guildId, type, parseInt(limit));

    // Transform data: flatten user info for frontend
    const leaderboard = rawLeaderboard.map(item => ({
      id: item.user_id || item.User?.id || item.id,
      username: item.User?.username || 'Unknown',
      avatar: item.User?.avatar || null,
      role: 'Member', // Placeholder, can parse roles array if needed
      score: parseFloat(item.guild_score || item.contribution_score || 0.5) * 100,
      totalMessages: item.messages_in_guild || 0
    }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Search users for analysis
router.get('/users/search', async (req, res) => {
  try {
    const { username, guildId } = req.query;

    if (!username || username.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum 2 characters for search' 
      });
    }

    const users = await db.searchUsers(username, guildId);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get user analysis
router.get('/users/:userId/analysis', async (req, res) => {
  try {
    const { userId } = req.params;
    const { guildId } = req.query;

    // Check user privacy settings
    const user = await db.getUser(userId, guildId);
    if (!user || !user.isPublic) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found or data private' 
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
    console.error('Error fetching user analysis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get platform statistics
router.get('/platform/stats', async (req, res) => {
  try {
    const stats = await db.getPlatformStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get trending servers
router.get('/trending/servers', async (req, res) => {
  try {
    const { limit = 10, period = '24h' } = req.query;
    
    // Get top servers by activity for the period
    const servers = await db.getPublicServers({
      page: 1,
      limit: parseInt(limit),
      sortBy: 'daily_messages' // Sort by daily messages
    });

    res.json({
      success: true,
      data: servers.servers || []
    });
  } catch (error) {
    console.error('Error fetching trending servers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get live statistics
router.get('/live/stats', async (req, res) => {
  try {
    const stats = await db.getPlatformStats();
    
    // Add live data
    const liveStats = {
      guilds: stats.totalServers || 0,
      users: stats.totalUsers || 0,
      messages: stats.totalMessages || 0,
      uptime: process.uptime(),
      timestamp: Date.now()
    };

    res.json({
      success: true,
      data: liveStats
    });
  } catch (error) {
    console.error('Error fetching live stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get server categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'gaming', name: 'Gaming', count: 0 },
      { id: 'tech', name: 'Technology', count: 0 },
      { id: 'art', name: 'Art & Design', count: 0 },
      { id: 'education', name: 'Education', count: 0 },
      { id: 'community', name: 'Community', count: 0 }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get servers by category
router.get('/categories/:category/servers', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // For now, return all public servers
    const servers = await db.getPublicServers({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: 'health_score'
    });

    res.json({
      success: true,
      data: servers
    });
  } catch (error) {
    console.error('Error fetching category servers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Get bot invite link
router.get('/bot/invite', async (req, res) => {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const permissions = '8'; // Administrator permissions
    const scopes = 'bot%20applications.commands';
    
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes}`;
    
    res.json({
      success: true,
      data: {
        inviteUrl,
        permissions: ['Administrator', 'Read Messages', 'Send Messages', 'Manage Messages']
      }
    });
  } catch (error) {
    console.error('Error fetching bot invite:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// API for server owners - privacy settings
router.put('/servers/:guildId/privacy', async (req, res) => {
  try {
    const { guildId } = req.params;
    const { isPublic, discordUserId } = req.body;

    // Verify user is server owner
    const isOwner = await db.verifyServerOwner(guildId, discordUserId);
    if (!isOwner) {
      return res.status(403).json({ 
        success: false, 
        error: 'No permission to modify settings' 
      });
    }

    await db.updateServerPrivacy(guildId, { isPublic });

    res.json({
      success: true,
      message: 'Privacy settings updated'
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

export default router; 