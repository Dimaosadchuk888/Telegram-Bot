# 🚀 Деплой Telegram Bot на GitHub и Railway

## 📋 Предварительные требования

1. **GitHub аккаунт** - для хранения кода
2. **Railway аккаунт** - для хостинга бота
3. **Telegram Bot Token** - от @BotFather

## 🔧 Настройка GitHub

### 1. Создание репозитория
1. Перейдите на [GitHub](https://github.com)
2. Создайте новый репозиторий: `Telegram-Bot`
3. Сделайте его публичным или приватным

### 2. Загрузка кода на GitHub

#### Вариант A: Через GitHub CLI
```bash
# Установите GitHub CLI
brew install gh  # macOS
# или скачайте с https://cli.github.com/

# Авторизуйтесь
gh auth login

# Создайте репозиторий и загрузите код
gh repo create Dimaosadchuk888/Telegram-Bot --public --source=. --remote=origin --push
```

#### Вариант B: Через веб-интерфейс
1. Перейдите в ваш репозиторий на GitHub
2. Нажмите "Uploading an existing file"
3. Загрузите все файлы проекта (кроме node_modules и .env)

#### Вариант C: Через Git (если настроена аутентификация)
```bash
# Настройте Personal Access Token в GitHub
# Settings -> Developer settings -> Personal access tokens

git remote set-url origin https://YOUR_TOKEN@github.com/Dimaosadchuk888/Telegram-Bot.git
git push -u origin main
```

## 🌐 Деплой на Railway

### 1. Подключение к Railway
1. Перейдите на [Railway](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите ваш репозиторий `Telegram-Bot`

### 2. Настройка переменных окружения
В Railway Dashboard добавьте переменные окружения:

```env
BOT_TOKEN=your_actual_bot_token_here
NODE_ENV=production
WEBHOOK_URL=https://your-railway-domain.railway.app/webhook
PORT=3000
```

### 3. Настройка домена
1. В Railway Dashboard перейдите в "Settings"
2. В разделе "Domains" нажмите "Generate Domain"
3. Скопируйте полученный URL
4. Обновите переменную `WEBHOOK_URL` с новым доменом

### 4. Настройка webhook
После получения домена, обновите webhook в Telegram:

```bash
# Замените на ваш реальный токен и домен
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-railway-domain.railway.app/webhook"}'
```

## 🔄 Автоматический деплой

### Настройка GitHub Actions (опционально)
Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        railway_token: ${{ secrets.RAILWAY_TOKEN }}
        service: telegram-bot
```

## 📊 Мониторинг

### Логи Railway
1. В Railway Dashboard перейдите в "Deployments"
2. Выберите последний деплой
3. Просмотрите логи для диагностики

### Проверка работы бота
1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Проверьте все функции меню

## 🔧 Устранение неполадок

### Проблема: Бот не отвечает
1. Проверьте логи в Railway
2. Убедитесь, что `BOT_TOKEN` правильный
3. Проверьте, что webhook настроен корректно

### Проблема: Ошибки при деплое
1. Проверьте, что все зависимости в `package.json`
2. Убедитесь, что `start` скрипт настроен правильно
3. Проверьте переменные окружения

### Проблема: Webhook не работает
1. Проверьте, что домен доступен
2. Убедитесь, что порт 3000 открыт
3. Проверьте SSL сертификат

## 📈 Масштабирование

### Вертикальное масштабирование
В Railway Dashboard:
1. Перейдите в "Settings"
2. Измените "Instance Type" на более мощный

### Горизонтальное масштабирование
1. Создайте несколько инстансов
2. Настройте балансировщик нагрузки
3. Используйте Redis для сессий

## 🔒 Безопасность

### Переменные окружения
- Никогда не коммитьте `.env` файл
- Используйте Railway Secrets для чувствительных данных
- Регулярно обновляйте токены

### Webhook безопасность
- Используйте HTTPS только
- Проверяйте подпись запросов от Telegram
- Ограничьте доступ к webhook endpoint

## 📞 Поддержка

### Полезные ссылки
- [Railway Documentation](https://docs.railway.app/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegraf Documentation](https://telegraf.js.org/)

### Логи и отладка
```bash
# Просмотр логов в Railway
railway logs

# Локальная отладка
npm run dev
```

## ✅ Чек-лист деплоя

- [ ] Код загружен на GitHub
- [ ] Railway проект создан
- [ ] Переменные окружения настроены
- [ ] Домен сгенерирован
- [ ] Webhook настроен
- [ ] Бот отвечает на команды
- [ ] Все функции работают
- [ ] Логирование настроено
- [ ] Мониторинг активен
