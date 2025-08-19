// Скрипт для принудительного создания таблиц в продакшене
require('dotenv').config();
const { Pool } = require('pg');

async function forceCreateTables() {
  console.log('🔨 Принудительное создание таблиц в продакшене...\n');

  // Проверяем переменные окружения
  console.log('📊 Проверка переменных окружения:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Настроен' : '❌ Не найден');
  console.log('DATABASE_PUBLIC_URL:', process.env.DATABASE_PUBLIC_URL ? '✅ Настроен' : '❌ Не найден');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

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
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Соединение успешно:', connectionTest.rows[0]);

    // 2. Создаем таблицу users
    console.log('\n2. 📋 Создание таблицы users...');
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
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
    console.log('✅ Таблица users создана/проверена');

    // 3. Создаем таблицу transactions
    console.log('\n3. 📝 Создание таблицы transactions...');
    const createTransactionsTableSQL = `
      CREATE TABLE IF NOT EXISTS transactions (
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
    console.log('✅ Таблица transactions создана/проверена');

    // 4. Проверяем структуру таблиц
    console.log('\n4. 🔍 Проверка структуры таблиц...');
    
    // Проверяем users
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

    // Проверяем transactions
    const transactionsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Структура таблицы transactions:');
    transactionsStructure.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

    // 5. Проверяем данные
    console.log('\n5. 📊 Проверка данных...');
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const transactionsCount = await pool.query('SELECT COUNT(*) as count FROM transactions');
    
    console.log(`   - Записей в users: ${usersCount.rows[0].count}`);
    console.log(`   - Записей в transactions: ${transactionsCount.rows[0].count}`);

    // 6. Тестовые данные (опционально)
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log('\n6. 🧪 Создание тестовых данных...');
      await pool.query(`
        INSERT INTO users (telegram_id, username, first_name, last_name, balance_uni, hold_balance, withdrawn_total)
        VALUES (123456789, 'test_user', 'Test', 'User', 1000.000000, 0.000000, 0.000000)
        ON CONFLICT (telegram_id) DO NOTHING;
      `);
      console.log('✅ Тестовые данные созданы');
    }

    console.log('\n🎉 Все таблицы созданы и готовы к работе!');

  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error.message);
    console.log('\n🔍 Диагностика ошибки:');
    console.log('   - Проверьте переменные окружения в Railway');
    console.log('   - Убедитесь, что PostgreSQL доступен');
    console.log('   - Проверьте права доступа к базе данных');
  } finally {
    await pool.end();
    console.log('\n🔒 Соединение с базой данных закрыто');
  }
}

// Запускаем создание таблиц
forceCreateTables();
