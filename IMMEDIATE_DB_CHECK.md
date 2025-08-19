# 🚨 НЕМЕДЛЕННАЯ ПРОВЕРКА БАЗЫ ДАННЫХ

## ❌ Проблема: Таблицы не создались в PostgreSQL

### 🔧 Решение: Проверка и создание таблиц

## 📋 Что нужно сделать СЕЙЧАС:

### 1. **Проверьте переменные окружения в Railway**

1. Откройте Railway Dashboard
2. Перейдите в ваш проект
3. Выберите вкладку "Variables"
4. Убедитесь, что есть:

```env
DATABASE_URL=postgresql://...
DATABASE_PUBLIC_URL=postgresql://...
NODE_ENV=production
```

### 2. **Запустите скрипт проверки через Railway CLI**

```bash
# Установите Railway CLI (если не установлен)
npm install -g @railway/cli

# Войдите в Railway
railway login

# Подключитесь к проекту
railway link

# Запустите скрипт проверки
railway run node check-railway-db.js
```

### 3. **Альтернативный способ: через Railway Dashboard**

1. В Railway Dashboard перейдите в "Settings"
2. Найдите "Custom Domains" или "Connect"
3. Добавьте временный домен
4. Выполните HTTP запрос:

```bash
# После обновления кода (через 1-2 минуты)
curl https://web-telegram-bot.up.railway.app/check-db
```

### 4. **Проверка через PostgreSQL напрямую**

Если у вас есть доступ к PostgreSQL:

```sql
-- Подключитесь к базе данных
psql "postgresql://..."

-- Проверьте таблицы
\dt

-- Проверьте структуру users (если существует)
\d users

-- Создайте таблицы вручную (если не существуют)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  balance_uni NUMERIC(20, 6) DEFAULT 0,
  hold_balance NUMERIC(20, 6) DEFAULT 0,
  withdrawn_total NUMERIC(20, 6) DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  fee DECIMAL(20, 8) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(telegram_id)
);
```

## 🎯 Ожидаемый результат

После успешного выполнения скрипта `check-railway-db.js`:

```
🔍 Проверка базы данных в Railway...

📊 Переменные окружения:
NODE_ENV: production
DATABASE_URL: ✅ Настроен
DATABASE_PUBLIC_URL: ✅ Настроен

1. 🔗 Проверка соединения...
✅ Соединение успешно: 2025-08-19T10:30:00.000Z
📊 PostgreSQL версия: 16.10

2. 📋 Проверка существующих таблиц...
📊 Существующие таблицы:
   - users
   - transactions

3. 👥 Проверка таблицы users...
✅ Таблица users существует
📊 Структура таблицы users:
   - id: integer NOT NULL
   - telegram_id: bigint NOT NULL
   - username: text
   - first_name: text
   - last_name: text
   - balance_uni: numeric DEFAULT 0
   - hold_balance: numeric DEFAULT 0
   - withdrawn_total: numeric DEFAULT 0
   - last_active: timestamp DEFAULT NOW()
   - created_at: timestamp DEFAULT NOW()
📊 Записей в users: 0

4. 📝 Проверка таблицы transactions...
✅ Таблица transactions существует
📊 Записей в transactions: 0

5. 🎯 Финальная проверка...
📊 Все таблицы в базе данных:
   - transactions
   - users

🎉 Проверка завершена!
✅ База данных готова к работе с ботом
```

## 🚨 Если таблицы не создаются:

### **Возможные причины:**
1. **Переменные окружения не настроены** - добавьте в Railway Variables
2. **Нет прав на создание таблиц** - проверьте права доступа
3. **SSL ошибки** - проверьте SSL настройки
4. **Соединение не устанавливается** - проверьте DATABASE_URL

### **Команды для диагностики:**
```bash
# Проверка переменных
railway run node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'MISSING')"

# Проверка соединения
railway run node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()').then(r => console.log('OK:', r.rows[0])).catch(e => console.log('ERROR:', e.message)).finally(() => pool.end())"
```

## 📞 Что делать дальше:

1. **Запустите скрипт** `check-railway-db.js`
2. **Сообщите результат** - что показывает скрипт
3. **Если ошибки** - скопируйте текст ошибки
4. **Если таблицы создались** - протестируйте бота

**🎯 Цель: Убедиться, что таблицы `users` и `transactions` существуют в базе данных!**
