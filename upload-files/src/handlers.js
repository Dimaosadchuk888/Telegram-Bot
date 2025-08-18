const db = require('./database');
const { mainMenu, depositKeyboard, withdrawKeyboard, confirmWithdrawKeyboard } = require('./keyboards');

// Константы
const MIN_WITHDRAWAL = 1000; // Минимальная сумма для вывода
const WITHDRAWAL_FEE = 0.1; // Комиссия в TON за каждые 1000 UNI
const WALLET_ADDRESS = 'EQxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Замените на реальный адрес

// Обработчик команды /start
const handleStart = async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  
  // Регистрируем пользователя
  db.getUser(userId, username);
  
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
};

// Обработчик кнопки "Баланс"
const handleBalance = async (ctx) => {
  const userId = ctx.from.id;
  const user = db.getBalance(userId);
  
  const balanceMessage = `
📊 Ваш баланс:

💰 Доступно: ${user.balance.toLocaleString()} UNI
⏳ В обработке: ${user.holdBalance.toLocaleString()} UNI
📈 Всего заработано: ${user.totalEarned.toLocaleString()} UNI

💡 Минимальная сумма для вывода: ${MIN_WITHDRAWAL.toLocaleString()} UNI
  `;
  
  await ctx.editMessageText(balanceMessage, mainMenu);
};

// Обработчик кнопки "Вывод средств"
const handleWithdraw = async (ctx) => {
  const userId = ctx.from.id;
  const user = db.getBalance(userId);
  
  if (user.balance < MIN_WITHDRAWAL) {
    const errorMessage = `
❌ Недостаточно средств для вывода

💰 Ваш баланс: ${user.balance.toLocaleString()} UNI
💸 Минимум для вывода: ${MIN_WITHDRAWAL.toLocaleString()} UNI

Пополните баланс, чтобы вывести средства.
    `;
    
    await ctx.editMessageText(errorMessage, mainMenu);
    return;
  }
  
  const fee = WITHDRAWAL_FEE;
  const withdrawMessage = `
💸 Вывод средств

💰 Доступно для вывода: ${user.balance.toLocaleString()} UNI
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
};

// Обработчик подтверждения вывода
const handleConfirmWithdraw = async (ctx) => {
  const userId = ctx.from.id;
  
  if (!ctx.session?.pendingWithdrawal) {
    await ctx.editMessageText('❌ Ошибка: данные о выводе не найдены', mainMenu);
    return;
  }
  
  const { amount, fee } = ctx.session.pendingWithdrawal;
  
  try {
    const user = db.createWithdrawal(userId, amount);
    
    const successMessage = `
✅ Вы подали заявку на вывод ${amount.toLocaleString()} UNI

💳 Списано комиссии: ${fee} TON
💰 Баланс: ${user.balance.toLocaleString()} UNI
⏳ В обработке: ${user.holdBalance.toLocaleString()} UNI

📧 Заявка будет обработана в течение 24 часов
    `;
    
    // Очищаем сессию
    delete ctx.session.pendingWithdrawal;
    
    await ctx.editMessageText(successMessage, mainMenu);
    
  } catch (error) {
    await ctx.editMessageText(`❌ Ошибка: ${error.message}`, mainMenu);
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
  const user = db.getBalance(userId);
  const stats = db.getStats();
  
  const statsMessage = `
📈 Ваша статистика:

💰 Доступно: ${user.balance.toLocaleString()} UNI
⏳ В обработке: ${user.holdBalance.toLocaleString()} UNI
📊 Всего заработано: ${user.totalEarned.toLocaleString()} UNI

🌍 Общая статистика бота:
👥 Пользователей: ${stats.totalUsers}
💰 Общий баланс: ${stats.totalBalance.toLocaleString()} UNI
⏳ В обработке: ${stats.totalHoldBalance.toLocaleString()} UNI
  `;
  
  await ctx.editMessageText(statsMessage, mainMenu);
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
