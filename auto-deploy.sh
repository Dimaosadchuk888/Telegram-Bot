#!/bin/bash

echo "🚀 АВТОМАТИЧЕСКИЙ ДЕПЛОЙ TELEGRAM BOT"
echo "======================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Проверка наличия необходимых файлов
step "Проверка файлов проекта..."
if [ ! -f "package.json" ]; then
    error "package.json не найден!"
    exit 1
fi

if [ ! -d "src" ]; then
    error "Папка src не найдена!"
    exit 1
fi

log "Все файлы проекта найдены ✓"

# Проверка Git
step "Проверка Git репозитория..."
if [ ! -d ".git" ]; then
    log "Инициализация Git репозитория..."
    git init
fi

# Добавление файлов в Git
step "Добавление файлов в Git..."
git add .

# Проверка статуса
if git diff --cached --quiet; then
    warning "Нет изменений для коммита"
else
    log "Создание коммита..."
    git commit -m "Auto-deploy: Telegram Farming Bot with UI buttons and balance logic"
fi

# Настройка удаленного репозитория
step "Настройка GitHub репозитория..."
if ! git remote get-url origin > /dev/null 2>&1; then
    git remote add origin https://github.com/Dimaosadchuk888/Telegram-Bot.git
    log "Удаленный репозиторий добавлен"
else
    log "Удаленный репозиторий уже настроен"
fi

# Переименование ветки в main
git branch -M main

# Попытка загрузки на GitHub
step "Загрузка на GitHub..."
echo ""
warning "Для загрузки на GitHub нужна аутентификация."
echo ""
echo "Выберите способ аутентификации:"
echo "1. Personal Access Token (рекомендуется)"
echo "2. GitHub CLI"
echo "3. Ручная загрузка через веб-интерфейс"
echo ""

read -p "Введите номер варианта (1-3): " choice

case $choice in
    1)
        echo ""
        log "Настройка Personal Access Token..."
        echo "1. Перейдите на https://github.com/settings/tokens"
        echo "2. Нажмите 'Generate new token (classic)'"
        echo "3. Выберите 'repo' права"
        echo "4. Скопируйте токен"
        echo ""
        read -s -p "Введите ваш Personal Access Token: " token
        echo ""
        
        if [ ! -z "$token" ]; then
            git remote set-url origin https://${token}@github.com/Dimaosadchuk888/Telegram-Bot.git
            log "Попытка загрузки на GitHub..."
            if git push -u origin main; then
                log "✅ Код успешно загружен на GitHub!"
            else
                error "❌ Ошибка при загрузке на GitHub"
                echo "Попробуйте вариант 3 - ручную загрузку"
            fi
        else
            error "Токен не введен"
        fi
        ;;
    2)
        echo ""
        log "Установка GitHub CLI..."
        if command -v brew &> /dev/null; then
            brew install gh
        else
            warning "Homebrew не установлен. Установите GitHub CLI вручную:"
            echo "https://cli.github.com/"
            echo "Затем выполните: gh auth login"
        fi
        ;;
    3)
        echo ""
        log "Ручная загрузка через веб-интерфейс"
        echo ""
        echo "📋 Инструкции:"
        echo "1. Откройте https://github.com/Dimaosadchuk888/Telegram-Bot"
        echo "2. Нажмите 'Add file' → 'Upload files'"
        echo "3. Загрузите все файлы из текущей папки (кроме .git и node_modules)"
        echo "4. Добавьте описание: 'Auto-deploy: Telegram Farming Bot'"
        echo "5. Нажмите 'Commit changes'"
        echo ""
        echo "Файлы для загрузки:"
        ls -la | grep -E "\.(js|json|md|sh)$|^src$|^package\.json$|^README\.md$|^railway\.json$"
        echo ""
        ;;
    *)
        error "Неверный выбор"
        exit 1
        ;;
esac

# Настройка Railway
echo ""
step "Настройка Railway..."
echo ""
log "После загрузки на GitHub:"
echo "1. Перейдите на https://railway.app"
echo "2. Войдите через GitHub"
echo "3. Нажмите 'New Project'"
echo "4. Выберите 'Deploy from GitHub repo'"
echo "5. Выберите репозиторий 'Telegram-Bot'"
echo ""

# Переменные окружения для Railway
echo "📝 Переменные окружения для Railway:"
echo "BOT_TOKEN=your_actual_bot_token_here"
echo "NODE_ENV=production"
echo "WEBHOOK_URL=https://your-railway-domain.railway.app/webhook"
echo "PORT=3000"
echo ""

# Создание файла с инструкциями
cat > RAILWAY_SETUP.md << 'EOF'
# 🚀 Настройка Railway

## Быстрые шаги:

1. **Перейдите на Railway**: https://railway.app
2. **Войдите через GitHub**
3. **Создайте новый проект**: "New Project"
4. **Выберите репозиторий**: "Deploy from GitHub repo"
5. **Выберите**: Dimaosadchuk888/Telegram-Bot

## Переменные окружения:

Добавьте в Railway Dashboard:

```
BOT_TOKEN=your_actual_bot_token_here
NODE_ENV=production
WEBHOOK_URL=https://your-railway-domain.railway.app/webhook
PORT=3000
```

## Получение токена бота:

1. Найдите @BotFather в Telegram
2. Отправьте /newbot
3. Следуйте инструкциям
4. Скопируйте полученный токен

## Проверка работы:

1. Дождитесь деплоя (зеленый статус)
2. Найдите вашего бота в Telegram
3. Отправьте /start
4. Проверьте все функции меню

## Логи и отладка:

- В Railway Dashboard → Deployments → View Logs
- Проверьте, что бот запустился без ошибок
- Убедитесь, что webhook настроен корректно
EOF

log "✅ Файл RAILWAY_SETUP.md создан с инструкциями"

echo ""
log "🎉 Автоматический деплой завершен!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Загрузите код на GitHub (выше)"
echo "2. Настройте Railway (см. RAILWAY_SETUP.md)"
echo "3. Получите токен бота у @BotFather"
echo "4. Добавьте переменные окружения в Railway"
echo "5. Протестируйте бота в Telegram"
echo ""
echo "📚 Документация:"
echo "- README.md - общая информация"
echo "- TESTING.md - инструкции по тестированию"
echo "- DEPLOYMENT.md - подробный гайд по деплою"
echo "- RAILWAY_SETUP.md - настройка Railway"
echo ""
