// Простое хранилище данных в памяти (для демонстрации)
// В продакшене замените на реальную базу данных

class UserDatabase {
  constructor() {
    this.users = new Map();
  }

  // Получить пользователя или создать нового
  getUser(userId, username = null) {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        userId: userId,
        username: username,
        balance: 0,
        holdBalance: 0,
        totalEarned: 0
      });
    }
    return this.users.get(userId);
  }

  // Обновить данные пользователя
  updateUser(userId, updates) {
    const user = this.getUser(userId);
    Object.assign(user, updates);
    this.users.set(userId, user);
    return user;
  }

  // Получить баланс пользователя
  getBalance(userId) {
    return this.getUser(userId);
  }

  // Пополнить баланс
  addBalance(userId, amount) {
    const user = this.getUser(userId);
    user.balance += amount;
    user.totalEarned += amount;
    this.users.set(userId, user);
    return user;
  }

  // Создать заявку на вывод
  createWithdrawal(userId, amount) {
    const user = this.getUser(userId);
    
    if (user.balance < amount) {
      throw new Error('Недостаточно средств');
    }

    user.balance -= amount;
    user.holdBalance += amount;
    this.users.set(userId, user);
    
    return user;
  }

  // Получить всех пользователей (для админки)
  getAllUsers() {
    return Array.from(this.users.values());
  }

  // Получить статистику
  getStats() {
    const users = this.getAllUsers();
    return {
      totalUsers: users.length,
      totalBalance: users.reduce((sum, user) => sum + user.balance, 0),
      totalHoldBalance: users.reduce((sum, user) => sum + user.holdBalance, 0),
      totalEarned: users.reduce((sum, user) => sum + user.totalEarned, 0)
    };
  }
}

module.exports = new UserDatabase();
