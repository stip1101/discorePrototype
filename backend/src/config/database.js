import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'uk03-sql.pebblehost.com',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'customer_734032_discoreprototype',
  password: process.env.DB_PASSWORD || 'quhshz9@ksqgfwBoI8tmhA!J',
  database: process.env.DB_NAME || 'customer_734032_discoreprototype',
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  timezone: '+00:00'
});

export default sequelize; 