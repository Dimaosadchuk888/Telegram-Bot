# 🚀 Быстрая настройка Railway

## ❌ Проблема решена
Файл `railway-env.txt` переименован в `RAILWAY_VARIABLES_EXAMPLE.txt` для избежания конфликтов.

## ✅ Следующие шаги

### 1. Дождитесь нового деплоя
Railway автоматически запустит новый деплой после push.

### 2. Настройте переменные окружения
В Railway Dashboard → Variables добавьте:

| Name | Value |
|------|-------|
| `BOT_TOKEN` | `your_actual_bot_token_here` |
| `NODE_ENV` | `production` |
| `WEBHOOK_URL` | `https://web-telegram-bot.up.railway.app/webhook` |
| `PORT` | `3000` |

### 3. Получите токен бота
1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Скопируйте токен
4. Добавьте в Railway как `BOT_TOKEN`

### 4. Проверьте деплой
После настройки переменных:
- Дождитесь зеленого статуса
- Проверьте healthcheck: `https://web-telegram-bot.up.railway.app/health`

## 🎯 Ожидаемый результат
```
🚀 Запуск Telegram Farming Bot...
🔧 NODE_ENV: production
🔗 WEBHOOK_URL: https://web-telegram-bot.up.railway.app/webhook
🔑 BOT_TOKEN: настроен
🌐 Запуск в продакшен режиме с webhook
✅ HTTP сервер запущен на порту 3000
🏥 Healthcheck доступен по адресу: http://localhost:3000/health
✅ Webhook настроен
✅ Farming Bot успешно запущен!
```

**Теперь деплой должен пройти успешно! 🎉**
