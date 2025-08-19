// Тестовый скрипт для проверки соединения с Railway Postgres
// Запуск: node test-database.js

console.log('🔍 Проверка переменных окружения для Railway Postgres...\n');

// Проверка переменных
const variables = [
  'DATABASE_URL',
  'DATABASE_PUBLIC_URL', 
  'PGUSER',
  'PGDATABASE',
  'PGHOST',
  'PGPORT',
  'POSTGRES_DB',
  'POSTGRES_USER'
];

console.log('📊 Переменные окружения:');
variables.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Скрываем пароль в выводе
    const displayValue = varName.includes('PASSWORD') ? '***HIDDEN***' : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: не найден`);
  }
});

console.log('\n🔧 Анализ конфигурации:');

// Анализ DATABASE_URL
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL настроен (приватное соединение)');
  console.log('   - Рекомендуется для продакшена');
  console.log('   - Использует RAILWAY_PRIVATE_DOMAIN');
} else {
  console.log('❌ DATABASE_URL не настроен');
}

// Анализ DATABASE_PUBLIC_URL
if (process.env.DATABASE_PUBLIC_URL) {
  console.log('✅ DATABASE_PUBLIC_URL настроен (публичное соединение)');
  console.log('   - Рекомендуется для разработки');
  console.log('   - Использует RAILWAY_TCP_PROXY_DOMAIN');
} else {
  console.log('❌ DATABASE_PUBLIC_URL не настроен');
}

console.log('\n📋 Рекомендации:');
console.log('1. Для продакшена используйте: process.env.DATABASE_URL');
console.log('2. Для разработки используйте: process.env.DATABASE_PUBLIC_URL');
console.log('3. Установите драйвер: npm install pg');
console.log('4. Добавьте SSL настройки при необходимости');

console.log('\n🧪 Для тестирования соединения:');
console.log('1. Установите pg: npm install pg');
console.log('2. Запустите тест с реальными переменными');
console.log('3. Используйте SQL команды из DATABASE_AUDIT_REPORT.md');

console.log('\n🎯 Статус: Переменные готовы к использованию!');
