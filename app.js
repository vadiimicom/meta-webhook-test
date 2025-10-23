// Импорт библиотек
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

// Создаем приложение
const app = express();
app.use(express.json());

// Настройки из .env
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const n8nWebhook = process.env.N8N_WEBHOOK_URL;

// Проверка Webhook (GET-запрос от Meta)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    console.log('Expected token:', verifyToken);
    console.log('Received token:', token);
    res.sendStatus(403);
  }
});

// Прием сообщений от Meta (POST)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n📩 Webhook получен ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // Пересылаем данные в n8n
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
    console.error('❌ Ошибка при пересылке в n8n:', error.message);
  }

  // Отвечаем Meta, что всё ок
  res.status(200).end();
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер запущен и слушает порт ${port}`);
});
