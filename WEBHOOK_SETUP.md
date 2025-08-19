# 🔧 Настройка Webhook для Telegram Bot

## ❌ Проблема
Бот запущен на Railway, но не отвечает в Telegram. Webhook не настроен правильно.

## ✅ Решение

### 1. Получите токен бота
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен

### 2. Проверьте бота
Замените `YOUR_BOT_TOKEN` на ваш токен и выполните:
```bash
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getMe
```

Ожидаемый ответ:
```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Your Bot Name",
    "username": "your_bot_username"
  }
}
```

### 3. Проверьте текущий webhook
```bash
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

### 4. Настройте webhook
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://web-telegram-bot.up.railway.app/webhook"}'
```

Ожидаемый ответ:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

### 5. Проверьте webhook снова
```bash
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

### 6. Протестируйте бота
1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Должно появиться меню с кнопками

## 🔍 Отладка

### Если webhook не настраивается:
1. Проверьте правильность токена
2. Убедитесь, что бот существует
3. Проверьте доступность домена

### Если бот не отвечает:
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что webhook настроен
3. Проверьте, что приложение запущено

### Команды для отладки:
```bash
# Удалить webhook (для локальной разработки)
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook

# Проверить healthcheck
curl https://web-telegram-bot.up.railway.app/health

# Проверить webhook endpoint
curl https://web-telegram-bot.up.railway.app/webhook
```

## 📋 Чек-лист

- [ ] Токен бота получен
- [ ] Бот проверен через getMe
- [ ] Webhook настроен
- [ ] Webhook проверен через getWebhookInfo
- [ ] Бот отвечает на /start
- [ ] Меню с кнопками работает

## 🎯 Ожидаемый результат

После правильной настройки:
1. Webhook будет указывать на `https://web-telegram-bot.up.railway.app/webhook`
2. Бот будет отвечать на команды в Telegram
3. Появится меню с кнопками (Баланс, Вывод средств, Пополнить, Статистика, Помощь)
