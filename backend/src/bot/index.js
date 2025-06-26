import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import { config } from 'dotenv';
import { getAnalysisService } from '../services/analysisService.js';
import { DatabaseService } from '../services/databaseService.js';

config();

class DiscoreBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildMember
      ]
    });

    this.databaseService = new DatabaseService();
    this.setupEventListeners();
    this.messageQueue = [];
    this.analysisInProgress = false;
    
    // Start periodic analysis every hour
    this.startPeriodicAnalysis();
  }

  setupEventListeners() {
    this.client.once('ready', () => {
      console.log(`✅ Discord bot logged in as ${this.client.user.tag}`);
      this.syncAllGuilds();
    });

    this.client.on('guildCreate', async (guild) => {
      console.log(`➕ Bot added to new guild: ${guild.name}`);
      await this.syncGuild(guild);
    });

    this.client.on('guildMemberAdd', async (member) => {
      await this.syncGuildMember(member);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      
      // Add message to queue for analysis
      this.messageQueue.push({
        id: message.id,
        content: message.content,
        guildId: message.guild.id,
        authorId: message.author.id,
        timestamp: new Date()
      });

      // Save message to database
      await this.saveMessage(message);

      // Process queue if it gets too large
      if (this.messageQueue.length >= 10 && !this.analysisInProgress) {
        this.processMessageQueue();
      }
    });

    this.client.on('error', console.error);
  }

  async syncAllGuilds() {
    console.log('🔄 Starting guild synchronization...');
    
    for (const guild of this.client.guilds.cache.values()) {
      await this.syncGuild(guild);
    }
    
    console.log('✅ Guild synchronization completed');
  }

  async syncGuild(guild) {
    try {
      // Save/update guild in database
      await this.databaseService.upsertGuild({
        discord_id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        member_count: guild.memberCount,
        owner_id: guild.ownerId,
        created_at: guild.createdAt,
        description: guild.description || null
      });

      // Sync guild members
      const members = await guild.members.fetch();
      console.log(`👥 Syncing ${members.size} members for ${guild.name}`);
      
      for (const member of members.values()) {
        await this.syncGuildMember(member);
      }

      // Collect recent messages (last 24h) from all text channels
      await this.collectRecentMessages(guild);

      console.log(`✅ Synced guild: ${guild.name} (${guild.memberCount} members)`);
    } catch (error) {
      console.error(`❌ Error syncing guild ${guild.name}:`, error);
    }
  }

  async syncGuildMember(member) {
    try {
      // Save/update user
      await this.databaseService.upsertUser({
        discord_id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator,
        avatar: member.user.displayAvatarURL(),
        bot: member.user.bot,
        created_at: member.user.createdAt
      });

      // Save/update guild member relationship
      await this.databaseService.upsertGuildMember({
        guild_id: member.guild.id,
        user_id: member.user.id,
        nickname: member.nickname,
        joined_at: member.joinedAt,
        roles: member.roles.cache.map(r => r.name).join(','),
        permissions: member.permissions.toArray().join(',')
      });

    } catch (error) {
      console.error(`❌ Error syncing member ${member.user.username}:`, error);
    }
  }

  async saveMessage(message) {
    try {
      await this.databaseService.createMessage({
        discord_id: message.id,
        guild_id: message.guild.id,
        user_id: message.author.id,
        channel_id: message.channel.id,
        content: message.content,
        created_at: message.createdAt,
        edited_at: message.editedAt,
        message_type: message.type
      });
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  }

  async processMessageQueue() {
    if (this.analysisInProgress || this.messageQueue.length === 0) return;

    this.analysisInProgress = true;
    console.log(`🤖 Starting OpenAI analysis of ${this.messageQueue.length} messages...`);

    try {
      const messages = [...this.messageQueue];
      this.messageQueue = []; // Clear queue

      // Analyze messages with OpenAI
      const analysisService = getAnalysisService();
      const analysisResults = await analysisService.analyzeMessagesBatch(messages);
      
      console.log(`✅ Analyzed ${analysisResults.length} messages with OpenAI`);

      // Update database with analysis results
      for (const result of analysisResults) {
        if (result.analysis) {
          await this.updateMessageAnalysis(result);
        }
      }

      // Update server health scores
      await this.updateServerHealthScores(analysisResults);

    } catch (error) {
      console.error('❌ Error processing message queue:', error);
    } finally {
      this.analysisInProgress = false;
    }
  }

  async updateMessageAnalysis(result) {
    try {
      const analysis = result.analysis;
      
      // Update message with analysis results
      await this.databaseService.updateMessageAnalysis(result.messageId, {
        sentiment_score: analysis.sentiment?.sentiment || 0,
        sentiment_confidence: analysis.sentiment?.confidence || 0,
        toxicity_level: analysis.toxicity?.toxicity || 0,
        toxicity_categories: analysis.toxicity?.categories?.join(',') || '',
        engagement_score: analysis.engagement?.engagement || 0,
        engagement_type: analysis.engagement?.type || 'general',
        ai_analysis_timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Error updating message analysis:', error);
    }
  }

  async updateServerHealthScores(analysisResults) {
    try {
      // Group results by guild
      const guildResults = {};
      
      analysisResults.forEach(result => {
        const guildId = result.guildId;
        if (!guildResults[guildId]) {
          guildResults[guildId] = [];
        }
        guildResults[guildId].push(result);
      });

      // Calculate and update health scores for each guild
      for (const [guildId, results] of Object.entries(guildResults)) {
        const healthMetrics = getAnalysisService().calculateServerHealth(results);
        
        const m = healthMetrics.metrics;
        await this.databaseService.updateGuildHealth(guildId, {
          health_score: healthMetrics.healthScore,
          sentiment_score: m.avgSentiment,
          toxicity_level: m.avgToxicity,
          engagement_score: m.avgEngagement,
          last_analyzed: new Date()
        });

        console.log(`📊 Updated health score for guild ${guildId}: ${(healthMetrics.healthScore * 100).toFixed(1)}%`);
      }

    } catch (error) {
      console.error('❌ Error updating server health scores:', error);
    }
  }

  startPeriodicAnalysis() {
    // Run analysis every hour
    setInterval(async () => {
      console.log('⏰ Starting periodic community health analysis...');
      
      try {
        // Get recent messages for each guild
        const guilds = await this.databaseService.getAllGuilds();
        
        for (const guild of guilds) {
          const recentMessages = await this.databaseService.getRecentMessages(guild.discord_id, 50);
          
          if (recentMessages.length > 0) {
            const healthAnalysis = await getAnalysisService().analyzeCommunityHealth(recentMessages);
            
            await this.databaseService.updateGuildHealth(guild.discord_id, {
              health_score: healthAnalysis.health_score,
              last_analyzed: new Date(),
              health_indicators: healthAnalysis.positive_indicators?.join(',') || '',
              health_concerns: healthAnalysis.concerns?.join(',') || '',
              health_recommendations: healthAnalysis.recommendations?.join(',') || ''
            });

            console.log(`📊 Updated periodic health analysis for ${guild.name}: ${(healthAnalysis.health_score * 100).toFixed(1)}%`);
          }
        }
        
      } catch (error) {
        console.error('❌ Error in periodic analysis:', error);
      }
    }, 60 * 60 * 1000); // Every hour
  }

  async start() {
    try {
      console.log('🚀 Starting Discord bot...');
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('❌ Failed to start Discord bot:', error);
      process.exit(1);
    }
  }

  async stop() {
    console.log('⏹️ Stopping Discord bot...');
    this.client.destroy();
  }

  /**
   * Fetch messages from the past 24 h for every text channel in guild
   * and store them to DB / queue for analysis.
   */
  async collectRecentMessages(guild) {
    const since = Date.now() - 24 * 60 * 60 * 1000;

    const textChannels = guild.channels.cache.filter(
      (ch) => ch.viewable && typeof ch.isTextBased === 'function' && ch.isTextBased()
    );

    for (const ch of textChannels.values()) {
      try {
        // fetch full channel if we only have a partial reference
        const channel = ch.partial ? await guild.channels.fetch(ch.id) : ch;

        if (!channel.isTextBased()) continue;

        const messages = await channel.messages.fetch({ limit: 100 });
        const recent = messages.filter(m => !m.author.bot && m.createdTimestamp >= since);

        for (const msg of recent.values()) {
          // Save to DB (skip duplicates thanks to PK on id)
          await this.saveMessage(msg);

          // Queue for AI analysis
          this.messageQueue.push({
            id: msg.id,
            content: msg.content,
            guildId: guild.id,
            authorId: msg.author.id,
            timestamp: new Date(msg.createdTimestamp)
          });
        }

        // Process queue in batches of 50 to avoid memory bloat
        if (this.messageQueue.length >= 50 && !this.analysisInProgress) {
          await this.processMessageQueue();
        }

      } catch (err) {
        console.warn(`Could not fetch messages for #${ch.name} in ${guild.name}:`, err?.message);
      }
    }

    // After iterating all channels, process remaining queued messages (if any)
    if (this.messageQueue.length > 0 && !this.analysisInProgress) {
      await this.processMessageQueue();
    }
  }
}

export default DiscoreBot; 