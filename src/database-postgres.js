const { Pool } = require('pg');

// Конфигурация подключения к базе данных
const getDatabaseConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // В продакшене используем DATABASE_URL, в разработке - DATABASE_PUBLIC_URL
  const connectionString = isProduction 
    ? process.env.DATABASE_URL 
    : process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

  return {
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 20, // максимальное количество соединений в пуле
    idleTimeoutMillis: 30000, // время жизни неактивного соединения
    connectionTimeoutMillis: 2000, // таймаут подключения
  };
};

// Создаем пул соединений
const pool = new Pool(getDatabaseConfig());

// Обработка ошибок пула
pool.on('error', (err) => {
  console.error('❌ Ошибка пула базы данных:', err);
});

// Инициализация базы данных
const initializeDatabase = async () => {
  try {
    console.log('🗄️ Инициализация базы данных...');
    
    // Создаем таблицу пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        balance DECIMAL(20, 8) DEFAULT 0,
        hold_balance DECIMAL(20, 8) DEFAULT 0,
        total_earned DECIMAL(20, 8) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Создаем таблицу транзакций
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        fee DECIMAL(20, 8) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    throw error;
  }
};

// Получить пользователя
const getUser = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error);
    return null;
  }
};

// Создать или обновить пользователя
const createOrUpdateUser = async (userId, username) => {
  try {
    const result = await pool.query(`
      INSERT INTO users (user_id, username, balance, hold_balance, total_earned)
      VALUES ($1, $2, 0, 0, 0)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        username = EXCLUDED.username,
        updated_at = NOW()
      RETURNING *
    `, [userId, username]);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Ошибка создания/обновления пользователя:', error);
    return null;
  }
};

// Обновить баланс пользователя
const updateUserBalance = async (userId, balance, holdBalance, totalEarned) => {
  try {
    const result = await pool.query(`
      UPDATE users 
      SET balance = $2, hold_balance = $3, total_earned = $4, updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [userId, balance, holdBalance, totalEarned]);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Ошибка обновления баланса:', error);
    return null;
  }
};

// Добавить транзакцию
const addTransaction = async (userId, type, amount, fee = 0) => {
  try {
    const result = await pool.query(`
      INSERT INTO transactions (user_id, type, amount, fee, status)
      VALUES ($1, $2, $3, $4, 'completed')
      RETURNING *
    `, [userId, type, amount, fee]);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Ошибка добавления транзакции:', error);
    return null;
  }
};

// Получить статистику
const getStats = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(balance) as total_balance,
        SUM(hold_balance) as total_hold_balance,
        SUM(total_earned) as total_earned
      FROM users
    `);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    return null;
  }
};

// Получить всех пользователей
const getAllUsers = async () => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('❌ Ошибка получения всех пользователей:', error);
    return [];
  }
};

// Тест соединения
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Соединение с базой данных успешно:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Ошибка соединения с базой данных:', error);
    return false;
  }
};

// Закрытие соединений
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Пул соединений закрыт');
  } catch (error) {
    console.error('❌ Ошибка закрытия пула:', error);
  }
};

module.exports = {
  initializeDatabase,
  getUser,
  createOrUpdateUser,
  updateUserBalance,
  addTransaction,
  getStats,
  getAllUsers,
  testConnection,
  closePool
};
