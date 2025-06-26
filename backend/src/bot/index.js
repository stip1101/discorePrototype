import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { config } from 'dotenv';
import { AnalysisService } from '../services/analysisService.js';
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
      ]
    });

    this.analysisService = new AnalysisService();
    this.databaseService = new DatabaseService();
    this.commands = new Collection();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.client.once(Events.ClientReady, this.onReady.bind(this));
    this.client.on(Events.GuildCreate, this.onGuildJoin.bind(this));
    this.client.on(Events.MessageCreate, this.onMessage.bind(this));
    this.client.on(Events.InteractionCreate, this.onInteraction.bind(this));
    this.client.on(Events.GuildMemberAdd, this.onMemberJoin.bind(this));
    this.client.on(Events.MessageReactionAdd, this.onReactionAdd.bind(this));
  }

  async onReady(readyClient) {
    console.log(`✅ Discore Bot готов! Авторизован как ${readyClient.user.tag}`);
    console.log(`📊 Мониторинг ${readyClient.guilds.cache.size} серверов`);
    
    // Устанавливаем статус бота
    this.client.user.setActivity('AI анализ серверов | /analyze', { 
      type: 'WATCHING' 
    });

    // Синхронизируем существующие сервера с БД
    await this.syncGuildsWithDatabase();
  }

  async onGuildJoin(guild) {
    console.log(`🎉 Добавлен на новый сервер: ${guild.name} (${guild.id})`);
    
    // Сохраняем сервер в БД
    await this.databaseService.addGuild({
      guildId: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      joinedAt: new Date(),
      ownerId: guild.ownerId
    });

    // Отправляем приветственное сообщение
    const channel = guild.systemChannel || guild.channels.cache
      .filter(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('SendMessages'))
      .first();

    if (channel) {
      await channel.send({
        embeds: [{
          title: '🤖 Добро пожаловать в Discore!',
          description: `Привет! Я Discore - AI-бот для анализа активности сервера.
          
          **Что я умею:**
          • 📊 Анализ активности пользователей
          • 🎯 Определение токсичности сообщений  
          • 📈 Статистика сервера в реальном времени
          • 🏆 Рейтинги и лидерборды
          
          **Начать работу:** \`/analyze setup\``,
          color: 0x5865F2,
          footer: { text: 'Discore AI • discore.com' }
        }]
      });
    }
  }

  async onMessage(message) {
    if (message.author.bot) return;
    
    // Собираем данные для анализа
    const messageData = {
      guildId: message.guild?.id,
      channelId: message.channel.id,
      userId: message.author.id,
      content: message.content,
      timestamp: message.createdAt,
      hasAttachments: message.attachments.size > 0,
      replyToId: message.reference?.messageId,
      mentions: message.mentions.users.size
    };

    // Асинхронно обрабатываем сообщение
    this.processMessage(messageData).catch(console.error);
  }

  async processMessage(messageData) {
    // Сохраняем в БД
    await this.databaseService.saveMessage(messageData);
    
    // Анализируем через Gemini
    const analysis = await this.analysisService.analyzeMessage(messageData);
    
    // Обновляем метрики пользователя
    await this.databaseService.updateUserMetrics(messageData.userId, analysis);
    
    // Обновляем метрики сервера
    await this.databaseService.updateGuildMetrics(messageData.guildId, analysis);
  }

  async onInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Ошибка выполнения команды:', error);
      
      const errorResponse = {
        content: '❌ Произошла ошибка при выполнении команды.',
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorResponse);
      } else {
        await interaction.reply(errorResponse);
      }
    }
  }

  async onMemberJoin(member) {
    await this.databaseService.addUser({
      userId: member.id,
      guildId: member.guild.id,
      username: member.user.username,
      joinedAt: member.joinedAt
    });
  }

  async onReactionAdd(reaction, user) {
    if (user.bot) return;
    
    await this.databaseService.saveReaction({
      userId: user.id,
      guildId: reaction.message.guild?.id,
      messageId: reaction.message.id,
      emoji: reaction.emoji.name,
      timestamp: new Date()
    });
  }

  async syncGuildsWithDatabase() {
    for (const guild of this.client.guilds.cache.values()) {
      await this.databaseService.addGuild({
        guildId: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        ownerId: guild.ownerId
      });
    }
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('Ошибка авторизации бота:', error);
      process.exit(1);
    }
  }
}

export { DiscoreBot }; 