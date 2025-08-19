// Скрипт для миграции данных в новую структуру таблицы users
require('dotenv').config();
const { Pool } = require('pg');

async function migrateUsersTable() {
  console.log('🔄 Миграция таблицы users в новую структуру...\n');

  const getDatabaseConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionString = isProduction 
      ? process.env.DATABASE_URL 
      : process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

    return {
      connectionString,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };
  };

  const pool = new Pool(getDatabaseConfig());

  try {
    // 1. Проверяем соединение
    console.log('1. 🔗 Проверка соединения...');
    await pool.query('SELECT NOW()');
    console.log('✅ Соединение установлено');

    // 2. Проверяем существующую структуру
    console.log('\n2. 🔍 Проверка текущей структуры...');
    const currentStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);

    console.log('📊 Текущая структура таблицы users:');
    currentStructure.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}`);
    });

    // 3. Проверяем, нужна ли миграция
    const hasNewStructure = currentStructure.rows.some(row => row.column_name === 'telegram_id');
    const hasOldStructure = currentStructure.rows.some(row => row.column_name === 'user_id');

    if (hasNewStructure) {
      console.log('\n✅ Таблица уже имеет новую структуру');
      return;
    }

    if (!hasOldStructure) {
      console.log('\n✅ Таблица пустая или не существует, создаем новую структуру');
      await createNewTable(pool);
      return;
    }

    // 4. Выполняем миграцию
    console.log('\n3. 🔄 Выполнение миграции...');
    await performMigration(pool);

  } catch (error) {
    console.error('❌ Ошибка миграции:', error.message);
  } finally {
    await pool.end();
  }
}

async function createNewTable(pool) {
  const createTableSQL = `
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

  await pool.query(createTableSQL);
  console.log('✅ Новая таблица users создана');
}

async function performMigration(pool) {
  // Создаем временную таблицу с новой структурой
  console.log('   - Создание временной таблицы...');
  await pool.query(`
    CREATE TABLE users_new (
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
  `);

  // Копируем данные из старой таблицы
  console.log('   - Копирование данных...');
  await pool.query(`
    INSERT INTO users_new (telegram_id, username, balance_uni, hold_balance, withdrawn_total, created_at)
    SELECT 
      user_id as telegram_id,
      username,
      COALESCE(balance, 0) as balance_uni,
      COALESCE(hold_balance, 0) as hold_balance,
      COALESCE(total_earned, 0) as withdrawn_total,
      COALESCE(created_at, NOW()) as created_at
    FROM users
    ON CONFLICT (telegram_id) DO NOTHING;
  `);

  // Удаляем старую таблицу и переименовываем новую
  console.log('   - Замена таблицы...');
  await pool.query('DROP TABLE users;');
  await pool.query('ALTER TABLE users_new RENAME TO users;');

  console.log('✅ Миграция завершена успешно');
}

// Запускаем миграцию
migrateUsersTable();
