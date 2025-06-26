import sequelize from '../config/database.js';

async function migrate() {
  // database name from sequelize config
  const dbName = sequelize.config.database;

  const alterDbSQL = `ALTER DATABASE \`${dbName}\` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;`;
  const alterTableSQL = 'ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;';

  try {
    console.log('⏳ Running charset migration to utf8mb4 …');
    await sequelize.query(alterDbSQL);
    await sequelize.query(alterTableSQL);
    console.log('✅ Migration completed: database and messages table now utf8mb4');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

migrate(); 