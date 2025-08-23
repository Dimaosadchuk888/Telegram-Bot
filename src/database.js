// Базовая структура для работы с данными (чистый бот)

// Простое хранилище в памяти для разработки
const users = new Map();

// Базовые функции для чистого бота
const database = {
  // Получить пользователя
  getUser: (userId) => {
    return users.get(userId) || null;
  },

  // Создать или обновить пользователя
  createOrUpdateUser: (userId, username, firstName, lastName) => {
    const user = {
      userId,
      username,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.set(userId, user);
    return user;
  },

  // Получить всех пользователей
  getAllUsers: () => {
    return Array.from(users.values());
  },

  // Получить статистику
  getStats: () => {
    const totalUsers = users.size;
    return {
      totalUsers,
      totalBalance: 0,
      totalHoldBalance: 0,
      totalEarned: 0
    };
  }
};

module.exports = database;
