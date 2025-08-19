# 🔍 Проверка базы данных в Railway

## ❌ Проблема: База данных не запустилась с таблицами

### 🔧 Решение: Проверка и создание таблиц

## 📋 Пошаговые инструкции

### 1. **Проверьте переменные окружения в Railway**

1. Откройте Railway Dashboard
2. Перейдите в ваш проект
3. Выберите вкладку "Variables"
4. Убедитесь, что есть следующие переменные:

```env
DATABASE_URL=postgresql://...
DATABASE_PUBLIC_URL=postgresql://...
NODE_ENV=production
BOT_TOKEN=your_bot_token
WEBHOOK_URL=https://web-telegram-bot.up.railway.app/webhook
```

### 2. **Проверьте логи Railway**

1. В Railway Dashboard перейдите в "Deployments"
2. Выберите последний деплой
3. Нажмите "View Logs"
4. Ищите сообщения о базе данных:

```
🗄️ Начинаем инициализацию базы данных...
✅ База данных инициализирована
✅ Соединение с базой данных установлено
```

### 3. **Принудительное создание таблиц**

Если таблицы не создались автоматически, выполните:

#### Вариант A: Через Railway CLI
```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в Railway
railway login

# Подключитесь к проекту
railway link

# Запустите скрипт создания таблиц
railway run node force-create-tables.js
```

#### Вариант B: Через Railway Dashboard
1. Перейдите в "Settings" → "Custom Domains"
2. Добавьте временный домен
3. Выполните HTTP запрос:
```bash
curl -X POST https://your-app.railway.app/create-tables
```

### 4. **Проверка через PostgreSQL клиент**

Если у вас есть доступ к PostgreSQL:

```sql
-- Подключитесь к базе данных
psql "postgresql://..."

-- Проверьте таблицы
\dt

-- Проверьте структуру users
\d users

-- Проверьте данные
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;
```

## 🚨 Возможные проблемы

### **Проблема 1: Переменные окружения не настроены**
**Решение:** Добавьте переменные в Railway Dashboard

### **Проблема 2: PostgreSQL недоступен**
**Решение:** Проверьте статус PostgreSQL сервиса в Railway

### **Проблема 3: Недостаточно прав**
**Решение:** Проверьте права доступа к базе данных

### **Проблема 4: SSL ошибки**
**Решение:** Убедитесь, что SSL настроен правильно

## 🔧 Диагностические команды

### **Проверка healthcheck:**
```bash
curl https://web-telegram-bot.up.railway.app/health
```

### **Проверка webhook:**
```bash
curl https://web-telegram-bot.up.railway.app/webhook
```

### **Проверка переменных окружения:**
```bash
railway run node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'MISSING')"
```

## 📞 Что делать дальше

1. **Проверьте логи** в Railway Dashboard
2. **Убедитесь в переменных** окружения
3. **Запустите скрипт** создания таблиц
4. **Протестируйте бота** в Telegram

## 🎯 Ожидаемый результат

После успешной настройки в логах должно быть:
```
🗄️ Начинаем инициализацию базы данных...
✅ База данных инициализирована
✅ Соединение с базой данных установлено
✅ HTTP сервер запущен на порту 3000
✅ Webhook настроен
✅ Farming Bot успешно запущен!
```

**Если проблема остается, проверьте логи Railway и сообщите об ошибках!**
