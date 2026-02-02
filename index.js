const TelegramBot = require("node-telegram-bot-api");

// ===== CONFIG =====
const TOKEN = process.env.BOT_TOKEN || "YOUR_TOKEN_HERE";
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== UTIL: format số =====
function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ===== CORE: tách dòng tính tiền =====
function parseLine(line) {
  const match = line.match(/(\S+)\s+(\S+)\s+(\d+)\s*x(\d+)/i);
  if (!match) return null;

  const [_, model, version, price, qty] = match;
  const total = parseInt(price) * parseInt(qty);

  return {
    raw: `${model} ${version} ${price}x${qty}`,
    total
  };
}

// ===== MAIN FUNCTION: xử lý input =====
function processInput(text) {
  const list = text
    .match(/\S+\s+\S+\s+\d+x\d+/gi)
    ?.map(parseLine)
    .filter(Boolean);

  if (!list || list.length === 0) return null;

  let output = "";
  let sum = 0;

  list.forEach(i => {
    output += `${i.raw} : ${formatNumber(i.total)}\n`;
    sum += i.total;
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
    bot.sendMessage(chatId, "Sai định dạng!\nVí dụ: a07 6.128 2500x5 A07 4.128 2200x1");
    return;
  }

  bot.sendMessage(chatId, "```\n" + result + "\n```", {
    parse_mode: "Markdown"
  });
});

// ====== SAU NÀY BẠN CHỈ VIỆC THÊM TÍNH NĂNG NGAY DƯỚI ======
//
// ví dụ thêm command /start:
// bot.onText(/\/start/, msg => {
//   bot.sendMessage(msg.chat.id, "Hello!");
// });
//
// ví dụ thêm tính năng tính tổng theo phần trăm:
// function addVAT(){...}
//
// (bạn cứ thêm ngay dưới này cực dễ)
