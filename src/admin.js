// Базовые админские функции для чистого бота

// Проверка на админа
const isAdmin = (userId) => {
  const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())) : [];
  return adminIds.includes(userId);
};

// Простая админская команда
const handleAdmin = async (ctx) => {
  const userId = ctx.from.id;
  
  if (!isAdmin(userId)) {
    await ctx.reply('❌ У вас нет доступа к админским функциям');
    return;
  }
  
  await ctx.reply('👨‍💼 Админская панель\n\nПока что здесь ничего нет.');
};

module.exports = {
  isAdmin,
  handleAdmin
};
