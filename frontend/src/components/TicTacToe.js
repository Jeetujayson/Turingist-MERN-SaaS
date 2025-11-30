import React, { useState } from 'react';
import Header from './Header';

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setWinner(calculateWinner(newBoard));
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at top, #1a1a1a 0%, #000 70%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
      color: '#f5f5f7',
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <Header />
      
      <h1 style={{ 
  fontSize: '3.5rem', 
  fontWeight: '700', 
  marginTop: '100px',
  marginBottom: '16px',
  background: 'linear-gradient(270deg, #007aff, #5856d6, #af52de, #ff2d92, #007aff)',
  backgroundSize: '400% 400%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'gradientMove 3s ease-in-out infinite'
}}>
  Tic Tac Toe
</h1>


      <div style={{
        background: 'rgba(28, 28, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '24px', fontSize: '1.2rem' }}>
          {winner ? (
            <span style={{ color: '#34c759', fontWeight: '600' }}>🎉 Player {winner} Wins!</span>
          ) : board.every(cell => cell) ? (
            <span style={{ color: '#ff9f0a', fontWeight: '600' }}>🤝 It's a Draw!</span>
          ) : (
            <span>Player <span style={{ color: '#007aff', fontWeight: '600' }}>{isXNext ? 'X' : 'O'}</span>'s Turn</span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          width: '300px',
          height: '300px',
          margin: '0 auto 24px'
        }}>
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                fontSize: '3rem',
                fontWeight: '700',
                color: cell === 'X' ? '#007aff' : '#ff2d92',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                if (!cell && !winner) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(0, 122, 255, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {cell}
            </button>
          ))}
        </div>

        <button
          onClick={resetGame}
          style={{
            padding: '16px 32px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #007aff, #5856d6)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🔄 New Game
        </button>
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

export default TicTacToe;
