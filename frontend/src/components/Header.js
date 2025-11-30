import React from 'react';

function Header() {
  return (
    <img 
      src="/logo.png" 
      alt="Turingist Logo" 
      style={{ 
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        height: '60px', 
        cursor: 'pointer',
        zIndex: 10
      }}
      onClick={() => window.location.href = '/'}
    />
  );
}

export default Header;
