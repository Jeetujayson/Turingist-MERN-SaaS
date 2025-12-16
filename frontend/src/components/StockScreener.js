import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';

// Configurable limit - change this number anytime
const FREE_REFRESH_LIMIT = 3;


function StockScreener({ user, onLogout, onShowAuth }) {

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('latest');
  const [refreshCount, setRefreshCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [chatId, setChatId] = useState('');
  const [sentimentThreshold, setSentimentThreshold] = useState(8);



  const fetchNews = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/news?limit=${limit}`);

    if (!res.ok) throw new Error('Network error');

    const data = await res.json();
    setNews(data);
    console.log('News data:', data[0]); // Log first article to see structure

  } catch (err) {
    console.error(err);
    setError('Unable to fetch latest news. Please try again.');
  } finally {
    setLoading(false);
  }
}, [limit]);

useEffect(() => {
  // Count initial page load as a refresh for non-logged users
  if (!user) {
    const count = parseInt(localStorage.getItem('refreshCount') || '0');
    if (count >= FREE_REFRESH_LIMIT) {
      setShowLoginPrompt(true);
      return; // Don't fetch news if limit reached
    }
    
    // Increment counter for initial load
    const newCount = count + 1;
    setRefreshCount(newCount);
    localStorage.setItem('refreshCount', newCount.toString());
  }
  
  fetchNews();
}, [fetchNews, user]);


useEffect(() => {
  if (!user) {
    const count = parseInt(localStorage.getItem('refreshCount') || '0');
    setRefreshCount(count);
    if (count >= FREE_REFRESH_LIMIT) {
      setShowLoginPrompt(true);
    }
  } else {
    // Only hide the login prompt when user logs in, don't reset count
    setShowLoginPrompt(false);
  }
}, [user]);



  const refreshNews = () => {
  if (!user) {
    if (refreshCount >= FREE_REFRESH_LIMIT) {
      setShowLoginPrompt(true);
      return;
    }
    
    const newCount = refreshCount + 1;
    setRefreshCount(newCount);
    localStorage.setItem('refreshCount', newCount.toString());
  }
  
  fetchNews();
};


  const sortNews = (newsArray, sortType) => {
    return [...newsArray].sort((a, b) => {
      if (sortType === 'bullish') {
        if (a.sentiment_score !== b.sentiment_score) {
          return b.sentiment_score - a.sentiment_score;
        }
        return new Date(b.timestamp || new Date()) - new Date(a.timestamp || new Date());
      } else if (sortType === 'bearish') {
        if (a.sentiment_score !== b.sentiment_score) {
          return a.sentiment_score - b.sentiment_score;
        }
        return new Date(b.timestamp || new Date()) - new Date(a.timestamp || new Date());
      } else {
        return new Date(b.timestamp || new Date()) - new Date(a.timestamp || new Date());
      }
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Market: '#007aff',
      Earnings: '#34c759',
      'FII/DII': '#ff9f0a',
      Stocks: '#ff2d92',
      Analysis: '#5856d6',
      Policy: '#af52de',
      Auto: '#ff6482',
      IT: '#5ac8fa',
      Commodities: '#ffcc02'
    };
    return colors[category] || '#a1a1a6';
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
  <>
    <Header user={user} onLogout={onLogout} onShowAuth={onShowAuth} />

    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, #1a1a1a 0%, #000 70%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
        color: '#f5f5f7',
        padding: '40px 24px'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px', marginTop: '100px' }}>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            marginBottom: '16px',
            background:
              'linear-gradient(270deg, #007aff, #5856d6, #af52de, #ff2d92, #007aff)',
            backgroundSize: '400% 400%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientMove 3s ease-in-out infinite'
          }}
        >
          AI Stock News Sentiment
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: '#a1a1a6',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          Latest stock market news with AI-powered sentiment analysis
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Controls */}
                <div
          style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: window.innerWidth <= 768 ? 'stretch' : 'center',
            gap: window.innerWidth <= 768 ? '16px' : '0',
            marginBottom: '32px',
            background: 'rgba(28, 28, 30, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >

          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#f5f5f7', margin: 0 }}>
              Latest News
            </h2>
            <p style={{ color: '#a1a1a6', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              {loading ? 'Loading...' : `${news.length} articles found`}
              {!user && (
  <div style={{ color: '#ff9f0a', fontSize: '0.8rem', marginTop: '4px' }}>
    Free refreshes: {refreshCount}/{FREE_REFRESH_LIMIT}
  </div>
)}

            </p>
          </div>
          
          <div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: window.innerWidth <= 768 ? '8px' : '16px',
  flexWrap: 'wrap',
  justifyContent: window.innerWidth <= 768 ? 'space-between' : 'flex-start'
}}>

            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ color: '#a1a1a6', fontSize: '0.9rem' }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(28, 28, 30, 0.8)',
                  color: '#f5f5f7',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="latest">Latest First</option>
                <option value="bullish">Bullish First</option>
                <option value="bearish">Bearish First</option>
              </select>
            </div>

            {/* Limit Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ color: '#a1a1a6', fontSize: '0.9rem' }}>Articles:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(28, 28, 30, 0.8)',
                  color: '#f5f5f7',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>

            <button
              onClick={refreshNews}
              disabled={loading}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                background: loading
                  ? 'rgba(142, 142, 147, 0.3)'
                  : 'linear-gradient(135deg, #007aff, #5856d6)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>

                        {/* Telegram Alert Button - Only for logged in users */}
            {user && (
              <button
                onClick={() => setShowTelegramModal(true)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0088cc, #229ed9)',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📱 Get Telegram Alerts
              </button>
            )}


          </div>
        </div>

        {/* News List */}
        {/* Login Prompt Overlay */}
{showLoginPrompt && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: 'rgba(28, 28, 30, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '40px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      textAlign: 'center',
      maxWidth: '400px'
    }}>
      <h2 style={{ color: '#f5f5f7', marginBottom: '20px' }}>
        Free Trial Limit Reached
      </h2>
      <p style={{ color: '#a1a1a6', marginBottom: '30px' }}>
        You've used all {FREE_REFRESH_LIMIT} free refreshes. Register for unlimited access!
      </p>

      {/* <button
        onClick={onShowAuth}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: 'linear-gradient(135deg, #007aff, #5856d6)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Register Now
      </button> */}

      {/* DEVELOPMENT CODE DELETE IN PRODUCTION */}
            <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onShowAuth}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #007aff, #5856d6)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Register Now
        </button>
        

        <button
          onClick={() => {
            localStorage.removeItem('refreshCount');
            setRefreshCount(0);
            setShowLoginPrompt(false);
          }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ff453a',
            background: 'transparent',
            color: '#ff453a',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Reset Trial
        </button>
      </div>
{/* DEVELOPMENT CODE DELETE IN PRODUCTION */}

    </div>
  </div>
)}

        {/* Telegram Modal */}
        {showTelegramModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'rgba(28, 28, 30, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '40px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ color: '#f5f5f7', marginBottom: '20px', textAlign: 'center' }}>
                📱 Get Telegram News Alerts
              </h2>
              
              <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0, 136, 204, 0.1)', borderRadius: '12px', border: '1px solid rgba(0, 136, 204, 0.3)' }}>
                <p style={{ color: '#0088cc', fontSize: '0.9rem', margin: 0 }}>
                  <strong>Step 1:</strong> Message our bot on Telegram: <strong>@turingist_stock_news_bot</strong>
                </p>
                <p style={{ color: '#0088cc', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
                  <strong>Step 2:</strong> Send /start to get your Chat ID
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#f5f5f7', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
                  Your Chat ID:
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="Enter your Chat ID from the bot"

                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(28, 28, 30, 0.8)',
                    color: '#f5f5f7',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ color: '#f5f5f7', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
                  Alert Threshold:
                </label>
                <select
                    value={sentimentThreshold}
                    onChange={(e) => setSentimentThreshold(parseInt(e.target.value))}
                    style={{

                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(28, 28, 30, 0.8)',
                    color: '#f5f5f7',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={8}>High Impact (Score ≥ 8 or ≤ -8)</option>
                  <option value={6}>Medium Impact (Score ≥ 6 or ≤ -6)</option>
                  <option value={4}>Low Impact (Score ≥ 4 or ≤ -4)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowTelegramModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#a1a1a6',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
  try {
    const response = await fetch('/api/telegram/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        sentimentThreshold
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      alert('✅ Successfully subscribed to Telegram alerts!');
      setChatId('');
      setSentimentThreshold(8);
    } else {
      alert('❌ ' + data.error);
    }
  } catch (error) {
    alert('❌ Failed to subscribe. Please try again.');
  }
  
  setShowTelegramModal(false);
}}

                  disabled={!chatId}

                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: chatId ? 'linear-gradient(135deg, #0088cc, #229ed9)' : 'rgba(142, 142, 147, 0.3)',
                    color: 'white',
                    fontSize: '0.9rem',
                    cursor: chatId ? 'pointer' : 'not-allowed'
                  }}

                >
                  Subscribe to Alerts
                </button>
              </div>
            </div>
          </div>
        )}


        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📰</div>
            <p style={{ color: '#a1a1a6' }}>Loading latest news...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>❌</div>
            <p style={{ color: '#ff453a' }}>{error}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sortNews(news, sortBy).map((article) => (
              <div
                key={article.id}
                onClick={() => window.open(article.url, '_blank')}
                style={{
                  background: 'rgba(28, 28, 30, 0.8)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div
                    style={{
                      padding: '6px 12px',
                      background: `${getCategoryColor(article.category)}20`,
                      color: getCategoryColor(article.category),
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {article.category}
                  </div>
                  <div style={{ color: '#a1a1a6', fontSize: '0.9rem' }}>
                    {formatDateTime(article.timestamp)}
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#f5f5f7',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}
                >
                  {article.title}
                </h3>

                <p
                  style={{
                    color: '#a1a1a6',
                    lineHeight: '1.6',
                    fontSize: '1rem',
                    marginBottom: '16px'
                  }}
                >
                  {article.summary}
                </p>

                {/* Sentiment Score */}
                {article.sentiment_score !== undefined && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: article.sentiment_score > 0 
                              ? '#34c759' 
                              : article.sentiment_score < 0 
                              ? '#ff453a' 
                              : '#8e8e93'
                          }}
                        >
                          {article.sentiment_score > 0 ? '+' : ''}{article.sentiment_score}
                        </div>
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: article.sentiment_score > 0 
                              ? '#34c759'
                              : article.sentiment_score < 0 
                              ? '#ff453a'
                              : '#8e8e93',
                            marginTop: '4px'
                          }}
                        >
                          {article.sentiment_score > 5 ? 'Very Bullish' :
                          article.sentiment_score > 2 ? 'Bullish' :
                          article.sentiment_score > 0 ? 'Slightly Positive' :
                          article.sentiment_score === 0 ? 'Neutral' :
                          article.sentiment_score > -3 ? 'Slightly Negative' :
                          article.sentiment_score > -6 ? 'Bearish' : 'Very Bearish'}
                        </div>
                      </div>
                      <div style={{ 
                        padding: '6px 12px',
                        background: 'rgba(0, 122, 255, 0.15)',
                        color: '#007aff',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        border: '1px solid rgba(0, 122, 255, 0.2)'
                      }}>
                        🤖 AI Sentiment
                      </div>
                    </div>
                    <div style={{ fontSize: '1.5rem' }}>
                      {article.sentiment_score > 5 ? '🚀' : 
                      article.sentiment_score < -5 ? '📉' : 
                      article.sentiment_score > 0 ? '📈' : 
                      article.sentiment_score < 0 ? '📊' : '😐'}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ color: '#007aff', fontSize: '0.9rem', fontWeight: '500' }}>
                    📰 Economic Times
                  </div>
                  <div style={{ color: '#007aff', fontSize: '0.9rem' }}>
                    Read more →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  </>
);

}

export default StockScreener;
