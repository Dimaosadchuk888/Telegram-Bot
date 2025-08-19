#!/bin/bash

echo "🔐 НАСТРОЙКА АУТЕНТИФИКАЦИИ GITHUB"
echo "==================================="
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}📋 Для push в GitHub нужен Personal Access Token${NC}"
echo ""
echo "Создайте токен:"
echo "1. Перейдите на https://github.com/settings/tokens"
echo "2. Нажмите 'Generate new token (classic)'"
echo "3. Выберите права: 'repo' (полный доступ к репозиториям)"
echo "4. Скопируйте токен"
echo ""

read -s -p "Введите ваш Personal Access Token: " token
echo ""

if [ -z "$token" ]; then
    echo -e "${RED}❌ Токен не введен${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Настройка удаленного репозитория с токеном...${NC}"

# Обновляем URL с токеном
git remote set-url origin https://${token}@github.com/Dimaosadchuk888/Telegram-Bot.git

echo -e "${GREEN}✅ URL обновлен${NC}"

echo ""
echo -e "${BLUE}🚀 Попытка push на GitHub...${NC}"

# Пробуем push
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}🎉 УСПЕХ! Код загружен на GitHub!${NC}"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Перейдите на https://github.com/Dimaosadchuk888/Telegram-Bot"
    echo "2. Убедитесь, что все файлы загружены"
    echo "3. Настройте Railway для деплоя"
    echo ""
    echo "🌐 Настройка Railway:"
    echo "1. Перейдите на https://railway.app"
    echo "2. Войдите через GitHub"
    echo "3. Создайте новый проект"
    echo "4. Выберите репозиторий 'Telegram-Bot'"
    echo ""
    echo "📝 Переменные окружения для Railway:"
    echo "BOT_TOKEN=your_actual_bot_token_here"
    echo "NODE_ENV=production"
    echo "WEBHOOK_URL=https://your-railway-domain.railway.app/webhook"
    echo "PORT=3000"
else
    echo ""
    echo -e "${RED}❌ Ошибка при push${NC}"
    echo ""
    echo "Возможные причины:"
    echo "1. Неверный токен"
    echo "2. Недостаточно прав"
    echo "3. Репозиторий не существует"
    echo ""
    echo "Попробуйте:"
    echo "1. Проверить токен на https://github.com/settings/tokens"
    echo "2. Создать репозиторий на GitHub вручную"
    echo "3. Использовать веб-интерфейс для загрузки файлов"
fi
