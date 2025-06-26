#!/usr/bin/env node

/**
 * РАДИКАЛЬНАЯ ОЧИСТКА БАЗЫ ДАННЫХ
 * Удаляет ВСЕ кроме одного сервера пользователя
 */

import { DatabaseService } from './src/services/databaseService.js';

const KEEP_GUILD_ID = '1255091858087088169'; // Solus D&A

async function radicalCleanup() {
  console.log('💀 РАДИКАЛЬНАЯ ОЧИСТКА БАЗЫ ДАННЫХ...');
  
  const db = new DatabaseService();
  
  try {
    await db.connect();
    console.log('✅ Подключен к базе данных');

    // Отключаем проверку foreign keys временно
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. УДАЛЯЕМ ВСЕ СООБЩЕНИЯ
    console.log('🗑️  Удаляю ВСЕ сообщения...');
    const deletedMessages = await db.Message.destroy({ 
      where: {},
      force: true
    });
    console.log(`✅ Удалено ${deletedMessages} сообщений`);

    // 2. УДАЛЯЕМ ВСЕХ УЧАСТНИКОВ СЕРВЕРОВ
    console.log('🗑️  Удаляю ВСЕХ участников серверов...');
    const deletedGuildMembers = await db.GuildMember.destroy({ 
      where: {},
      force: true
    });
    console.log(`✅ Удалено ${deletedGuildMembers} записей участников`);

    // 3. УДАЛЯЕМ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
    console.log('🗑️  Удаляю ВСЕХ пользователей...');
    const deletedUsers = await db.User.destroy({ 
      where: {},
      force: true
    });
    console.log(`✅ Удалено ${deletedUsers} пользователей`);

    // 4. УДАЛЯЕМ ВСЕ СЕРВЕРЫ КРОМЕ НУЖНОГО
    console.log('🗑️  Удаляю ВСЕ серверы кроме Solus D&A...');
    const deletedGuilds = await db.Guild.destroy({
      where: {
        id: { [db.sequelize.Sequelize.Op.ne]: KEEP_GUILD_ID }
      },
      force: true
    });
    console.log(`✅ Удалено ${deletedGuilds} лишних серверов`);

    // Включаем обратно проверку foreign keys
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 5. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
    const finalStats = await Promise.all([
      db.Guild.count(),
      db.User.count(),
      db.GuildMember.count(),
      db.Message.count()
    ]);

    console.log('\n📊 РЕЗУЛЬТАТ РАДИКАЛЬНОЙ ОЧИСТКИ:');
    console.log(`   Серверов: ${finalStats[0]} (должен быть 1)`);
    console.log(`   Пользователей: ${finalStats[1]} (должно быть 0)`);
    console.log(`   Участников серверов: ${finalStats[2]} (должно быть 0)`);
    console.log(`   Сообщений: ${finalStats[3]} (должно быть 0)`);

    console.log('\n💀 РАДИКАЛЬНАЯ ОЧИСТКА ЗАВЕРШЕНА!');
    console.log('🤖 Теперь перезапусти бота чтобы он заново синхронизировал данные');
    
  } catch (error) {
    console.error('❌ Ошибка при радикальной очистке:', error);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

radicalCleanup(); 