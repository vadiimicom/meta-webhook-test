// Импорт Express.js
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

// Создать приложение Express
const app = express();

// Промежуточное ПО для разбора тел JSON
app.use(express.json());

// Установить порт и verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const n8nWebhook = process.env.N8N_WEBHOOK_URL;

// Маршрут для GET-запросов (проверка Webhook от Meta)
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK ПРОВЕРЕН');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Ошибка проверки Webhook');
    res.status(403).end();
  }
});

// Маршрут для POST-запросов (прием данных от Meta)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n📩 Webhook получен ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // === Добавлено: пересылка в n8n ===
  try {
    const response = await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (response.ok) {
      console.log('✅ Успешно переслано в n8n');
    } else {
      console.error(`⚠️ Ошибка при пересылке в n8n: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Ошибка пересылки в n8n:', error.message);
  }
  // === Конец добавления ===

  res.status(200).end();
});

// Запустить серверное приложение
app.listen(port, () => {
  console.log(`\n🚀 Прослушивание порта ${port}\n`);
});
