import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    comment: 'Discord Message ID'
  },
  guild_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'Discord Guild ID',
    references: {
      model: 'guilds',
      key: 'id'
    }
  },
  channel_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'Discord Channel ID'
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'Discord User ID',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Message content
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'Message content (encrypted if needed)'
  },
  content_length: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: 'Character count'
  },
  word_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: 'Word count'
  },
  
  // Message metadata
  has_attachments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Has file attachments'
  },
  has_embeds: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Has embeds'
  },
  mention_count: {
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Number of user mentions'
  },
  reply_to_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'ID of message being replied to'
  },
  thread_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: 'Thread ID if in thread'
  },
  
  // AI Analysis results
  sentiment_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Sentiment analysis (-1 to 1)'
  },
  toxicity_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Toxicity probability (0-1)'
  },
  constructiveness_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Constructiveness score (0-1)'
  },
  ai_likelihood: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: true,
    comment: 'AI-generated probability (0-1)'
  },
  quality_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Overall message quality (0-1)'
  },
  engagement_potential: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Potential to drive engagement (0-1)'
  },
  
  // Classification
  activity_category: {
    type: DataTypes.ENUM(
      'discussion', 'question', 'announcement', 
      'casual', 'support', 'spam', 'other'
    ),
    allowNull: true,
    comment: 'Message category classification'
  },
  detected_language: {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: 'Detected language code'
  },
  language_confidence: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Language detection confidence'
  },
  
  // Emotions and topics
  emotions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detected emotions array'
  },
  topics: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Extracted topics array'
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Important keywords'
  },
  
  // Engagement metrics
  reaction_count: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Total reactions received'
  },
  reply_count: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Number of replies'
  },
  
  // Moderation
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Message was edited'
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Message was deleted'
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flagged for review'
  },
  moderation_action: {
    type: DataTypes.ENUM('none', 'warning', 'timeout', 'delete'),
    defaultValue: 'none',
    comment: 'Moderation action taken'
  },
  
  // Timestamps
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When message was sent'
  },
  analyzed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When AI analysis was completed'
  }
}, {
  tableName: 'messages',
  indexes: [
    { fields: ['guild_id'] },
    { fields: ['channel_id'] },
    { fields: ['user_id'] },
    { fields: ['sent_at'] },
    { fields: ['toxicity_score'] },
    { fields: ['ai_likelihood'] },
    { fields: ['activity_category'] },
    { fields: ['detected_language'] },
    { fields: ['is_flagged'] },
    { fields: ['is_deleted'] },
    { fields: ['reply_to_id'] },
    { fields: ['guild_id', 'sent_at'] },
    { fields: ['user_id', 'sent_at'] }
  ]
});

export default Message; 