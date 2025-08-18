const db = require('./database');

// Админские команды для тестирования
const adminCommands = {
  // Добавить баланс пользователю
  addBalance: (userId, amount) => {
    try {
      const user = db.addBalance(userId, amount);
      return {
        success: true,
        message: `✅ Добавлено ${amount.toLocaleString()} UNI пользователю ${userId}`,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Ошибка: ${error.message}`
      };
    }
  },

  // Установить баланс пользователю
  setBalance: (userId, amount) => {
    try {
      const user = db.updateUser(userId, { balance: amount });
      return {
        success: true,
        message: `✅ Установлен баланс ${amount.toLocaleString()} UNI пользователю ${userId}`,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Ошибка: ${error.message}`
      };
    }
  },

  // Получить статистику
  getStats: () => {
    try {
      const stats = db.getStats();
      return {
        success: true,
        message: `📊 Статистика бота:\n👥 Пользователей: ${stats.totalUsers}\n💰 Общий баланс: ${stats.totalBalance.toLocaleString()} UNI\n⏳ В обработке: ${stats.totalHoldBalance.toLocaleString()} UNI\n📈 Всего заработано: ${stats.totalEarned.toLocaleString()} UNI`,
        stats: stats
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Ошибка: ${error.message}`
      };
    }
  },

  // Получить информацию о пользователе
  getUserInfo: (userId) => {
    try {
      const user = db.getUser(userId);
      return {
        success: true,
        message: `👤 Пользователь ${userId}:\n💰 Баланс: ${user.balance.toLocaleString()} UNI\n⏳ В обработке: ${user.holdBalance.toLocaleString()} UNI\n📈 Всего заработано: ${user.totalEarned.toLocaleString()} UNI\n👤 Username: @${user.username || 'не указан'}`,
        user: user
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Ошибка: ${error.message}`
      };
    }
  },

  // Получить всех пользователей
  getAllUsers: () => {
    try {
      const users = db.getAllUsers();
      return {
        success: true,
        message: `👥 Всего пользователей: ${users.length}`,
        users: users
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Ошибка: ${error.message}`
      };
    }
  }
};

module.exports = adminCommands;
