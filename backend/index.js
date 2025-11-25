const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/news', async (req, res) => {
  try {
    const rssUrl =
      'https://economictimes.indiatimes.com/markets/stocks/news/rssfeeds/2146842.cms';

    const response = await axios.get(rssUrl);
    const xml = response.data;

    const result = await xml2js.parseStringPromise(xml, { mergeAttrs: true });

    const items = result.rss.channel[0].item;

    // Format the first 10 articles
    const news = items.slice(0, 10).map((item, index) => ({
      id: index + 1,
      title: item.title[0],
      summary: item.description ? item.description[0] : "Click to read article",
      url: item.link[0],
      time: item.pubDate ? item.pubDate[0] : "Recently",
      category: "Market"
    }));

    res.json(news);
  } catch (err) {
    console.error("RSS Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
