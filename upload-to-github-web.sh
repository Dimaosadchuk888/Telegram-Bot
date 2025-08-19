#!/bin/bash

echo "🚀 ЗАГРУЗКА НА GITHUB ЧЕРЕЗ ВЕБ-ИНТЕРФЕЙС"
echo "========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📋 ИНСТРУКЦИИ ПО ЗАГРУЗКЕ:${NC}"
echo ""
echo "1. Откройте браузер и перейдите на:"
echo -e "${YELLOW}   https://github.com/Dimaosadchuk888/Telegram-Bot${NC}"
echo ""
echo "2. Нажмите кнопку 'Add file' → 'Upload files'"
echo ""
echo "3. Загрузите следующие файлы и папки:"
echo -e "${GREEN}   ✅ package.json${NC}"
echo -e "${GREEN}   ✅ package-lock.json${NC}"
echo -e "${GREEN}   ✅ README.md${NC}"
echo -e "${GREEN}   ✅ TESTING.md${NC}"
echo -e "${GREEN}   ✅ DEPLOYMENT.md${NC}"
echo -e "${GREEN}   ✅ GITHUB_ACTIONS_SETUP.md${NC}"
echo -e "${GREEN}   ✅ ecosystem.config.js${NC}"
echo -e "${GREEN}   ✅ railway.json${NC}"
echo -e "${GREEN}   ✅ .gitignore${NC}"
echo -e "${GREEN}   ✅ src/ (вся папка)${NC}"
echo -e "${GREEN}   ✅ .github/ (вся папка)${NC}"
echo ""
echo "4. НЕ загружайте:"
echo -e "${YELLOW}   ❌ .env (секретные данные)${NC}"
echo -e "${YELLOW}   ❌ node_modules/ (слишком большой)${NC}"
echo -e "${YELLOW}   ❌ logs/ (локальные логи)${NC}"
echo -e "${YELLOW}   ❌ .git/ (Git данные)${NC}"
echo -e "${YELLOW}   ❌ .DS_Store (системные файлы)${NC}"
echo ""
echo "5. В поле 'Commit changes' напишите:"
echo -e "${GREEN}   'Initial commit: Telegram Farming Bot with UI buttons and balance logic'${NC}"
echo ""
echo "6. Нажмите 'Commit changes'"
echo ""

echo -e "${BLUE}📁 ФАЙЛЫ ДЛЯ ЗАГРУЗКИ В ТЕКУЩЕЙ ПАПКЕ:${NC}"
echo ""
ls -la | grep -E "\.(js|json|md)$|^src$|^\.github$|^package\.json$|^README\.md$|^railway\.json$|^ecosystem\.config\.js$|^\.gitignore$" | grep -v node_modules
echo ""

echo -e "${BLUE}📂 СОДЕРЖИМОЕ ПАПКИ src/:${NC}"
echo ""
ls -la src/
echo ""

echo -e "${BLUE}📂 СОДЕРЖИМОЕ ПАПКИ .github/:${NC}"
echo ""
ls -la .github/
echo ""

echo -e "${GREEN}✅ После загрузки на GitHub:${NC}"
echo ""
echo "1. Перейдите на https://railway.app"
echo "2. Войдите через GitHub"
echo "3. Нажмите 'New Project'"
echo "4. Выберите 'Deploy from GitHub repo'"
echo "5. Выберите репозиторий 'Telegram-Bot'"
echo ""
echo "📝 Переменные окружения для Railway:"
echo "BOT_TOKEN=your_actual_bot_token_here"
echo "NODE_ENV=production"
echo "WEBHOOK_URL=https://your-railway-domain.railway.app/webhook"
echo "PORT=3000"
echo ""

echo -e "${GREEN}🎉 Готово! Следуйте инструкциям выше.${NC}"
