import React from 'react';

function Header({ user, onLogout, onShowAuth }) {
  return (
    <div style={{ 
      position: 'absolute', 
      top: '20px', 
      left: 0, 
      right: 0, 
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px'
    }}>
      {/* Logo */}
      <img 
        src="/logo.png" 
        alt="Turingist Logo" 
        style={{ 
          height: '60px', 
          cursor: 'pointer',
          margin: '0 auto'
        }}
        onClick={() => window.location.href = '/'}
      />
      
      {/* Auth Buttons */}
      <div style={{ position: 'absolute', right: '20px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#f5f5f7', fontSize: '0.9rem' }}>
              Welcome, {user.name}
            </span>
            <button
              onClick={onLogout}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(28, 28, 30, 0.8)',
                color: '#f5f5f7',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onShowAuth}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #007aff, #5856d6)',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
