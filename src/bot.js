require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const express = require('express');
const handlers = require('./handlers');
const PostgresDB = require('./database-postgres');

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

// Endpoint для проверки базы данных
app.get('/check-db', async (req, res) => {
  try {
    const PostgresDB = require('./database-postgres');
    
    // Проверяем соединение
    const connectionTest = await PostgresDB.testConnection();
    if (!connectionTest) {
      return res.json({
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }

    // Проверяем таблицы
    const { Pool } = require('pg');
    const getDatabaseConfig = () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const connectionString = isProduction 
        ? process.env.DATABASE_URL 
        : process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

      return {
        connectionString,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      };
    };

    const pool = new Pool(getDatabaseConfig());
    
    // Проверяем существующие таблицы
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const transactionsCount = await pool.query('SELECT COUNT(*) as count FROM transactions');

    await pool.end();

    res.json({
      status: 'success',
      database: 'connected',
      tables: tablesResult.rows.map(row => row.table_name),
      users_count: parseInt(usersCount.rows[0].count),
      transactions_count: parseInt(transactionsCount.rows[0].count),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Логирование webhook запросов
app.use('/webhook', (req, res, next) => {
  console.log('📨 Получен webhook запрос:', {
    method: req.method,
    url: req.url,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  next();
});

// Webhook endpoint для Telegram
app.post('/webhook', bot.webhookCallback('/webhook'));
app.get('/webhook', (req, res) => {
  res.json({ status: 'webhook endpoint ready' });
});

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
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 WEBHOOK_URL: ${process.env.WEBHOOK_URL || 'не настроен'}`);
    console.log(`🔑 BOT_TOKEN: ${process.env.BOT_TOKEN ? 'настроен' : 'не настроен'}`);
    
    // Инициализация базы данных
    try {
      console.log('🗄️ Начинаем инициализацию базы данных...');
      await PostgresDB.initializeDatabase();
      console.log('✅ База данных инициализирована');
      
      const connectionTest = await PostgresDB.testConnection();
      if (connectionTest) {
        console.log('✅ Соединение с базой данных установлено');
      } else {
        console.warn('⚠️ Не удалось проверить соединение с базой данных');
      }
    } catch (error) {
      console.error('❌ Критическая ошибка инициализации базы данных:', error.message);
      console.log('ℹ️ Бот будет работать без базы данных');
      console.log('💡 Проверьте переменные окружения в Railway Dashboard');
    }
    
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
      
      // Настраиваем webhook (опционально)
      try {
        await bot.telegram.setWebhook(process.env.WEBHOOK_URL);
        console.log('✅ Webhook настроен');
      } catch (error) {
        console.warn('⚠️ Не удалось настроить webhook:', error.message);
        console.log('ℹ️ Бот будет работать без webhook');
      }
      
      // Удаляем старое меню (нижние кнопки)
      try {
        await bot.telegram.setChatMenuButton({
          menu_button: { type: 'default' }
        });
        console.log('✅ Старое меню удалено');
      } catch (error) {
        console.warn('⚠️ Не удалось удалить старое меню:', error.message);
      }
      
    } else {
      // Локальная разработка с long polling
      console.log('🔄 Запуск в режиме разработки (long polling)');
      
      if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'your_bot_token_here') {
        console.error('❌ BOT_TOKEN не настроен для разработки!');
        console.log('📝 Добавьте BOT_TOKEN в файл .env для локального тестирования');
        process.exit(1);
      }
      
      await bot.launch();
      
      // Удаляем старое меню (нижние кнопки)
      try {
        await bot.telegram.setChatMenuButton({
          menu_button: { type: 'default' }
        });
        console.log('✅ Старое меню удалено');
      } catch (error) {
        console.warn('⚠️ Не удалось удалить старое меню:', error.message);
      }
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
process.once('SIGINT', async () => {
  console.log('🛑 Получен сигнал SIGINT, останавливаем бота...');
  await PostgresDB.closePool();
  bot.stop('SIGINT');
});

process.once('SIGTERM', async () => {
  console.log('🛑 Получен сигнал SIGTERM, останавливаем бота...');
  await PostgresDB.closePool();
  bot.stop('SIGTERM');
});

// Запускаем бота
startBot();
