import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Настройки из .env
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// ✅ Проверка Webhook (GET запрос от Meta)
app.get("/", (req, res) => {
  console.log("➡️ Запрос на верификацию Webhook:", req.query);

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Ошибка верификации Webhook");
    console.log("Ожидался токен:", VERIFY_TOKEN);
    console.log("Получен токен:", token);
    res.sendStatus(403);
  }
});

// 📩 Прием уведомлений (POST от Meta)
app.post("/", async (req, res) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.log(`\n📩 Webhook получен ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    if (response.ok) {
      console.log("✅ Успешно переслано в n8n");
    } else {
      console.error(`⚠️ Ошибка при пересылке в n8n: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("❌ Ошибка при пересылке в n8n:", error.message);
  }

  res.sendStatus(200);
});

// 🚀 Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен и слушает порт ${PORT}`);
});
