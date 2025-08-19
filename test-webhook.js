const https = require('https');

// Тест webhook endpoint
function testWebhook() {
  const options = {
    hostname: 'web-telegram-bot.up.railway.app',
    port: 443,
    path: '/webhook',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Webhook статус: ${res.statusCode}`);
    console.log(`📡 Заголовки:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📡 Ответ: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Ошибка webhook: ${e.message}`);
  });

  req.end();
}

// Тест healthcheck
function testHealthcheck() {
  const options = {
    hostname: 'web-telegram-bot.up.railway.app',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`🏥 Healthcheck статус: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`🏥 Ответ: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Ошибка healthcheck: ${e.message}`);
  });

  req.end();
}

console.log('🔍 Тестирование endpoints...');
console.log('');

console.log('1. Тест healthcheck:');
testHealthcheck();

console.log('');
console.log('2. Тест webhook:');
testWebhook();
