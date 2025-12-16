const cron = require('node-cron');
const TelegramSubscription = require('./models/TelegramSubscription');
const { sendNewsAlert } = require('./services/telegramBot');
const SentNews = require('./models/SentNews');


require('dotenv').config();
const { initializeBot } = require('./services/telegramBot');

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');

const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize Telegram bot
    initializeBot();
  })
  .catch(err => console.error('MongoDB connection error:', err));


// Auth routes
app.use('/api/auth', require('./routes/auth'));

app.use('/api/telegram', require('./routes/telegram'));



const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getRandomRecentTime = () => {
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
};

const analyzeSentiment = async (title, url, summary) => {
  try {
    const prompt = `You are an expert stock analyst. Analyze the following news and assign a sentiment score between -10 and 10. Where -10 is extremely bad news and 10 is extremely good news.

Scoring rules:
1. If the News headline has the stock by name in the Title, assign a score above 5 or below -5. 
2. Only assign a score greater than 7 or less than -7 if the news is about a particular stock and is likely to move that particular stock price by more than 6% up or down within the next trading day.
3. Avoid exaggerating sentiment & speculation, consider actual events that happened, not just positive or negative wording.
4. If the news is neutral or unrelated to a particular stock, assign a score between -2 and 2.

Output format (JSON only):
{
  "title": "<news title here>",
  "url": "<news url here>",
  "sentiment_score": <number between -10 and 10 following the scoring rules>
}

News:
Title: ${title}
URL: ${url}
Description: ${summary}

Respond ONLY in valid JSON exactly as shown above. Do not add extra text, explanation, or commentary.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = JSON.parse(response.data.choices[0].message.content);
    return result.sentiment_score;
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 0;
  }
};

app.get('/api/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const response = await axios.get('https://economictimes.indiatimes.com/markets/stocks/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const news = [];
    
    const selectors = ['.eachStory', '.story-box', '.contentSec'];
    
    for (const selector of selectors) {
      $(selector).slice(0, limit).each((index, element) => {
        const $element = $(element);
        
        const titleSelectors = ['h3 a', 'h4 a', 'h2 a', '.story-title a', 'a[title]'];
        let title = '';
        let url = '';
        
        for (const titleSel of titleSelectors) {
          const titleEl = $element.find(titleSel).first();
          if (titleEl.length && titleEl.text().trim()) {
            title = titleEl.text().trim();
            url = titleEl.attr('href') || '';
            break;
          }
        }
        
        const summarySelectors = ['p', '.summary', '.story-summary', '.content'];
let summary = '';

for (const sumSel of summarySelectors) {
  const sumEl = $element.find(sumSel).first();
  if (sumEl.length && sumEl.text().trim()) {
    summary = sumEl.text().trim();
    break;
  }
}

if (title && title.length > 10 && !news.find(n => n.title === title)) {
  news.push({
    id: news.length + 1,
    title: title,
    summary: summary || 'Click to read full article',
    url: url ? (url.startsWith('http') ? url : `https://economictimes.indiatimes.com${url}`) : '#',
    timestamp: new Date(Date.now() - (news.length * 60000)).toISOString(),
    category: 'Market'
  });
}


      });
      
      if (news.length >= limit) break;
    }
    
    const newsWithSentiment = await Promise.all(
      news.map(async (article) => {
        const sentiment = await analyzeSentiment(article.title, article.url, article.summary);
        return {
          ...article,
          sentiment_score: sentiment
        };
      })
    );
    
    res.json(newsWithSentiment);
    
  } catch (error) {
    console.error('Error scraping news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news from Economic Times' });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Cron job - every 30 minutes
cron.schedule('*/30 * * * *', async () => {


  try {
    console.log('🔄 Running Telegram alert cron job...');
    
    // Get all active subscriptions first
    const subscriptions = await TelegramSubscription.find({ isActive: true });
    console.log(`📱 Found ${subscriptions.length} active subscriptions`);
    
    if (subscriptions.length === 0) {
      console.log('❌ No active subscriptions found');
      return;
    }

    // Fetch latest news
    const response = await axios.get('https://economictimes.indiatimes.com/markets/stocks/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const news = [];

    const selectors = ['.eachStory', '.story-box', '.contentSec'];

    for (const selector of selectors) {
      $(selector).slice(0, 5).each((index, element) => {
        const $element = $(element);
        
        const titleSelectors = ['h3 a', 'h4 a', 'h2 a', '.story-title a', 'a[title]'];
        let title = '';
        let url = '';
        
        for (const titleSel of titleSelectors) {
          const titleEl = $element.find(titleSel).first();
          if (titleEl.length && titleEl.text().trim()) {
            title = titleEl.text().trim();
            url = titleEl.attr('href') || '';
            break;
          }
        }
        
        const summarySelectors = ['p', '.summary', '.story-summary', '.content'];
        let summary = '';

        for (const sumSel of summarySelectors) {
          const sumEl = $element.find(sumSel).first();
          if (sumEl.length && sumEl.text().trim()) {
            summary = sumEl.text().trim();
            break;
          }
        }
        
        if (title && title.length > 10 && !news.find(n => n.title === title)) {
          news.push({
            id: news.length + 1,
            title: title,
            summary: summary || 'Click to read full article',
            url: url ? (url.startsWith('http') ? url : `https://economictimes.indiatimes.com${url}`) : '#',
            timestamp: new Date(Date.now() - (news.length * 60000)).toISOString(),

            category: 'Market'
          });
        }
      });
      
      if (news.length >= 5) break;
    }

    console.log(`📰 Found ${news.length} news articles`);

    // Add sentiment analysis
    const newsWithSentiment = await Promise.all(
      news.map(async (article) => {
        const sentiment = await analyzeSentiment(article.title, article.url, article.summary);
        console.log(`📊 "${article.title}" - Score: ${sentiment}`);
        return {
          ...article,
          sentiment_score: sentiment
        };
      })
    );

    // Filter high impact news (changed to ±4)
    const highImpactNews = newsWithSentiment.filter(item => 
      Math.abs(item.sentiment_score) >= 4
    );

    console.log(`🚨 Found ${highImpactNews.length} high impact news (score ≥ 4)`);

    if (highImpactNews.length > 0) {
      // Send alerts
      for (const subscription of subscriptions) {
        console.log(`📤 Sending alerts to chat ID: ${subscription.chatId}`);
        
        for (const newsItem of highImpactNews) {
          // Check if already sent
          const alreadySent = await SentNews.findOne({ 
            title: newsItem.title, 
            url: newsItem.url 
          });
          
          if (alreadySent) {
            console.log(`⏭️ Skipping already sent: "${newsItem.title}"`);
            continue;
          }

          console.log(`🔍 Checking: Score ${newsItem.sentiment_score}, Threshold ${subscription.sentimentThreshold}, Send: ${Math.abs(newsItem.sentiment_score) >= subscription.sentimentThreshold}`);
          
          if (Math.abs(newsItem.sentiment_score) >= subscription.sentimentThreshold) {
            console.log(`✅ Sending: "${newsItem.title}" (Score: ${newsItem.sentiment_score})`);
            await sendNewsAlert(subscription.chatId, newsItem);
            
            // Mark as sent (only create once per news item)
            try {
              await SentNews.create({
                title: newsItem.title,
                url: newsItem.url
              });
            } catch (error) {
              // Ignore duplicate key errors
              if (error.code !== 11000) {
                console.error('Error saving sent news:', error);
              }
            }
          }
        }
      }
    } else {
      console.log('📭 No high impact news to send');
    }
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
