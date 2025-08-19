// Тестовый скрипт для проверки интеграции с PostgreSQL
require('dotenv').config();
const PostgresDB = require('./src/database-postgres');

async function testDatabaseIntegration() {
  console.log('🧪 Тестирование интеграции с PostgreSQL...\n');

  try {
    // 1. Тест соединения
    console.log('1. 🔗 Тест соединения...');
    const connectionTest = await PostgresDB.testConnection();
    if (connectionTest) {
      console.log('✅ Соединение успешно');
    } else {
      console.log('❌ Ошибка соединения');
      return;
    }

    // 2. Инициализация базы данных
    console.log('\n2. 🗄️ Инициализация базы данных...');
    await PostgresDB.initializeDatabase();
    console.log('✅ База данных инициализирована');

    // 3. Тест создания пользователя
    console.log('\n3. 👤 Тест создания пользователя...');
    const testUserId = 123456789;
    const testUsername = 'test_user';
    
    const user = await PostgresDB.createOrUpdateUser(testUserId, testUsername);
    if (user) {
      console.log('✅ Пользователь создан:', {
        user_id: user.user_id,
        username: user.username,
        balance: user.balance
      });
    } else {
      console.log('❌ Ошибка создания пользователя');
      return;
    }

    // 4. Тест получения пользователя
    console.log('\n4. 🔍 Тест получения пользователя...');
    const retrievedUser = await PostgresDB.getUser(testUserId);
    if (retrievedUser) {
      console.log('✅ Пользователь получен:', {
        user_id: retrievedUser.user_id,
        username: retrievedUser.username,
        balance: retrievedUser.balance
      });
    } else {
      console.log('❌ Ошибка получения пользователя');
      return;
    }

    // 5. Тест обновления баланса
    console.log('\n5. 💰 Тест обновления баланса...');
    const updatedUser = await PostgresDB.updateUserBalance(
      testUserId, 
      1000, // balance
      100,  // hold_balance
      500   // total_earned
    );
    if (updatedUser) {
      console.log('✅ Баланс обновлен:', {
        balance: updatedUser.balance,
        hold_balance: updatedUser.hold_balance,
        total_earned: updatedUser.total_earned
      });
    } else {
      console.log('❌ Ошибка обновления баланса');
      return;
    }

    // 6. Тест добавления транзакции
    console.log('\n6. 📝 Тест добавления транзакции...');
    const transaction = await PostgresDB.addTransaction(
      testUserId,
      'test_transaction',
      100,
      0.1
    );
    if (transaction) {
      console.log('✅ Транзакция добавлена:', {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        fee: transaction.fee
      });
    } else {
      console.log('❌ Ошибка добавления транзакции');
      return;
    }

    // 7. Тест получения статистики
    console.log('\n7. 📊 Тест получения статистики...');
    const stats = await PostgresDB.getStats();
    if (stats) {
      console.log('✅ Статистика получена:', {
        total_users: stats.total_users,
        total_balance: stats.total_balance,
        total_hold_balance: stats.total_hold_balance,
        total_earned: stats.total_earned
      });
    } else {
      console.log('❌ Ошибка получения статистики');
      return;
    }

    // 8. Тест получения всех пользователей
    console.log('\n8. 👥 Тест получения всех пользователей...');
    const allUsers = await PostgresDB.getAllUsers();
    console.log(`✅ Получено пользователей: ${allUsers.length}`);

    console.log('\n🎉 Все тесты прошли успешно!');
    console.log('✅ Интеграция с PostgreSQL работает корректно');

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  } finally {
    // Закрываем соединения
    await PostgresDB.closePool();
    console.log('\n🔒 Соединения с базой данных закрыты');
  }
}

// Запускаем тесты
testDatabaseIntegration();
