const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");

// ===== CONFIG =====
const TOKEN = process.env.BOT_TOKEN || "8594059208:AAGLGk7M9tOOqMXYCYv-C6R0RSwmnt53M4o";
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://superbottele-codonqua.onrender.com/webhook";

const bot = new TelegramBot(TOKEN);
const app = express();

bot.setWebHook(`${WEBHOOK_URL}`);

app.use(bodyParser.json());

// ===== FORMAT NUMBER =====
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ===== EXTRACT PRICE =====
function extractPrice(line) {
  const match = line.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return null;
  const price = parseInt(match[1]);
  const qty = parseInt(match[2]);
  return { total: price * qty };
}

// ===== PROCESS USER INPUT =====
function processInput(text, showIndex = true) {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return null;

  let output = "";
  let sum = 0;

  lines.forEach((line, index) => {
    const p = extractPrice(line);
    if (!p) return;

    sum += p.total;

    const prefix = showIndex ? `${index + 1}. ` : "";  // bật/tắt số thứ tự
    output += `${prefix}${line} : ${formatNumber(p.total)}\n`;
  });

  output += "-------------------------\n";
  output += `Tổng: ${formatNumber(sum)}`;

  return output;
}

// ===== WEBHOOK LISTENER =====
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ===== BOT REPLY =====
bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  const result = processInput(text);

  if (!result) {
    bot.sendMessage(chatId, "Sai định dạng!\n\nVí dụ:\na07 6.128 2500x5\nA07 4.128 2200x1");
    return;
  }

  bot.sendMessage(chatId, "```\n" + result + "\n```", {
    parse_mode: "Markdown"
  });
});

app.get("/", (req, res) => {
  res.send("Bot đang chạy Render!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running:", PORT);
});
