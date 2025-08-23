const { Markup } = require('telegraf');

// Простая клавиатура для чистого бота
const simpleKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback('👋 Привет', 'hello')
  ]
]);

module.exports = {
  simpleKeyboard
};
