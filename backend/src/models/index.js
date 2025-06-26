import sequelize from '../config/database.js';
import User from './User.js';
import Guild from './Guild.js';
import Message from './Message.js';
import GuildMember from './GuildMember.js';

// Define associations
User.hasMany(Message, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Message.belongsTo(User, { foreignKey: 'user_id' });

Guild.hasMany(Message, { foreignKey: 'guild_id', onDelete: 'CASCADE' });
Message.belongsTo(Guild, { foreignKey: 'guild_id' });

User.belongsToMany(Guild, { 
  through: GuildMember, 
  foreignKey: 'user_id',
  otherKey: 'guild_id',
  as: 'guilds'
});

Guild.belongsToMany(User, { 
  through: GuildMember, 
  foreignKey: 'guild_id',
  otherKey: 'user_id',
  as: 'members'
});

User.hasMany(GuildMember, { foreignKey: 'user_id', onDelete: 'CASCADE' });
GuildMember.belongsTo(User, { foreignKey: 'user_id' });

Guild.hasMany(GuildMember, { foreignKey: 'guild_id', onDelete: 'CASCADE' });
GuildMember.belongsTo(Guild, { foreignKey: 'guild_id' });

// Self-reference for message replies
Message.belongsTo(Message, { 
  foreignKey: 'reply_to_id', 
  as: 'replyTo' 
});
Message.hasMany(Message, { 
  foreignKey: 'reply_to_id', 
  as: 'replies' 
});

export {
  sequelize,
  User,
  Guild,
  Message,
  GuildMember
};

export default {
  sequelize,
  User,
  Guild,
  Message,
  GuildMember
}; 