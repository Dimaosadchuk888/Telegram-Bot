// Базовая структура для PostgreSQL (чистый бот)

const { Pool } = require('pg');

// Определяем режим работы
const isProduction = process.env.NODE_ENV === 'production';

// Выбираем строку подключения
const connectionString = isProduction 
  ? process.env.DATABASE_URL 
  : process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

console.log('🔗 Используем соединение:', isProduction ? 'DATABASE_URL (продакшен)' : 'DATABASE_PUBLIC_URL (разработка)');

// Создаем пул соединений
const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Базовые функции для чистого бота
const PostgresDB = {
  // Тест соединения
  testConnection: async () => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Соединение с PostgreSQL установлено');
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к PostgreSQL:', error.message);
      return false;
    }
  },

  // Получить пользователя
  getUser: async (userId) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Ошибка получения пользователя:', error);
      return null;
    }
  },

  // Создать или обновить пользователя
  createOrUpdateUser: async (userId, username, firstName, lastName) => {
    try {
      const result = await pool.query(`
        INSERT INTO users (user_id, username, first_name, last_name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          username = EXCLUDED.username,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = NOW()
        RETURNING *
      `, [userId, username, firstName, lastName]);
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Ошибка создания/обновления пользователя:', error);
      return null;
    }
  },

  // Получить статистику
  getStats: async () => {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_users,
          COALESCE(SUM(balance_uni), 0) as total_balance,
          COALESCE(SUM(hold_balance), 0) as total_hold_balance,
          COALESCE(SUM(withdrawn_total), 0) as total_withdrawn
        FROM users
      `);
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      return {
        total_users: 0,
        total_balance: 0,
        total_hold_balance: 0,
        total_withdrawn: 0
      };
    }
  },

  // Закрыть соединения
  close: async () => {
    await pool.end();
    console.log('🔌 Соединения с PostgreSQL закрыты');
  }
};

module.exports = PostgresDB;
