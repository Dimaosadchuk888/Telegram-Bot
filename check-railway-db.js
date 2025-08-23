// Скрипт для проверки и создания таблиц в Railway
require('dotenv').config();
const { Pool } = require('pg');

async function checkRailwayDatabase() {
  console.log('🔍 Проверка базы данных в Railway...\n');

  // Проверяем переменные окружения
  console.log('📊 Переменные окружения:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Настроен' : '❌ Не найден');
  console.log('DATABASE_PUBLIC_URL:', process.env.DATABASE_PUBLIC_URL ? '✅ Настроен' : '❌ Не найден');

  if (!process.env.DATABASE_URL && !process.env.DATABASE_PUBLIC_URL) {
    console.error('❌ Нет переменных для подключения к базе данных!');
    console.log('💡 Добавьте DATABASE_URL или DATABASE_PUBLIC_URL в Railway Variables');
    return;
  }

  const getDatabaseConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionString = isProduction 
      ? process.env.DATABASE_URL 
      : process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

    console.log('🔗 Используем соединение:', isProduction ? 'DATABASE_URL (продакшен)' : 'DATABASE_PUBLIC_URL (разработка)');

    return {
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };
  };

  const pool = new Pool(getDatabaseConfig());

  try {
    // 1. Проверяем соединение
    console.log('\n1. 🔗 Проверка соединения...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Соединение успешно:', connectionTest.rows[0].current_time);
    console.log('📊 PostgreSQL версия:', connectionTest.rows[0].pg_version.split(' ')[1]);

    // 2. Проверяем существующие таблицы
    console.log('\n2. 📋 Проверка существующих таблиц...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Существующие таблицы:');
    if (tablesResult.rows.length === 0) {
      console.log('   - Таблиц не найдено');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // 3. Проверяем таблицу users
    console.log('\n3. 👥 Проверка таблицы users...');
    const usersTableExists = tablesResult.rows.some(row => row.table_name === 'users');
    
    if (usersTableExists) {
      console.log('✅ Таблица users существует');
      
      // Проверяем структуру
      const usersStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);

      console.log('📊 Структура таблицы users:');
      usersStructure.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
      });

      // Проверяем данные
      const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Записей в users: ${usersCount.rows[0].count}`);

      if (parseInt(usersCount.rows[0].count) > 0) {
        const sampleUsers = await pool.query('SELECT telegram_id, username, balance_uni FROM users LIMIT 3');
        console.log('📊 Примеры записей:');
        sampleUsers.rows.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.telegram_id}, Username: ${user.username || 'N/A'}, Balance: ${user.balance_uni}`);
        });
      }
    } else {
      console.log('❌ Таблица users не найдена');
      console.log('🔨 Создаем таблицу users...');
      
      const createUsersTableSQL = `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          telegram_id BIGINT UNIQUE NOT NULL,
          username TEXT,
          first_name TEXT,
          last_name TEXT,
          balance_uni NUMERIC(20, 6) DEFAULT 0,
          hold_balance NUMERIC(20, 6) DEFAULT 0,
          withdrawn_total NUMERIC(20, 6) DEFAULT 0,
          last_active TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;

      await pool.query(createUsersTableSQL);
      console.log('✅ Таблица users создана');
    }

    // 4. Проверяем таблицу transactions
    console.log('\n4. 📝 Проверка таблицы transactions...');
    const transactionsTableExists = tablesResult.rows.some(row => row.table_name === 'transactions');
    
    if (transactionsTableExists) {
      console.log('✅ Таблица transactions существует');
      
      const transactionsCount = await pool.query('SELECT COUNT(*) as count FROM transactions');
      console.log(`📊 Записей в transactions: ${transactionsCount.rows[0].count}`);
    } else {
      console.log('❌ Таблица transactions не найдена');
      console.log('🔨 Создаем таблицу transactions...');
      
      const createTransactionsTableSQL = `
        CREATE TABLE transactions (
          id SERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL,
          type VARCHAR(50) NOT NULL,
          amount DECIMAL(20, 8) NOT NULL,
          fee DECIMAL(20, 8) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(telegram_id)
        );
      `;

      await pool.query(createTransactionsTableSQL);
      console.log('✅ Таблица transactions создана');
    }

    // 5. Финальная проверка
    console.log('\n5. 🎯 Финальная проверка...');
    const finalTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Все таблицы в базе данных:');
    finalTablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    console.log('\n🎉 Проверка завершена!');
    console.log('✅ База данных готова к работе с ботом');

  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error.message);
    console.log('\n🔍 Диагностика ошибки:');
    console.log('   - Проверьте переменные окружения в Railway');
    console.log('   - Убедитесь, что PostgreSQL доступен');
    console.log('   - Проверьте права доступа к базе данных');
  } finally {
    await pool.end();
    console.log('\n🔒 Соединение с базой данных закрыто');
  }
}

// Запускаем проверку
checkRailwayDatabase();



