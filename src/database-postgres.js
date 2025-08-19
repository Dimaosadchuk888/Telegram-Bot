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
    
    // Создаем таблицу пользователей с новой структурой
    await pool.query(`
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
      'SELECT * FROM users WHERE telegram_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error);
    return null;
  }
};

// Создать или обновить пользователя
const createOrUpdateUser = async (userId, username, firstName = null, lastName = null) => {
  try {
    const result = await pool.query(`
      INSERT INTO users (telegram_id, username, first_name, last_name, balance_uni, hold_balance, withdrawn_total)
      VALUES ($1, $2, $3, $4, 0, 0, 0)
      ON CONFLICT (telegram_id) 
      DO UPDATE SET 
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        last_active = NOW()
      RETURNING *
    `, [userId, username, firstName, lastName]);
    
    return result.rows[0];
  } catch (error) {
    console.error('❌ Ошибка создания/обновления пользователя:', error);
    return null;
  }
};

// Обновить баланс пользователя
const updateUserBalance = async (userId, balanceUni, holdBalance, withdrawnTotal) => {
  try {
    const result = await pool.query(`
      UPDATE users 
      SET balance_uni = $2, hold_balance = $3, withdrawn_total = $4, last_active = NOW()
      WHERE telegram_id = $1
      RETURNING *
    `, [userId, balanceUni, holdBalance, withdrawnTotal]);
    
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
        SUM(balance_uni) as total_balance,
        SUM(hold_balance) as total_hold_balance,
        SUM(withdrawn_total) as total_withdrawn
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
