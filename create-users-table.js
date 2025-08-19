// Скрипт для создания таблицы users с новой структурой
require('dotenv').config();
const PostgresDB = require('./src/database-postgres');

async function createUsersTable() {
  console.log('🗄️ Создание таблицы users с новой структурой...\n');

  try {
    // 1. Проверяем соединение
    console.log('1. 🔗 Проверка соединения с базой данных...');
    const connectionTest = await PostgresDB.testConnection();
    if (!connectionTest) {
      console.log('❌ Нет доступа к базе данных');
      console.log('💡 Возможные причины:');
      console.log('   - Переменные окружения не настроены');
      console.log('   - Нет доступа к Railway PostgreSQL');
      console.log('   - SSL сертификаты не настроены');
      return;
    }
    console.log('✅ Соединение с базой данных установлено');

    // 2. Создаем таблицу users с новой структурой
    console.log('\n2. 📋 Создание таблицы users...');
    
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

    // Используем прямой запрос к базе данных
    const { Pool } = require('pg');
    
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
      await pool.query(createTableSQL);
      console.log('✅ Таблица users создана успешно');

      // 3. Проверяем структуру таблицы
      console.log('\n3. 🔍 Проверка структуры таблицы...');
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);

      console.log('📊 Структура таблицы users:');
      structureResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
      });

      // 4. Проверяем существующие данные
      console.log('\n4. 📊 Проверка существующих данных...');
      const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`   - Записей в таблице: ${countResult.rows[0].count}`);

      if (parseInt(countResult.rows[0].count) > 0) {
        const sampleResult = await pool.query('SELECT * FROM users LIMIT 3');
        console.log('   - Примеры записей:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`     ${index + 1}. ID: ${row.id}, Telegram ID: ${row.telegram_id}, Username: ${row.username || 'N/A'}`);
        });
      }

      console.log('\n🎉 Таблица users готова к использованию!');

    } catch (error) {
      console.error('❌ Ошибка при создании таблицы:', error.message);
      console.log('\n💡 Возможные причины ошибки:');
      console.log('   - Недостаточно прав для создания таблиц');
      console.log('   - Таблица уже существует с другой структурой');
      console.log('   - Проблемы с подключением к базе данных');
    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('❌ Общая ошибка:', error.message);
    console.log('\n🔍 Диагностика:');
    console.log('   - Проверьте переменные окружения');
    console.log('   - Убедитесь, что Railway PostgreSQL доступен');
    console.log('   - Проверьте права доступа к базе данных');
  }
}

// Запускаем создание таблицы
createUsersTable();
