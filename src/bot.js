require('dotenv').config();
const { Telegraf } = require('telegraf');

// Отключаем предупреждение о punycode
process.removeAllListeners('warning');

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!');
  console.log('📝 Добавьте BOT_TOKEN в файл .env');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Создаем Express приложение для healthcheck
const express = require('express');
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

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'telegram-bot',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint для Telegram
app.post('/webhook', bot.webhookCallback('/webhook'));
app.get('/webhook', (req, res) => {
  res.json({ status: 'webhook endpoint ready' });
});

// Простой обработчик команды /start
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    const firstName = ctx.from.first_name;
    
    console.log(`👤 Пользователь ${firstName} (@${username}) запустил бота`);
    
    // Текст сообщения о закрытии WarpJump
    const messageText = `🙋‍♂️ Дорогие участники!

WarpJump-бот полностью закрыт, и вывод монет больше не доступен.
Все ваши монеты, которые вы добывали в WarpJump через фарминг, объединены и закреплены за каждым аккаунтом который принимал участие в добыче монет через Bot. Ничего не потеряно — все монеты сохранены за вашими аккаунтами. ✅

Теперь мы приглашаем вас в UniFarm!
Там вы можете продолжить участие, получать дополнительные монеты и развивать свои аккаунты.

💡 Напоминаем: все UNI, которые были у вас на балансе и в фарминге в WarpJump, закреплены за вашим аккаунтом в полной мере.

Следите за новостями в нашем официальном канале https://t.me/UniverseGamesChannel 

Вместе мы делаем шаг в новую эру UniFarm! 🚀✨

Переходи: 👉 https://t.me/UniFarming_Bot/UniFarm?startapp=REF_1753357645380_f0gt4q`;

    await ctx.reply(messageText);
    
    console.log(`✅ Сообщение отправлено пользователю ${userId}`);
    
  } catch (error) {
    console.error('❌ Ошибка при отправке сообщения:', error);
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
  }
});

// Обработчик всех остальных сообщений
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Если это не команда /start, отправляем то же сообщение
  if (text !== '/start') {
    const messageText = `🙋‍♂️ Дорогие участники!

WarpJump-бот полностью закрыт, и вывод монет больше не доступен.
Все ваши монеты, которые вы добывали в WarpJump через фарминг, объединены и закреплены за каждым аккаунтом который принимал участие в добыче монет через Bot. Ничего не потеряно — все монеты сохранены за вашими аккаунтами. ✅

Теперь мы приглашаем вас в UniFarm!
Там вы можете продолжить участие, получать дополнительные монеты и развивать свои аккаунты.

💡 Напоминаем: все UNI, которые были у вас на балансе и в фарминге в WarpJump, закреплены за вашим аккаунтом в полной мере.

Следите за новостями в нашем официальном канале https://t.me/UniverseGamesChannel 

Вместе мы делаем шаг в новую эру UniFarm! 🚀✨

Переходи: 👉 https://t.me/UniFarming_Bot/UniFarm?startapp=REF_1753357645380_f0gt4q`;

    await ctx.reply(messageText);
  }
});

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`❌ Ошибка для ${ctx.updateType}:`, err);
  
  const errorMessage = '😔 Произошла ошибка. Попробуйте позже.';
  
  if (ctx.callbackQuery) {
    ctx.answerCbQuery(errorMessage);
  } else {
    ctx.reply(errorMessage);
  }
});

// Запуск бота
async function startBot() {
  try {
    console.log('🚀 Запуск Telegram Bot...');
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 WEBHOOK_URL: ${process.env.WEBHOOK_URL || 'не настроен'}`);
    console.log(`🔑 BOT_TOKEN: ${process.env.BOT_TOKEN ? 'настроен' : 'не настроен'}`);
    
    const port = process.env.PORT || 3000;
    
    if (process.env.NODE_ENV === 'production') {
      // Продакшен режим с webhook
      console.log('🌐 Запуск в продакшен режиме с webhook');
      
      if (!process.env.WEBHOOK_URL) {
        console.error('❌ WEBHOOK_URL не настроен для продакшена!');
        process.exit(1);
      }
      
      console.log(`🔗 Webhook URL: ${process.env.WEBHOOK_URL}`);
      
      // Запускаем Express сервер
      app.listen(port, () => {
        console.log(`✅ HTTP сервер запущен на порту ${port}`);
        console.log(`🏥 Healthcheck доступен по адресу: http://localhost:${port}/health`);
      });
      
      // Настраиваем webhook
      try {
        await bot.telegram.setWebhook(process.env.WEBHOOK_URL);
        console.log('✅ Webhook настроен');
      } catch (error) {
        console.warn('⚠️ Не удалось настроить webhook:', error.message);
      }
      
    } else {
      // Локальная разработка с long polling
      console.log('🔄 Запуск в режиме разработки (long polling)');
      
      // Проверяем, что токен не является placeholder
      if (process.env.BOT_TOKEN === 'your_bot_token_here') {
        console.log('⚠️ BOT_TOKEN не настроен, запускаем только HTTP сервер для тестирования');
        
        // Запускаем только Express сервер для тестирования
        app.listen(port, () => {
          console.log(`✅ HTTP сервер запущен на порту ${port}`);
          console.log(`🏥 Healthcheck доступен по адресу: http://localhost:${port}/health`);
          console.log('📝 Настройте BOT_TOKEN в .env для полной работы бота');
        });
        return;
      }
      
      await bot.launch();
    }
    
    console.log('✅ Telegram Bot успешно запущен!');
    console.log('📱 Отправьте /start в Telegram для проверки');
    
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
