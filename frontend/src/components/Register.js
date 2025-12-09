import React, { useState } from 'react';
import axios from 'axios';

function Register({ onLogin, switchToLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1a1a1a 0%, #000 70%), linear-gradient(180deg, #000 0%, #0a0a0a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
        {/* Logo Header */}
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


      <div style={{
        background: 'rgba(28, 28, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ color: '#f5f5f7', textAlign: 'center', marginBottom: '30px' }}>Register</h2>
        
        {error && (
          <div style={{ color: '#ff453a', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(28, 28, 30, 0.8)',
              color: '#f5f5f7',
              fontSize: '1rem'
            }}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(28, 28, 30, 0.8)',
              color: '#f5f5f7',
              fontSize: '1rem'
            }}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(28, 28, 30, 0.8)',
              color: '#f5f5f7',
              fontSize: '1rem'
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? 'rgba(142, 142, 147, 0.3)' : 'linear-gradient(135deg, #007aff, #5856d6)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ color: '#a1a1a6', textAlign: 'center', marginTop: '20px' }}>
          Already have an account?{' '}
          <span
            onClick={switchToLogin}
            style={{ color: '#007aff', cursor: 'pointer' }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
