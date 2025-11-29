require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
            timestamp: getRandomRecentTime().toISOString(),
            time: 'Recently',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
