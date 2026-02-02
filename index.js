const TelegramBot = require("node-telegram-bot-api");

// ===== CONFIG =====
const TOKEN = process.env.BOT_TOKEN || "8594059208:AAGLGk7M9tOOqMXYCYv-C6R0RSwmnt53M4o";
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== FORMAT NUMBER =====
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ===== EXTRACT PRICE "2500x5" =====
function extractPrice(line) {
  const match = line.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return null;
  const price = parseInt(match[1]);
  const qty = parseInt(match[2]);
  return { total: price * qty };
}

// ===== PROCESS USER INPUT =====
function processInput(text) {
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) return null;

  let output = "";
  let sum = 0;

  lines.forEach((line, index) => {
    const priceInfo = extractPrice(line);
    if (!priceInfo) return;

    const total = priceInfo.total;
    sum += total;

    output += `${index + 1}. ${line} : ${formatNumber(total)}\n`;
  });

  output += "-------------------------\n";
  output += `Tổng ${formatNumber(sum)}`;

  return output;
}

// ===== BOT LISTENER =====
bot.on("message", msg => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const result = processInput(text);

  if (!result) {
    bot.sendMessage(chatId, "Sai định dạng!\nVí dụ:\na07 6.128 2500x5\nA07 4.128 2200x1");
    return;
  }

  bot.sendMessage(chatId, "```\n" + result + "\n```", {
    parse_mode: "Markdown"
  });
});

console.log("BOT ĐÃ CHẠY...");
