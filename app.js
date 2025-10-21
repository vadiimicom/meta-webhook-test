const express = require('express');
const fetch = require('node-fetch'); // добавили для пересылки
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Проверка webhook (GET-запрос)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Прием входящих уведомлений (POST-запрос)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\nWebhook получен ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Пересылаем всё тело запроса в n8n
    const response = await fetch('https://n8n.vadiimi.com/webhook-test/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (response.ok) {
      console.log('✅ Успешно переслано в n8n');
    } else {
      console.error('⚠️ Ошибка пересылки в n8n:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Ошибка при попытке переслать в n8n:', error.message);
  }

  res.sendStatus(200);
});

// Запуск сервера
app.listen(port, () => console.log(`Слушаю порт ${port}`));
