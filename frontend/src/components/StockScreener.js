import React, { useState, useEffect } from 'react';

function StockScreener() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/news?limit=${limit}`);

      if (!res.ok) throw new Error('Network error');

      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch latest news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [limit]);

  const refreshNews = () => fetchNews();

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

  return (
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
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
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
            justifyContent: 'space-between',
            alignItems: 'center',
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
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          </div>
        </div>

        {/* News List */}
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
            {news.map((article) => (
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
                    {article.time}
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
                            fontSize: '1.5rem',  // Same size as score
                            fontWeight: '600',
                            color: article.sentiment_score > 0 
                              ? '#34c759'  // Same green as positive score
                              : article.sentiment_score < 0 
                              ? '#ff453a'  // Same red as negative score
                              : '#8e8e93', // Same gray as neutral score
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
  );
}

export default StockScreener;
