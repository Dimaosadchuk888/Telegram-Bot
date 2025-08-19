const db = require('./database');
const PostgresDB = require('./database-postgres');
const { mainMenu, depositKeyboard, withdrawKeyboard, confirmWithdrawKeyboard } = require('./keyboards');

// Константы
const MIN_WITHDRAWAL = 1000; // Минимальная сумма для вывода
const WITHDRAWAL_FEE = 0.1; // Комиссия в TON за каждые 1000 UNI
const WALLET_ADDRESS = 'EQxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Замените на реальный адрес

// Обработчик команды /start
const handleStart = async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name;
  const lastName = ctx.from.last_name;
  
  try {
    // Регистрируем пользователя в PostgreSQL
    await PostgresDB.createOrUpdateUser(userId, username, firstName, lastName);
    
    const welcomeMessage = `
🤖 Добро пожаловать в Farming Bot!

💰 Здесь вы можете:
• Просматривать баланс UNI
• Выводить средства
• Пополнять баланс
• Отслеживать статистику

Выберите действие:
  `;
    
    await ctx.reply(welcomeMessage, mainMenu);
  } catch (error) {
    console.error('❌ Ошибка в handleStart:', error);
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.', mainMenu);
  }
};

// Обработчик кнопки "Баланс"
const handleBalance = async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const user = await PostgresDB.getUser(userId);
    
    if (!user) {
      await ctx.editMessageText('❌ Пользователь не найден. Отправьте /start', mainMenu);
      return;
    }
    
    const balanceMessage = `
📊 Ваш баланс:

💰 Доступно: ${parseFloat(user.balance_uni).toLocaleString()} UNI
⏳ В обработке: ${parseFloat(user.hold_balance).toLocaleString()} UNI
📈 Всего выведено: ${parseFloat(user.withdrawn_total).toLocaleString()} UNI

💡 Минимальная сумма для вывода: ${MIN_WITHDRAWAL.toLocaleString()} UNI
  `;
    
    await ctx.editMessageText(balanceMessage, mainMenu);
  } catch (error) {
    console.error('❌ Ошибка в handleBalance:', error);
    await ctx.editMessageText('😔 Произошла ошибка. Попробуйте позже.', mainMenu);
  }
};

// Обработчик кнопки "Вывод средств"
const handleWithdraw = async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const user = await PostgresDB.getUser(userId);
    
    if (!user) {
      await ctx.editMessageText('❌ Пользователь не найден. Отправьте /start', mainMenu);
      return;
    }
    
    const balance = parseFloat(user.balance_uni);
    
    if (balance < MIN_WITHDRAWAL) {
      const errorMessage = `
❌ Недостаточно средств для вывода

💰 Ваш баланс: ${balance.toLocaleString()} UNI
💸 Минимум для вывода: ${MIN_WITHDRAWAL.toLocaleString()} UNI

Пополните баланс, чтобы вывести средства.
      `;
      
      await ctx.editMessageText(errorMessage, mainMenu);
      return;
    }
    
    const fee = WITHDRAWAL_FEE;
    const withdrawMessage = `
💸 Вывод средств

💰 Доступно для вывода: ${balance.toLocaleString()} UNI
💸 Сумма вывода: ${MIN_WITHDRAWAL.toLocaleString()} UNI
💳 Комиссия: ${fee} TON

✅ Подтвердите вывод средств
  `;
    
    // Сохраняем состояние для подтверждения
    ctx.session = ctx.session || {};
    ctx.session.pendingWithdrawal = {
      amount: MIN_WITHDRAWAL,
      fee: fee
    };
    
    await ctx.editMessageText(withdrawMessage, confirmWithdrawKeyboard);
  } catch (error) {
    console.error('❌ Ошибка в handleWithdraw:', error);
    await ctx.editMessageText('😔 Произошла ошибка. Попробуйте позже.', mainMenu);
  }
};

// Обработчик подтверждения вывода
const handleConfirmWithdraw = async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    if (!ctx.session?.pendingWithdrawal) {
      await ctx.editMessageText('❌ Ошибка: данные о выводе не найдены', mainMenu);
      return;
    }
    
    const { amount, fee } = ctx.session.pendingWithdrawal;
    
    // Получаем текущего пользователя
    const user = await PostgresDB.getUser(userId);
    if (!user) {
      await ctx.editMessageText('❌ Пользователь не найден', mainMenu);
      return;
    }
    
    const currentBalance = parseFloat(user.balance_uni);
    const currentHoldBalance = parseFloat(user.hold_balance);
    const currentWithdrawnTotal = parseFloat(user.withdrawn_total);
    
    // Проверяем баланс еще раз
    if (currentBalance < amount) {
      await ctx.editMessageText('❌ Недостаточно средств для вывода', mainMenu);
      return;
    }
    
    // Обновляем баланс
    const newBalance = currentBalance - amount;
    const newHoldBalance = currentHoldBalance + amount;
    
    await PostgresDB.updateUserBalance(userId, newBalance, newHoldBalance, currentWithdrawnTotal);
    
    // Добавляем транзакцию
    await PostgresDB.addTransaction(userId, 'withdrawal', amount, fee);
    
    const successMessage = `
✅ Вы подали заявку на вывод ${amount.toLocaleString()} UNI

💳 Списано комиссии: ${fee} TON
💰 Баланс: ${newBalance.toLocaleString()} UNI
⏳ В обработке: ${newHoldBalance.toLocaleString()} UNI

📧 Заявка будет обработана в течение 24 часов
    `;
    
    // Очищаем сессию
    delete ctx.session.pendingWithdrawal;
    
    await ctx.editMessageText(successMessage, mainMenu);
    
  } catch (error) {
    console.error('❌ Ошибка в handleConfirmWithdraw:', error);
    await ctx.editMessageText('😔 Произошла ошибка при выводе средств', mainMenu);
  }
};

// Обработчик отмены вывода
const handleCancelWithdraw = async (ctx) => {
  delete ctx.session?.pendingWithdrawal;
  await ctx.editMessageText('❌ Вывод средств отменен', mainMenu);
};

// Обработчик кнопки "Пополнить"
const handleDeposit = async (ctx) => {
  const depositMessage = `
💳 Пополнение баланса

💰 Для пополнения переведите любую сумму на кошелёк:

\`${WALLET_ADDRESS}\`

📝 После перевода нажмите кнопку «Я оплатил»

⚠️ Пополнение будет проверено в течение 5-10 минут
  `;
  
  await ctx.editMessageText(depositMessage, depositKeyboard);
};

// Обработчик подтверждения оплаты
const handlePaymentConfirmed = async (ctx) => {
  const confirmMessage = `
🕓 Спасибо за оплату!

⏳ Пополнение будет проверено в течение 5-10 минут.

📧 Вы получите уведомление, когда средства поступят на баланс.
  `;
  
  await ctx.editMessageText(confirmMessage, mainMenu);
};

// Обработчик кнопки "Статистика"
const handleStats = async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const user = await PostgresDB.getUser(userId);
    const stats = await PostgresDB.getStats();
    
    if (!user) {
      await ctx.editMessageText('❌ Пользователь не найден. Отправьте /start', mainMenu);
      return;
    }
    
    const statsMessage = `
📈 Ваша статистика:

💰 Доступно: ${parseFloat(user.balance_uni).toLocaleString()} UNI
⏳ В обработке: ${parseFloat(user.hold_balance).toLocaleString()} UNI
📊 Всего выведено: ${parseFloat(user.withdrawn_total).toLocaleString()} UNI

🌍 Общая статистика бота:
👥 Пользователей: ${stats?.total_users || 0}
💰 Общий баланс: ${parseFloat(stats?.total_balance || 0).toLocaleString()} UNI
⏳ В обработке: ${parseFloat(stats?.total_hold_balance || 0).toLocaleString()} UNI
  `;
    
    await ctx.editMessageText(statsMessage, mainMenu);
  } catch (error) {
    console.error('❌ Ошибка в handleStats:', error);
    await ctx.editMessageText('😔 Произошла ошибка при получении статистики', mainMenu);
  }
};

// Обработчик кнопки "Помощь"
const handleHelp = async (ctx) => {
  const helpMessage = `
❓ Справка по боту:

💰 **Баланс** - просмотр ваших средств
💸 **Вывод средств** - вывод UNI (мин. ${MIN_WITHDRAWAL.toLocaleString()})
➕ **Пополнить** - пополнение баланса
📈 **Статистика** - ваша статистика и общая

💡 **Комиссии:**
• Вывод: ${WITHDRAWAL_FEE} TON за каждые ${MIN_WITHDRAWAL.toLocaleString()} UNI

📞 Поддержка: @support_username
  `;
  
  await ctx.editMessageText(helpMessage, mainMenu);
};

// Обработчик кнопки "Назад"
const handleBackToMain = async (ctx) => {
  const mainMessage = `
🤖 Главное меню

Выберите действие:
  `;
  
  await ctx.editMessageText(mainMessage, mainMenu);
};

module.exports = {
  handleStart,
  handleBalance,
  handleWithdraw,
  handleConfirmWithdraw,
  handleCancelWithdraw,
  handleDeposit,
  handlePaymentConfirmed,
  handleStats,
  handleHelp,
  handleBackToMain
};
