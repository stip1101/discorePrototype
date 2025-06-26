import { Op } from 'sequelize';
import { sequelize, User, Guild, Message, GuildMember } from '../models/index.js';

export class DatabaseService {
  constructor() {
    this.sequelize = sequelize;
    this.User = User;
    this.Guild = Guild;
    this.Message = Message;
    this.GuildMember = GuildMember;
  }

  /**
   * Connect to database and sync models
   */
  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('✅ MySQL database connection established successfully.');
      
      // Sync all models
      await this.sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
      
      return true;
    } catch (error) {
      console.error('❌ Unable to connect to MySQL database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    try {
      await this.sequelize.close();
      console.log('📴 Database connection closed.');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  // ==================== GUILD METHODS ====================

  /**
   * Add or update guild
   */
  async addGuild(guildData) {
    try {
      const [guild, created] = await this.Guild.upsert({
        id: guildData.guildId,
        name: guildData.name,
        icon: guildData.icon,
        member_count: guildData.memberCount,
        owner_id: guildData.ownerId,
        joined_at: guildData.joinedAt || new Date()
      });

      console.log(`${created ? 'Added' : 'Updated'} guild: ${guildData.name}`);
      return guild;
    } catch (error) {
      console.error('Error adding guild:', error);
      throw error;
    }
  }

  /**
   * Upsert guild (for bot compatibility)
   */
  async upsertGuild(guildData) {
    try {
      const [guild, created] = await this.Guild.upsert({
        id: guildData.discord_id,
        name: guildData.name,
        icon: guildData.icon,
        member_count: guildData.member_count,
        owner_id: guildData.owner_id,
        joined_at: guildData.created_at || new Date(),
        description: guildData.description
      });

      console.log(`${created ? 'Added' : 'Updated'} guild: ${guildData.name}`);
      return guild;
    } catch (error) {
      console.error('Error upserting guild:', error);
      throw error;
    }
  }

  /**
   * Get guild by ID
   */
  async getGuild(guildId) {
    try {
      return await this.Guild.findByPk(guildId, {
        include: [
          {
            model: this.User,
            as: 'members',
            through: { attributes: ['guild_score', 'joined_at', 'is_active'] }
          }
        ]
      });
    } catch (error) {
      console.error('Error getting guild:', error);
      throw error;
    }
  }

  /**
   * Update guild metrics
   */
  async updateGuildMetrics(guildId, analysis) {
    try {
      const updates = {
        health_score: analysis.healthScore,
        activity_level: analysis.engagementLevel,
        toxicity_level: analysis.avgToxicity,
        engagement_score: analysis.engagementScore,
        sentiment_score: analysis.sentiment_score,
        last_analyzed: new Date()
      };

      await this.Guild.update(updates, {
        where: { id: guildId }
      });

      console.log(`Updated metrics for guild ${guildId}`);
    } catch (error) {
      console.error('Error updating guild metrics:', error);
      throw error;
    }
  }

  /**
   * Get all guilds (for bot)
   */
  async getAllGuilds() {
    try {
      return await this.Guild.findAll({
        where: { is_active: true }
      });
    } catch (error) {
      console.error('Error getting all guilds:', error);
      throw error;
    }
  }

  /**
   * Update guild health (for bot)
   */
  async updateGuildHealth(guildId, healthData) {
    try {
      const updates = {
        health_score: healthData.health_score,
        sentiment_score: healthData.sentiment_score,
        toxicity_level: healthData.toxicity_level,
        engagement_score: healthData.engagement_score,
        last_analyzed: healthData.last_analyzed || new Date()
      };

      // Add optional fields if they exist
      if (healthData.health_indicators) updates.health_indicators = healthData.health_indicators;
      if (healthData.health_concerns) updates.health_concerns = healthData.health_concerns;
      if (healthData.health_recommendations) updates.health_recommendations = healthData.health_recommendations;

      await this.Guild.update(updates, {
        where: { id: guildId }
      });

      console.log(`Updated health for guild ${guildId}`);
    } catch (error) {
      console.error('Error updating guild health:', error);
      throw error;
    }
  }

  // ==================== USER METHODS ====================

  /**
   * Sanitize text fields to handle emoji and special characters
   */
  sanitizeText(text) {
    if (!text) return null;
    
    try {
      // Очень агрессивная очистка - оставляем только безопасные символы
      let sanitized = String(text)
        .replace(/\0/g, '') // Remove null bytes
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        // Оставляем только латиницу, цифры, пробелы и базовую пунктуацию
        .replace(/[^a-zA-Z0-9\s\-_.!?,:;]/g, '')
        .trim();
      
      // Limit length to prevent database issues
      if (sanitized.length > 32) {
        sanitized = sanitized.substring(0, 32);
      }
      
      return sanitized || null;
    } catch (error) {
      console.warn('Failed to sanitize text:', text, error);
      // Complete fallback - только alphanumeric
      try {
        return String(text)
          .replace(/[^a-zA-Z0-9]/g, '')
          .trim()
          .substring(0, 32) || null;
      } catch (fallbackError) {
        console.error('Complete sanitization failure:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Add or update user
   */
  async addUser(userData) {
    try {
      const [user, created] = await this.User.upsert({
        id: userData.userId,
        username: this.sanitizeText(userData.username),
        discriminator: userData.discriminator,
        global_name: this.sanitizeText(userData.globalName),
        avatar: userData.avatar,
        first_seen: userData.joinedAt || new Date()
      });

      // Add to guild if specified
      if (userData.guildId) {
        await this.addGuildMember({
          guildId: userData.guildId,
          userId: userData.userId,
          joinedAt: userData.joinedAt
        });
      }

      console.log(`${created ? 'Added' : 'Updated'} user: ${this.sanitizeText(userData.username)}`);
      return user;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  /**
   * Upsert user (for bot compatibility)
   */
  async upsertUser(userData) {
    try {
      const [user, created] = await this.User.upsert({
        id: userData.discord_id,
        username: this.sanitizeText(userData.username),
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        bot: userData.bot || false,
        first_seen: userData.created_at || new Date()
      });

      console.log(`${created ? 'Added' : 'Updated'} user: ${this.sanitizeText(userData.username)}`);
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with guild data
   */
  async getUser(userId, guildId = null) {
    try {
      const include = [];
      
      if (guildId) {
        include.push({
          model: this.GuildMember,
          where: { guild_id: guildId },
          required: false
        });
      }

      return await this.User.findByPk(userId, { include });
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Update user metrics
   */
  async updateUserMetrics(userId, analysis) {
    try {
      const updates = {
        overall_score: analysis.qualityScore,
        toxicity_score: analysis.toxicity,
        helpfulness_score: analysis.constructiveness,
        engagement_score: analysis.engagementPotential,
        ai_detection_score: analysis.aiLikelihood,
        last_seen: new Date(),
        last_analyzed: new Date()
      };

      // Update global user metrics
      await this.User.increment('total_messages', {
        where: { id: userId }
      });

      await this.User.update(updates, {
        where: { id: userId }
      });

      console.log(`Updated metrics for user ${userId}`);
    } catch (error) {
      console.error('Error updating user metrics:', error);
      throw error;
    }
  }

  // ==================== GUILD MEMBER METHODS ====================

  /**
   * Add guild member
   */
  async addGuildMember(memberData) {
    try {
      const [member, created] = await this.GuildMember.upsert({
        guild_id: memberData.guildId,
        user_id: memberData.userId,
        nickname: this.sanitizeText(memberData.nickname),
        roles: memberData.roles,
        joined_at: memberData.joinedAt || new Date()
      });

      return member;
    } catch (error) {
      console.error('Error adding guild member:', error);
      throw error;
    }
  }

  /**
   * Upsert guild member (for bot compatibility)
   */
  async upsertGuildMember(memberData) {
    try {
      const [guildMember, created] = await this.GuildMember.upsert({
        guild_id: memberData.guild_id,
        user_id: memberData.user_id,
        nickname: this.sanitizeText(memberData.nickname),
        joined_at: memberData.joined_at || new Date(),
        roles: memberData.roles,
        permissions: memberData.permissions
      });

      console.log(`${created ? 'Added' : 'Updated'} guild member`);
      return guildMember;
    } catch (error) {
      console.error('Error upserting guild member:', error);
      throw error;
    }
  }

  /**
   * Update guild member metrics
   */
  async updateGuildMemberMetrics(guildId, userId, analysis) {
    try {
      await this.GuildMember.increment('messages_in_guild', {
        where: { 
          guild_id: guildId,
          user_id: userId 
        }
      });

      await this.GuildMember.update({
        guild_score: analysis.qualityScore,
        contribution_score: analysis.constructiveness,
        last_message_at: new Date(),
        last_analyzed: new Date()
      }, {
        where: { 
          guild_id: guildId,
          user_id: userId 
        }
      });
    } catch (error) {
      console.error('Error updating guild member metrics:', error);
      throw error;
    }
  }

  // ==================== MESSAGE METHODS ====================

  /**
   * Save message
   */
  async saveMessage(messageData) {
    try {
      const message = await this.Message.create({
        id: messageData.messageId || Date.now(),
        guild_id: messageData.guildId,
        channel_id: messageData.channelId,
        user_id: messageData.userId,
        content: messageData.content,
        content_length: messageData.content?.length || 0,
        word_count: messageData.content?.split(' ').length || 0,
        has_attachments: messageData.hasAttachments || false,
        has_embeds: messageData.hasEmbeds || false,
        mention_count: messageData.mentions || 0,
        reply_to_id: messageData.replyToId,
        sent_at: messageData.timestamp || new Date()
      });

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Create message (for bot compatibility)
   */
  async createMessage(messageData) {
    try {
      const [message, created] = await this.Message.upsert({
        id: messageData.discord_id,
        guild_id: messageData.guild_id,
        channel_id: messageData.channel_id,
        user_id: messageData.user_id,
        content: messageData.content,
        content_length: messageData.content?.length || 0,
        word_count: messageData.content?.split(' ').length || 0,
        sent_at: messageData.created_at || new Date(),
        message_type: messageData.message_type
      }, { returning: true });

      // Если запись была новой – обновляем агрегаты
      if (created) {
        try {
          await this.User.increment('total_messages', {
            by: 1,
            where: { id: messageData.user_id }
          });

          await this.Guild.increment(['total_messages', 'daily_messages', 'weekly_messages'], {
            by: 1,
            where: { id: messageData.guild_id }
          });

          const gm = await this.GuildMember.findOne({
            where: { guild_id: messageData.guild_id, user_id: messageData.user_id }
          });

          if (gm) {
            const newMsgCount = (gm.messages_in_guild || 0) + 1;
            const newGuildScore = Math.min(1, newMsgCount / 100);

            await gm.update({
              messages_in_guild: newMsgCount,
              daily_messages: (gm.daily_messages || 0) + 1,
              weekly_messages: (gm.weekly_messages || 0) + 1,
              last_message_at: new Date(),
              guild_score: newGuildScore
            });
          }
        } catch (counterErr) {
          console.error('Error updating counters after message upsert:', counterErr);
        }
      }

      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Update message with AI analysis
   */
  async updateMessageAnalysis(messageId, analysis) {
    try {
      await this.Message.update({
        sentiment_score: analysis.sentiment_score,
        sentiment_confidence: analysis.sentiment_confidence,
        toxicity_score: analysis.toxicity_level,
        toxicity_categories: analysis.toxicity_categories,
        engagement_score: analysis.engagement_score,
        engagement_type: analysis.engagement_type,
        analyzed_at: analysis.ai_analysis_timestamp || new Date()
      }, {
        where: { id: messageId }
      });
    } catch (error) {
      console.error('Error updating message analysis:', error);
      throw error;
    }
  }

  /**
   * Get recent messages for guild (for bot)
   */
  async getRecentMessages(guildId, limit = 50) {
    try {
      const messages = await this.Message.findAll({
        where: { 
          guild_id: guildId,
          sent_at: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: [
          {
            model: this.User,
            attributes: ['username']
          }
        ],
        order: [['sent_at', 'DESC']],
        limit
      });

      // Transform for analysis
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        author: msg.User?.username || 'Unknown'
      }));
    } catch (error) {
      console.error('Error getting recent messages:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS METHODS ====================

  /**
   * Get guild leaderboard
   */
  async getGuildLeaderboard(limit = 10) {
    try {
      return await this.Guild.findAll({
        order: [['health_score', 'DESC']],
        limit,
        include: [
          {
            model: this.User,
            as: 'members',
            through: { 
              attributes: [],
              where: { is_active: true }
            },
            attributes: []
          }
        ],
        attributes: {
          include: [
            [this.sequelize.fn('COUNT', this.sequelize.col('members.id')), 'active_members']
          ]
        },
        group: ['Guild.id'],
        subQuery: false
      });
    } catch (error) {
      console.error('Error getting guild leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user leaderboard for guild
   */
  async getUserLeaderboard(guildId, limit = 10) {
    try {
      return await this.GuildMember.findAll({
        where: { 
          guild_id: guildId,
          is_active: true 
        },
        include: [
          {
            model: this.User,
            attributes: ['username', 'avatar', 'overall_score']
          }
        ],
        order: [['guild_score', 'DESC']],
        limit
      });
    } catch (error) {
      console.error('Error getting user leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get guild statistics
   */
  async getGuildStats(guildId, timeframe = '7d') {
    try {
      const timeMap = {
        '1d': 1,
        '7d': 7,
        '30d': 30
      };
      
      const daysAgo = timeMap[timeframe] || 7;
      const startDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

      const [msgStats] = await this.Message.findAll({
        where: {
          guild_id: guildId,
          sent_at: { [Op.gte]: startDate }
        },
        attributes: [
          [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'total_messages'],
          [this.sequelize.fn('COUNT', this.sequelize.fn('DISTINCT', this.sequelize.col('user_id'))), 'active_users'],
          [this.sequelize.fn('AVG', this.sequelize.col('sentiment_score')), 'avg_sentiment'],
          [this.sequelize.fn('AVG', this.sequelize.col('toxicity_score')), 'avg_toxicity'],
          [this.sequelize.fn('AVG', this.sequelize.col('ai_likelihood')), 'avg_ai_likelihood']
        ],
        raw: true
      });

      // New members joined within timeframe
      const newMembers = await this.GuildMember.count({
        where: {
          guild_id: guildId,
          joined_at: { [Op.gte]: startDate }
        }
      });

      // Get total member count to calculate engagement rate
      const guild = await this.Guild.findByPk(guildId, {
        attributes: ['member_count']
      });

      const dailyMessages = parseInt(msgStats.total_messages || 0);
      const activeUsers = parseInt(msgStats.active_users || 0);

      return {
        dailyMessages,
        activeUsers,
        newMembers,
        engagementRate: guild && guild.member_count ? (activeUsers / guild.member_count) : 0,
        avgSentiment: parseFloat(msgStats.avg_sentiment || 0),
        avgToxicity: parseFloat(msgStats.avg_toxicity || 0),
        avgAiLikelihood: parseFloat(msgStats.avg_ai_likelihood || 0)
      };
    } catch (error) {
      console.error('Error getting guild stats:', error);
      throw error;
    }
  }

  // ==================== REACTION METHODS ====================

  /**
   * Save reaction
   */
  async saveReaction(reactionData) {
    try {
      // Update message reaction count
      await this.Message.increment('reaction_count', {
        where: { id: reactionData.messageId }
      });

      // Update user stats
      await this.User.increment('total_reactions_given', {
        where: { id: reactionData.userId }
      });

      // Update guild member stats
      if (reactionData.guildId) {
        await this.GuildMember.increment('reactions_given_in_guild', {
          where: { 
            guild_id: reactionData.guildId,
            user_id: reactionData.userId 
          }
        });
      }

      console.log(`Saved reaction from user ${reactionData.userId}`);
    } catch (error) {
      console.error('Error saving reaction:', error);
      throw error;
    }
  }

  // ==================== FRONTEND API METHODS ====================

  /**
   * Get public servers for frontend
   */
  async getPublicServers(options = {}) {
    try {
      const { page = 1, limit = 20, sortBy = 'health_score' } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await this.Guild.findAndCountAll({
        where: { 
          is_active: true,
          is_public: true // Show only public servers
        },
        attributes: [
          'id', 'name', 'icon', 'member_count', 'health_score', 
          'activity_level', 'toxicity_level', 'engagement_score',
          'total_messages', 'daily_messages', 'joined_at'
        ],
        order: [[sortBy, 'DESC']],
        limit,
        offset
      });

      return {
        servers: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error getting public servers:', error);
      throw error;
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    try {
      const [guildStats, userStats, messageStats] = await Promise.all([
        this.Guild.findAll({
          attributes: [
            [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'total_guilds'],
            [this.sequelize.fn('SUM', this.sequelize.col('member_count')), 'total_members'],
            [this.sequelize.fn('AVG', this.sequelize.col('health_score')), 'avg_health'],
            [this.sequelize.fn('AVG', this.sequelize.col('toxicity_level')), 'avg_toxicity']
          ],
          where: { is_active: true },
          raw: true
        }),

        this.User.findAll({
          attributes: [
            [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'total_users'],
            [this.sequelize.fn('AVG', this.sequelize.col('overall_score')), 'avg_user_score'],
            [this.sequelize.fn('COUNT', this.sequelize.literal('CASE WHEN is_flagged = true THEN 1 END')), 'flagged_users']
          ],
          raw: true
        }),

        this.Message.findAll({
          attributes: [
            [this.sequelize.fn('COUNT', this.sequelize.col('id')), 'total_messages'],
            [this.sequelize.fn('AVG', this.sequelize.col('sentiment_score')), 'avg_sentiment'],
            [this.sequelize.fn('AVG', this.sequelize.col('ai_likelihood')), 'avg_ai_detection']
          ],
          where: {
            sent_at: { 
              [Op.gte]: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) // Last 30 days
            }
          },
          raw: true
        })
      ]);

      return {
        totalGuilds: parseInt(guildStats[0]?.total_guilds || 0),
        totalMembers: parseInt(guildStats[0]?.total_members || 0),
        totalUsers: parseInt(userStats[0]?.total_users || 0),
        totalMessages: parseInt(messageStats[0]?.total_messages || 0),
        avgHealthScore: parseFloat(guildStats[0]?.avg_health || 0).toFixed(2),
        avgToxicity: parseFloat(guildStats[0]?.avg_toxicity || 0).toFixed(2),
        avgUserScore: parseFloat(userStats[0]?.avg_user_score || 0).toFixed(2),
        avgSentiment: parseFloat(messageStats[0]?.avg_sentiment || 0).toFixed(2),
        avgAiDetection: parseFloat(messageStats[0]?.avg_ai_detection || 0).toFixed(3),
        flaggedUsers: parseInt(userStats[0]?.flagged_users || 0),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      throw error;
    }
  }

  /**
   * Get trending servers
   */
  async getTrendingServers(limit = 10, period = '24h') {
    try {
      const timeMap = { '24h': 1, '7d': 7, '30d': 30 };
      const daysAgo = timeMap[period] || 1;
      const startDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

      return await this.Guild.findAll({
        where: { 
          is_active: true,
          last_analyzed: { [Op.gte]: startDate }
        },
        attributes: [
          'id', 'name', 'icon', 'member_count', 'health_score',
          'activity_level', 'daily_messages', 'engagement_score'
        ],
        order: [
          ['daily_messages', 'DESC'],
          ['engagement_score', 'DESC']
        ],
        limit
      });
    } catch (error) {
      console.error('Error getting trending servers:', error);
      throw error;
    }
  }

  /**
   * Search users by username
   */
  async searchUsers(username, guildId = null) {
    try {
      const where = {
        username: { [Op.like]: `%${username}%` }
      };

      const include = [];
      if (guildId) {
        include.push({
          model: this.GuildMember,
          where: { 
            guild_id: guildId,
            is_active: true 
          },
          required: true
        });
      }

      return await this.User.findAll({
        where,
        include,
        attributes: [
          'id', 'username', 'global_name', 'avatar', 
          'overall_score', 'total_messages', 'last_seen'
        ],
        limit: 20,
        order: [['total_messages', 'DESC']]
      });
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get server analysis
   */
  async getServerAnalysis(guildId) {
    try {
      const guild = await this.Guild.findByPk(guildId);
      if (!guild) return null;

      const recentStats = await this.getGuildStats(guildId, '7d');
      
      return {
        healthScore: guild.health_score,
        activityLevel: guild.activity_level,
        toxicityLevel: guild.toxicity_level,
        engagementScore: guild.engagement_score,
        sentimentScore: guild.sentiment_score,
        totalMessages: guild.total_messages,
        dailyMessages: guild.daily_messages,
        recentStats,
        lastAnalyzed: guild.last_analyzed
      };
    } catch (error) {
      console.error('Error getting server analysis:', error);
      throw error;
    }
  }

  /**
   * Get user analysis
   */
  async getUserAnalysis(userId, guildId = null) {
    try {
      const user = await this.User.findByPk(userId);
      if (!user) return null;

      const include = [];
      if (guildId) {
        include.push({
          model: this.GuildMember,
          where: { guild_id: guildId }
        });
      }

      return {
        overallScore: user.overall_score,
        toxicityScore: user.toxicity_score,
        helpfulnessScore: user.helpfulness_score,
        engagementScore: user.engagement_score,
        aiDetectionScore: user.ai_detection_score,
        totalMessages: user.total_messages,
        lastAnalyzed: user.last_analyzed
      };
    } catch (error) {
      console.error('Error getting user analysis:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userId, guildId = null) {
    try {
      const where = { user_id: userId };
      if (guildId) where.guild_id = guildId;

      const recentMessages = await this.Message.count({
        where: {
          ...where,
          sent_at: { 
            [Op.gte]: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) 
          }
        }
      });

      const avgScores = await this.Message.findAll({
        where,
        attributes: [
          [this.sequelize.fn('AVG', this.sequelize.col('sentiment_score')), 'avg_sentiment'],
          [this.sequelize.fn('AVG', this.sequelize.col('toxicity_score')), 'avg_toxicity'],
          [this.sequelize.fn('AVG', this.sequelize.col('quality_score')), 'avg_quality']
        ],
        raw: true
      });

      return {
        recentMessages,
        avgSentiment: parseFloat(avgScores[0]?.avg_sentiment || 0).toFixed(2),
        avgToxicity: parseFloat(avgScores[0]?.avg_toxicity || 0).toFixed(2),
        avgQuality: parseFloat(avgScores[0]?.avg_quality || 0).toFixed(2)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard for a specific guild
   */
  async getLeaderboard(guildId, type = 'overall', limit = 50) {
    try {
      // Просто перенаправляем на getUserLeaderboard
      return await this.getUserLeaderboard(guildId, limit);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get top guilds leaderboard
   */
} 