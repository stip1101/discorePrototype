import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Guild = sequelize.define('Guild', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    comment: 'Discord Guild ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Guild name'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Guild icon URL'
  },
  member_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total member count'
  },
  owner_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'Guild owner Discord ID'
  },
  
  // Analysis metrics
  health_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Overall health score (0-1)'
  },
  activity_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
    defaultValue: 'medium',
    comment: 'Activity level classification'
  },
  toxicity_level: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
    comment: 'Average toxicity level (0-1)'
  },
  engagement_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Engagement score (0-1)'
  },
  
  // Message stats
  total_messages: {
    type: DataTypes.BIGINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Total messages sent'
  },
  daily_messages: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Messages in last 24h'
  },
  weekly_messages: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Messages in last 7 days'
  },
  
  // Timestamps
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When bot joined the guild'
  },
  last_analyzed: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last analysis timestamp'
  },
  
  // Status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether guild is active'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether guild is public for stats display'
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Premium features enabled'
  }
}, {
  tableName: 'guilds',
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['health_score'] },
    { fields: ['activity_level'] },
    { fields: ['is_active'] },
    { fields: ['last_analyzed'] }
  ]
});

export default Guild; 