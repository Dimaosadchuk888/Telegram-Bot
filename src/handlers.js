// Базовые обработчики для чистого бота

// Простой обработчик команды /start
const handleStart = async (ctx) => {
  try {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name;
    
    console.log(`👤 Пользователь ${firstName} (@${username}) запустил бота`);
    
    await ctx.reply('👋 Привет! Я чистый Telegram бот.');
    
  } catch (error) {
    console.error('❌ Ошибка в handleStart:', error);
    await ctx.reply('😔 Произошла ошибка. Попробуйте позже.');
  }
};

// Обработчик текстовых сообщений
const handleText = async (ctx) => {
  const text = ctx.message.text;
  
  if (text !== '/start') {
    await ctx.reply('Отправьте /start для начала работы');
  }
};

module.exports = {
  handleStart,
  handleText
};
