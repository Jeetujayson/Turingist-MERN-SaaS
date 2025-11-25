import React, { useState } from 'react';

function Home() {
  const [hoveredTool, setHoveredTool] = useState(null);

  const saasTools = [
    {
      id: 1,
      name: "Stock Screener",
      description: "Filter Profitable Stocks In Real Time",
      icon: "📈",
      features: ["Real-time Data", "Based On Technical Analysis", "API Integration"],
      status: "Beta"
    },
    {
    id: 2,
    name: "Tic Tac Toe",
    description: "Classic game with modern design and smooth animations",
    icon: "🎮",
    features: ["Two Player", "Smart AI", "Score Tracking"],
    status: "Live"
    },
    {
      id: 3,
      name: "Task Automation",
      description: "Automate repetitive tasks and boost productivity",
      icon: "⚡",
      features: ["Workflow Builder", "Integrations", "Scheduling"],
      status: "Coming Soon"
    },
    {
      id: 4,
      name: "AI Content Generator",
      description: "Generate high-quality content using advanced AI algorithms",
      icon: "🤖",
      features: ["AI-Powered", "Real-time", "Multi-language"],
      status: "Coming Soon"
    }
  ];

  const handleButtonClick = (tool) => {
    if (tool.status === 'Beta' && tool.name === 'Stock Screener') {
      window.open('/stock-screener', '_blank');
    } else if (tool.status === 'Live') {
  window.open('/tic-tac-toe', '_blank');
    } else {
      alert('Coming Soon!');
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="main-title">
            Turingist <span className="gradient-text">SaaS Tools</span>
          </h1>
          <p className="subtitle">
            Crafting innovative SaaS solutions that transform businesses and empower growth
          </p>
          <div className="stats">
            <div className="stat-badge purple">✨ 4 Active Projects</div>
            <div className="stat-badge green">🚀 1 Live Product</div>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <section className="tools-section">
        <div className="tools-grid">
          {saasTools.map((tool) => (
            <div
              key={tool.id}
              className={`tool-card ${hoveredTool === tool.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <div className={`status-badge ${tool.status.toLowerCase().replace(' ', '-')}`}>
                {tool.status}
              </div>

              <div className={`tool-icon tool-${tool.id}`}>
                {tool.icon}
              </div>

              <h3 className="tool-name">{tool.name}</h3>
              <p className="tool-description">{tool.description}</p>

              <div className="features">
                {tool.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>

              <button 
                className={`action-btn ${tool.status.toLowerCase().replace(' ', '-')}`}
                onClick={() => handleButtonClick(tool)}
              >
                {tool.status === 'Live' ? 'Launch App' : 
                 tool.status === 'Beta' ? 'Try Beta' : 'Notify Me'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Built By <span className="author">Jeetu</span> with ❤️ </p>
        <div className="social-links">
          <a href="https://www.facebook.com/jeetujayson.raju.1/" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://github.com/Jeetujayson" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://x.com/JEETUJAYSON" target="_blank" rel="noopener noreferrer">X</a>
          <a href="https://www.linkedin.com/in/jeetujayson-raju-9b7b7b95/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.youtube.com/@jeetujaysonraju" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="https://www.instagram.com/turingist_videos" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
