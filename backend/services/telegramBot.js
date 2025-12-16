const TelegramBot = require('node-telegram-bot-api');

// Initialize bot only if token exists
let bot = null;

const initializeBot = () => {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
    
    // Handle /start command
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, `🚀 Welcome to Turingist Stock News Bot!

Your Chat ID: ${chatId}

Use this Chat ID on turingist.com to subscribe to news alerts.

Commands:
/start - Get your Chat ID
/help - Show help`);
    });
  }
  return bot;
};

// Send news alert
const sendNewsAlert = async (chatId, newsItem) => {
  const botInstance = initializeBot();
  if (!botInstance) {
    console.error('Telegram bot not initialized');
    return;
  }

  const emoji = newsItem.sentiment_score > 0 ? '📈' : '📉';
const message = `${emoji} *${newsItem.title}*

📊 Score: ${newsItem.sentiment_score}

[Read More](${newsItem.url})`;



  try {
    await botInstance.sendMessage(chatId, message, {parse_mode: 'Markdown'});
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

module.exports = { initializeBot, sendNewsAlert };
