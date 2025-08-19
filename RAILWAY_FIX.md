# 🔧 Исправление Railway Healthcheck

## ❌ Проблема
Деплой на Railway падал на этапе "Network > Healthcheck" - приложение запускалось, но Railway не мог проверить его работоспособность.

## ✅ Решение

### 1. Добавлен Express сервер
- Добавлен `express` в зависимости
- Создан HTTP сервер для обработки запросов
- Добавлены healthcheck endpoints

### 2. Healthcheck endpoints
```javascript
// Главная страница
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Telegram Bot is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'telegram-bot',
    timestamp: new Date().toISOString()
  });
});
```

### 3. Обновлена конфигурация Railway
```json
{
  "healthcheckPath": "/health",
  "healthcheckTimeout": 300
}
```

## 🚀 Что изменилось

### В `src/bot.js`:
- ✅ Добавлен Express сервер
- ✅ Добавлены healthcheck endpoints
- ✅ Настроен webhook через Express
- ✅ Улучшено логирование

### В `package.json`:
- ✅ Добавлена зависимость `express`

### В `railway.json`:
- ✅ Изменен healthcheck path на `/health`
- ✅ Увеличен timeout до 300 секунд

## 📋 Проверка исправления

### Локальная проверка:
```bash
# Установка зависимостей
npm install

# Проверка синтаксиса
node -c src/bot.js

# Тестовый запуск (если есть токен)
npm start
```

### Проверка на Railway:
1. Дождитесь нового деплоя
2. Проверьте статус - должен быть зеленый
3. Проверьте healthcheck endpoint:
   ```
   https://web-telegram-bot.up.railway.app/health
   ```

## 🔍 Логи для отладки

### Успешный запуск:
```
🚀 Запуск Telegram Farming Bot...
🌐 Запуск в продакшен режиме с webhook
🔗 Webhook URL: https://web-telegram-bot.up.railway.app/webhook
✅ HTTP сервер запущен на порту 3000
🏥 Healthcheck доступен по адресу: http://localhost:3000/health
✅ Webhook настроен
✅ Farming Bot успешно запущен!
```

### Проверка healthcheck:
```bash
curl https://web-telegram-bot.up.railway.app/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "service": "telegram-bot",
  "timestamp": "2024-08-19T..."
}
```

## 📝 Следующие шаги

После успешного деплоя:
1. Настройте переменные окружения в Railway
2. Получите токен бота у @BotFather
3. Настройте webhook через Telegram API
4. Протестируйте бота

## 🛠️ Команды для настройки

### Настройка webhook:
```bash
./setup-webhook.sh
```

### Проверка webhook:
```bash
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

### Переменные окружения для Railway:
```
BOT_TOKEN=your_actual_bot_token_here
NODE_ENV=production
WEBHOOK_URL=https://web-telegram-bot.up.railway.app/webhook
PORT=3000
```
