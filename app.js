const express = require('express');
const fetch = require('node-fetch'); // для пересылки запросов
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Проверка Webhook (GET-запрос от Meta при подключении)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// Прием уведомлений (POST-запрос от Meta)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n📩 Webhook получен ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Пересылка данных из Meta → в n8n
    const response = await fetch('https://n8n.vadiimi.com/webhook-test/whatsapp', {
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
    console.error('❌ Ошибка при попытке переслать в n8n:', error.message);
  }

  res.sendStatus(200);
});

// Запуск сервера
app.listen(port, () => console.log(`🚀 Сервер запущен и слушает порт ${port}`));
