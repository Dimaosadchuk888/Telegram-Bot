#!/bin/bash

echo "🔍 ПРОВЕРКА И НАСТРОЙКА WEBHOOK"
echo "================================"
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

WEBHOOK_URL="https://web-telegram-bot.up.railway.app/webhook"

echo -e "${BLUE}📋 Проверка healthcheck...${NC}"
healthcheck_response=$(curl -s https://web-telegram-bot.up.railway.app/health)
echo "Healthcheck ответ: $healthcheck_response"
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
echo -e "${BLUE}🔍 Проверка текущего webhook...${NC}"
webhook_info=$(curl -s "https://api.telegram.org/bot${bot_token}/getWebhookInfo")
echo "Информация о webhook:"
echo "$webhook_info"
echo ""

echo -e "${BLUE}🔄 Настройка webhook...${NC}"
webhook_response=$(curl -s -X POST "https://api.telegram.org/bot${bot_token}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\"}")

echo "Ответ от Telegram API:"
echo "$webhook_response"
echo ""

# Проверка ответа
if echo "$webhook_response" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ Webhook успешно настроен!${NC}"
    echo ""
    echo "📋 Теперь проверьте бота:"
    echo "1. Найдите вашего бота в Telegram"
    echo "2. Отправьте /start"
    echo "3. Должно появиться меню с кнопками"
    echo ""
    echo "🌐 Ваш webhook URL:"
    echo -e "${YELLOW}$WEBHOOK_URL${NC}"
else
    echo -e "${RED}❌ Ошибка при настройке webhook${NC}"
    echo ""
    echo "Возможные причины:"
    echo "1. Неверный токен бота"
    echo "2. Бот не существует"
    echo "3. Проблемы с доменом"
    echo ""
    echo "Проверьте:"
    echo "1. Правильность токена"
    echo "2. Существование бота"
    echo "3. Доступность домена: $WEBHOOK_URL"
fi

echo ""
echo -e "${BLUE}🔍 Дополнительные команды:${NC}"
echo ""
echo "Проверить webhook:"
echo "curl https://api.telegram.org/bot${bot_token}/getWebhookInfo"
echo ""
echo "Удалить webhook:"
echo "curl -X POST https://api.telegram.org/bot${bot_token}/deleteWebhook"
echo ""
echo "Проверить бота:"
echo "curl https://api.telegram.org/bot${bot_token}/getMe"
