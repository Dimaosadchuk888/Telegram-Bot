require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const express = require('express');
const handlers = require('./handlers');

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!');
  console.log('📝 Добавьте BOT_TOKEN в файл .env');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Создаем Express приложение для healthcheck
const app = express();

// Healthcheck endpoint для Railway
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Telegram Bot is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Healthcheck endpoint для Railway
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'telegram-bot',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint для Telegram
app.use('/webhook', bot.webhookCallback('/webhook'));

// Подключаем middleware для сессий
bot.use(session());

// Обработчики команд
bot.start(handlers.handleStart);
bot.help(handlers.handleHelp);

// Обработчики callback-кнопок
bot.action('balance', handlers.handleBalance);
bot.action('withdraw', handlers.handleWithdraw);
bot.action('deposit', handlers.handleDeposit);
bot.action('stats', handlers.handleStats);
bot.action('help', handlers.handleHelp);
bot.action('back_to_main', handlers.handleBackToMain);

// Обработчики вывода средств
bot.action('confirm_withdraw', handlers.handleConfirmWithdraw);
bot.action('cancel_withdraw', handlers.handleCancelWithdraw);

// Обработчики пополнения
bot.action('payment_confirmed', handlers.handlePaymentConfirmed);

// Обработчик неизвестных callback-ов
bot.on('callback_query', async (ctx) => {
  await ctx.answerCbQuery('⚠️ Неизвестная команда');
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Если пользователь отправил команду /start, показываем главное меню
  if (text === '/start') {
    await handlers.handleStart(ctx);
    return;
  }
  
  // Для других текстовых сообщений показываем главное меню
  const { mainMenu } = require('./keyboards');
  await ctx.reply('🤖 Используйте кнопки меню для навигации:', mainMenu);
});

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`❌ Ошибка для ${ctx.updateType}:`, err);
  
  // Отправляем пользователю понятное сообщение об ошибке
  const errorMessage = '😔 Произошла ошибка. Попробуйте позже или обратитесь в поддержку.';
  
  if (ctx.callbackQuery) {
    ctx.answerCbQuery(errorMessage);
  } else {
    ctx.reply(errorMessage);
  }
});

// Запуск бота
async function startBot() {
  try {
    console.log('🚀 Запуск Telegram Farming Bot...');
    
    const port = process.env.PORT || 3000;
    
    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
      // Продакшен режим с webhook
      console.log('🌐 Запуск в продакшен режиме с webhook');
      console.log(`🔗 Webhook URL: ${process.env.WEBHOOK_URL}`);
      
      // Запускаем Express сервер
      app.listen(port, () => {
        console.log(`✅ HTTP сервер запущен на порту ${port}`);
        console.log(`🏥 Healthcheck доступен по адресу: http://localhost:${port}/health`);
      });
      
      // Настраиваем webhook
      await bot.telegram.setWebhook(process.env.WEBHOOK_URL);
      console.log('✅ Webhook настроен');
      
    } else {
      // Локальная разработка с long polling
      console.log('🔄 Запуск в режиме разработки (long polling)');
      await bot.launch();
    }
    
    console.log('✅ Farming Bot успешно запущен!');
    console.log('📱 Отправьте /start в Telegram для проверки');
    console.log('💰 Бот готов к работе с балансами и выводами');
    
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error);
    process.exit(1);
  }
}

// Graceful stop
process.once('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, останавливаем бота...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, останавливаем бота...');
  bot.stop('SIGTERM');
});

// Запускаем бота
startBot();
