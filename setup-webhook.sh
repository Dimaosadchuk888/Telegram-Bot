#!/bin/bash

echo "🌐 НАСТРОЙКА WEBHOOK ДЛЯ TELEGRAM BOT"
echo "====================================="
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WEBHOOK_URL="https://web-telegram-bot.up.railway.app/webhook"

echo -e "${BLUE}📋 Настройка webhook для домена:${NC}"
echo -e "${YELLOW}$WEBHOOK_URL${NC}"
echo ""

echo -e "${BLUE}📋 Для настройки webhook нужен BOT_TOKEN${NC}"
echo ""
echo "Получите токен:"
echo "1. Найдите @BotFather в Telegram"
echo "2. Отправьте /newbot"
echo "3. Следуйте инструкциям"
echo "4. Скопируйте полученный токен"
echo ""

read -s -p "Введите ваш BOT_TOKEN: " bot_token
echo ""

if [ -z "$bot_token" ]; then
    echo -e "${RED}❌ Токен не введен${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔄 Настройка webhook...${NC}"

# Настройка webhook через Telegram API
response=$(curl -s -X POST "https://api.telegram.org/bot${bot_token}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\"}")

echo "Ответ от Telegram API:"
echo "$response"
echo ""

# Проверка ответа
if echo "$response" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Webhook успешно настроен!${NC}"
    echo ""
    echo "📋 Проверка webhook:"
    echo "1. Убедитесь, что бот запущен на Railway"
    echo "2. Отправьте /start вашему боту в Telegram"
    echo "3. Проверьте логи в Railway Dashboard"
    echo ""
    echo "🌐 Ваш webhook URL:"
    echo -e "${YELLOW}$WEBHOOK_URL${NC}"
    echo ""
    echo "📝 Переменные окружения для Railway:"
    echo "BOT_TOKEN=$bot_token"
    echo "NODE_ENV=production"
    echo "WEBHOOK_URL=$WEBHOOK_URL"
    echo "PORT=3000"
else
    echo -e "${RED}❌ Ошибка при настройке webhook${NC}"
    echo ""
    echo "Возможные причины:"
    echo "1. Неверный токен бота"
    echo "2. Бот не запущен на Railway"
    echo "3. Домен недоступен"
    echo ""
    echo "Проверьте:"
    echo "1. Правильность токена"
    echo "2. Статус деплоя на Railway"
    echo "3. Доступность домена: $WEBHOOK_URL"
fi

echo ""
echo -e "${BLUE}🔍 Дополнительные команды:${NC}"
echo ""
echo "Проверить текущий webhook:"
echo "curl https://api.telegram.org/bot${bot_token}/getWebhookInfo"
echo ""
echo "Удалить webhook (для локальной разработки):"
echo "curl -X POST https://api.telegram.org/bot${bot_token}/deleteWebhook"
