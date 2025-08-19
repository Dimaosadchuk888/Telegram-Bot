const { Markup } = require('telegraf');

// Главное меню
const mainMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback('💰 Баланс', 'balance'),
    Markup.button.callback('🏦 Пополнить', 'deposit')
  ],
  [
    Markup.button.callback('📤 Вывести средства', 'withdraw')
  ],
  [
    Markup.button.callback('📈 Статистика', 'stats'),
    Markup.button.callback('❓ Помощь', 'help')
  ]
]);

// Клавиатура для пополнения
const depositKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('✅ Я оплатил', 'payment_confirmed')
  ],
  [
    Markup.button.callback('🔙 Назад', 'back_to_main')
  ]
]);

// Клавиатура для вывода средств
const withdrawKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('🔙 Назад', 'back_to_main')
  ]
]);

// Клавиатура для подтверждения вывода
const confirmWithdrawKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('✅ Подтвердить', 'confirm_withdraw'),
    Markup.button.callback('❌ Отмена', 'cancel_withdraw')
  ]
]);

module.exports = {
  mainMenu,
  depositKeyboard,
  withdrawKeyboard,
  confirmWithdrawKeyboard
};
