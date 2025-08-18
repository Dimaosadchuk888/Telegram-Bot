# 🔄 GitHub Actions - Автоматический деплой

## 🚀 Настройка автоматического деплоя

### 1. Получение Railway Token

1. Перейдите на [Railway Dashboard](https://railway.app/dashboard)
2. Войдите в свой аккаунт
3. Перейдите в "Account Settings" → "Tokens"
4. Нажмите "Create Token"
5. Скопируйте полученный токен

### 2. Добавление секрета в GitHub

1. Перейдите в ваш репозиторий на GitHub
2. Нажмите "Settings" → "Secrets and variables" → "Actions"
3. Нажмите "New repository secret"
4. Имя: `RAILWAY_TOKEN`
5. Значение: вставьте скопированный токен
6. Нажмите "Add secret"

### 3. Активация GitHub Actions

После добавления секрета:
1. GitHub Actions автоматически активируется
2. При каждом push в ветку `main` будет запускаться деплой
3. Проверьте статус в вкладке "Actions" вашего репозитория

## 📋 Workflow файл

Файл `.github/workflows/deploy.yml` содержит:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: |
        echo "Running basic syntax check..."
        node -c src/bot.js
        node -c src/handlers.js
        node -c src/keyboards.js
        node -c src/database.js
        node -c src/admin.js
        echo "✅ All files passed syntax check"
        
    - name: Deploy to Railway
      uses: railway/deploy@v1
      with:
        railway_token: ${{ secrets.RAILWAY_TOKEN }}
        service: telegram-bot
```

## 🔍 Мониторинг деплоя

### Проверка статуса
1. Перейдите в ваш репозиторий на GitHub
2. Нажмите вкладку "Actions"
3. Выберите последний workflow
4. Проверьте статус каждого шага

### Логи деплоя
- В GitHub Actions: вкладка "Actions" → выберите workflow → "deploy" job
- В Railway: Dashboard → ваш проект → "Deployments" → последний деплой

## 🛠️ Устранение неполадок

### Проблема: "RAILWAY_TOKEN not found"
**Решение**: Добавьте секрет `RAILWAY_TOKEN` в настройках репозитория

### Проблема: "Deployment failed"
**Решение**: 
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что переменные окружения настроены
3. Проверьте, что проект существует в Railway

### Проблема: "Syntax error"
**Решение**: 
1. Проверьте синтаксис файлов локально: `node -c src/bot.js`
2. Исправьте ошибки и сделайте новый коммит

## 📈 Преимущества автоматического деплоя

✅ **Автоматизация**: Каждый push = новый деплой
✅ **Тестирование**: Проверка синтаксиса перед деплоем
✅ **Мониторинг**: Логи и статус в GitHub
✅ **Безопасность**: Токены хранятся в секретах
✅ **Откат**: Возможность откатиться к предыдущей версии

## 🔄 Ручной запуск

Если нужно запустить деплой вручную:
1. Перейдите в "Actions" на GitHub
2. Выберите workflow "Deploy to Railway"
3. Нажмите "Run workflow"
4. Выберите ветку и нажмите "Run workflow"

## 📞 Поддержка

### Полезные ссылки:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Deploy Action](https://github.com/railwayapp/deploy-action)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### Команды для отладки:
```bash
# Локальная проверка синтаксиса
node -c src/bot.js

# Проверка зависимостей
npm ci

# Тестовый запуск
npm start
```
