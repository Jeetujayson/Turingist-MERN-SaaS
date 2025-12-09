import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import StockScreener from './components/StockScreener';
import TicTacToe from './components/TicTacToe';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You could verify token here, for now just assume valid
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleShowAuth = () => {
    setShowAuth(true);
    setAuthMode('login');
  };

  if (showAuth) {
    return authMode === 'login' ? (
      <Login 
        onLogin={handleLogin}
        switchToRegister={() => setAuthMode('register')}
      />
    ) : (
      <Register 
        onLogin={handleLogin}
        switchToLogin={() => setAuthMode('login')}
      />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />} />
        <Route path="/stock-screener" element={<StockScreener user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />} />
        <Route path="/tic-tac-toe" element={<TicTacToe user={user} onLogout={handleLogout} onShowAuth={handleShowAuth} />} />
      </Routes>
    </Router>
  );
}

export default App;
