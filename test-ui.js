const { Markup } = require('telegraf');

// Тестируем новое главное меню
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

console.log('🎨 Новое главное меню:');
console.log(JSON.stringify(mainMenu, null, 2));

console.log('\n📋 Структура кнопок:');
console.log('1. 💰 Баланс (balance)');
console.log('2. 🏦 Пополнить (deposit)');
console.log('3. 📤 Вывести средства (withdraw)');
console.log('4. 📈 Статистика (stats)');
console.log('5. ❓ Помощь (help)');

console.log('\n✅ Изменения применены:');
console.log('✅ Старое меню (нижние кнопки) будет удалено');
console.log('✅ Новые инлайн-кнопки настроены');
console.log('✅ Интерфейс готов к тестированию');
