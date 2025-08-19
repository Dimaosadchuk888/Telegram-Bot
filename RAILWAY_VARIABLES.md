# 🔧 Настройка переменных окружения в Railway

## ❌ Проблема
Railway не может обработать переменные окружения из-за неправильного формата.

## ✅ Решение

### 1. Настройка переменных через Railway Dashboard

1. Перейдите в ваш проект на Railway
2. Нажмите на вкладку "Variables"
3. Добавьте переменные **по одной**:

#### Переменная 1:
- **Name:** `BOT_TOKEN`
- **Value:** `your_actual_bot_token_here`

#### Переменная 2:
- **Name:** `NODE_ENV`
- **Value:** `production`

#### Переменная 3:
- **Name:** `WEBHOOK_URL`
- **Value:** `https://web-telegram-bot.up.railway.app/webhook`

#### Переменная 4:
- **Name:** `PORT`
- **Value:** `3000`

### 2. Правильный формат переменных

**НЕПРАВИЛЬНО:**
```
BOT_TOKEN=your_token_here
NODE_ENV=production
```

**ПРАВИЛЬНО:**
В Railway Dashboard каждая переменная добавляется отдельно:
- Name: `BOT_TOKEN`, Value: `your_token_here`
- Name: `NODE_ENV`, Value: `production`

### 3. Проверка переменных

После добавления переменных:
1. Перейдите в "Deployments"
2. Нажмите "Redeploy"
3. Проверьте логи запуска

### 4. Ожидаемые логи

При правильной настройке вы увидите:
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

### 5. Получение токена бота

1. Найдите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен
5. Добавьте в Railway как переменную `BOT_TOKEN`

### 6. Проверка healthcheck

После успешного деплоя проверьте:
```
https://web-telegram-bot.up.railway.app/health
```

Ожидаемый ответ:
```json
{
  "status": "healthy",
  "service": "telegram-bot",
  "timestamp": "2024-08-19T..."
}
```

## 🛠️ Устранение неполадок

### Проблема: "empty key"
**Решение:** Добавляйте переменные по одной через Railway Dashboard

### Проблема: "404: Not Found"
**Решение:** Проверьте правильность токена бота

### Проблема: Healthcheck failed
**Решение:** Убедитесь, что все переменные настроены правильно

## 📋 Чек-лист

- [ ] Добавлена переменная `BOT_TOKEN`
- [ ] Добавлена переменная `NODE_ENV` = `production`
- [ ] Добавлена переменная `WEBHOOK_URL`
- [ ] Добавлена переменная `PORT` = `3000`
- [ ] Выполнен redeploy
- [ ] Проверен healthcheck endpoint
- [ ] Проверены логи запуска
