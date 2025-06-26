import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const GuildMember = sequelize.define('GuildMember', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
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
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'Discord User ID',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Member info
  nickname: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: 'Guild-specific nickname'
  },
  roles: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of role IDs'
  },
  
  // Guild-specific scores
  guild_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Score specific to this guild (0-1)'
  },
  contribution_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.5,
    comment: 'Contribution to guild community (0-1)'
  },
  
  // Guild-specific stats
  messages_in_guild: {
    type: DataTypes.BIGINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Messages sent in this guild'
  },
  reactions_given_in_guild: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Reactions given in this guild'
  },
  reactions_received_in_guild: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Reactions received in this guild'
  },
  mentions_in_guild: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: 'Times mentioned in this guild'
  },
  
  // Activity tracking
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last message in this guild'
  },
  daily_messages: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Messages today'
  },
  weekly_messages: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0,
    comment: 'Messages this week'
  },
  
  // Member status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Still in guild'
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Banned from guild'
  },
  is_muted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Currently muted'
  },
  
  // Timestamps
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'When user joined guild'
  },
  left_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When user left guild'
  },
  last_analyzed: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last analysis for this guild'
  }
}, {
  tableName: 'guild_members',
  indexes: [
    { 
      fields: ['guild_id', 'user_id'], 
      unique: true,
      name: 'unique_guild_user'
    },
    { fields: ['guild_id'] },
    { fields: ['user_id'] },
    { fields: ['guild_score'] },
    { fields: ['is_active'] },
    { fields: ['last_message_at'] },
    { fields: ['joined_at'] }
  ]
});

export default GuildMember; 