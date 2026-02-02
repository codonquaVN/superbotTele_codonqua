const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===== CONFIG =====
const TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://superbottele-codonqua.onrender.com/webhook";

if (!TOKEN) {
  console.error("❌ BOT_TOKEN chưa được cấu hình trong Render!");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN);
const app = express();

app.use(express.json());

// Set Webhook
bot.setWebHook(WEBHOOK_URL);

console.log("🔗 Webhook đã kết nối:", WEBHOOK_URL);

// ===== FORMAT NUMBER =====
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ===== EXTRACT PRICE "2500x5" =====
function extractPrice(line) {
  const match = line.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return null;
  return parseInt(match[1]) * parseInt(match[2]);
}

// ===== PROCESS INPUT =====
function processInput(text) {
  const lines = text.split("\n").map(x => x.trim()).filter(Boolean);
  if (!lines.length) return null;

  let output = "";
  let sum = 0;

  lines.forEach((line, index) => {
    const total = extractPrice(line);
    if (!total) return;

    sum += total;
    output += `${index + 1}. ${line} : ${formatNumber(total)}\n`;
  });

  output += "-------------------------\n";
  output += `Tổng ${formatNumber(sum)}`;

  return output;
}

// ===== WEBHOOK HANDLER =====
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ===== BOT MESSAGE LISTENER =====
bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  const result = processInput(text);

  if (!result) {
    bot.sendMessage(chatId, "Sai định dạng!\nVí dụ:\na07 6.128 2500x5\nA07 4.128 2200x1");
    return;
  }

  bot.sendMessage(chatId, "```\n" + result + "\n```", {
    parse_mode: "Markdown"
  });
});

// ===== ROOT CHECK =====
app.get("/", (req, res) => {
  res.send("Bot Telegram đã chạy trên Render!");
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server chạy cổng", PORT);
});
