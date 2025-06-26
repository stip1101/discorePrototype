import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    comment: 'Discord User ID'
  },
  username: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: 'Discord username',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  discriminator: {
    type: DataTypes.STRING(4),
    allowNull: true,
    comment: 'Discord discriminator (legacy)'
  },
  global_name: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: 'Discord global display name',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Avatar URL'
  },
  
  // Analysis metrics
  overall_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Overall user score (0-1)'
  },
  toxicity_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Average toxicity (0-1)'
  },
  helpfulness_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Helpfulness score (0-1)'
  },
  engagement_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Engagement score (0-1)'
  },
  
  // AI Detection
  ai_detection_score: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: true,
    defaultValue: 0,
    comment: 'AI-generated content probability (0-1)'
  },
  ai_messages_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Number of AI-detected messages'
  },
  
  // Activity stats
  total_messages: {
    type: DataTypes.BIGINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Total messages sent'
  },
  total_reactions_given: {
    type: DataTypes.BIGINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Total reactions given'
  },
  total_reactions_received: {
    type: DataTypes.BIGINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Total reactions received'
  },
  total_mentions: {
    type: DataTypes.BIGINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Total times mentioned'
  },
  
  // Language analysis
  primary_language: {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: 'Primary language code (e.g., en, ru)'
  },
  language_confidence: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Language detection confidence'
  },
  
  // Behavioral patterns
  activity_pattern: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Hourly activity pattern (0-23)'
  },
  emoji_usage: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Most used emojis'
  },
  
  // Moderation
  warning_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Number of warnings received'
  },
  ban_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Number of bans across servers'
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flagged for review'
  },
  
  // Timestamps
  first_seen: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'First interaction with bot'
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last activity timestamp'
  },
  last_analyzed: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last analysis timestamp'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['username'] },
    { fields: ['overall_score'] },
    { fields: ['toxicity_score'] },
    { fields: ['ai_detection_score'] },
    { fields: ['primary_language'] },
    { fields: ['is_flagged'] },
    { fields: ['last_seen'] },
    { fields: ['last_analyzed'] }
  ]
});

export default User; 