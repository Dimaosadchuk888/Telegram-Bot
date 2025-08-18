# Telegram Bot

Telegram бот, построенный на Node.js с использованием библиотеки Telegraf.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 16+ 
- npm или yarn
- Telegram Bot Token (получите у [@BotFather](https://t.me/BotFather))

### Установка

1. Клонируйте репозиторий:
```bash
git clone <your-repo-url>
cd telegram-bot
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env и добавьте ваш BOT_TOKEN
```

4. Запустите бота:
```bash
# Режим разработки
npm run dev

# Продакшен режим
npm start
```

## 📁 Структура проекта

```
telegram-bot/
├── src/
│   ├── bot.js          # Основной файл бота
│   ├── handlers.js     # Обработчики команд и callback-ов
│   ├── keyboards.js    # Инлайн клавиатуры
│   ├── database.js     # Работа с данными пользователей
│   └── admin.js        # Админские команды
├── .env                # Переменные окружения
├── package.json        # Зависимости и скрипты
├── ecosystem.config.js # Конфигурация PM2
└── README.md          # Документация
```

## ⚙️ Конфигурация

### Переменные окружения (.env)

```env
# Обязательные
BOT_TOKEN=your_bot_token_here

# Опциональные
NODE_ENV=development
WEBHOOK_URL=https://your-domain.com/webhook
PORT=3000
```

### Получение Bot Token

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен в файл `.env`

## 🛠️ Команды

```bash
# Запуск в режиме разработки (с автоперезагрузкой)
npm run dev

# Запуск в продакшен режиме
npm start

# PM2 команды
npm run pm2:start    # Запуск через PM2
npm run pm2:stop     # Остановка PM2 процесса
npm run pm2:restart  # Перезапуск PM2 процесса
npm run pm2:delete   # Удаление PM2 процесса
```

## 🌐 Деплой

### Локальный запуск

```bash
npm install
npm start
```

### Продакшен с PM2

```bash
npm install -g pm2
npm run pm2:start
```

### Деплой на Realway

1. Подготовьте проект:
```bash
npm install --production
```

2. Настройте переменные окружения на сервере:
   - `BOT_TOKEN`
   - `NODE_ENV=production`
   - `WEBHOOK_URL` (если используете webhook)

3. Запустите через PM2:
```bash
pm2 start ecosystem.config.js --env production
```

## 🎯 Функциональность бота

### 📱 Главное меню
- **📊 Баланс** - просмотр текущего баланса UNI
- **💸 Вывод средств** - вывод средств (мин. 1000 UNI)
- **➕ Пополнить** - пополнение баланса
- **📈 Статистика** - личная и общая статистика
- **❓ Помощь** - справка по боту

### 💰 Система балансов
- **balance** - доступные средства
- **holdBalance** - средства в обработке
- **totalEarned** - общий заработок

### 💸 Логика вывода средств
- Минимальная сумма: 1000 UNI
- Комиссия: 0.1 TON за каждые 1000 UNI
- Автоматический перевод в holdBalance

## 📝 Добавление новых команд

Отредактируйте файл `src/handlers.js`:

```javascript
// Пример добавления новой команды
const handleNewCommand = async (ctx) => {
  await ctx.reply('Новая команда!');
};

// Добавьте в exports
module.exports = {
  // ... существующие обработчики
  handleNewCommand
};
```

Затем добавьте обработчик в `src/bot.js`:

```javascript
bot.action('new_command', handlers.handleNewCommand);
```

## 🔧 Логирование

При использовании PM2 логи сохраняются в папку `logs/`:
- `err.log` - ошибки
- `out.log` - стандартный вывод
- `combined.log` - все логи

## 📚 Полезные ссылки

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [PM2 Documentation](https://pm2.keymetrics.io/)

## 🤝 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории.

## 📄 Лицензия

MIT License
