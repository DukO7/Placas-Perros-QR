import React, { useState } from 'react';

const LoginView = ({ onLogin }) => {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState(false);

  const manejarLogin = (e) => {
    e.preventDefault();
    // Aquí puedes validar contra tu base de datos o un usuario fijo por ahora
    if (credenciales.usuario === 'admin' && credenciales.password === '12345') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div style={loginOverlayStyle}>
      <div style={loginCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '50px' }}>🐾</span>
          <h1 style={{ margin: '10px 0 5px 0', fontSize: '24px', color: '#1e293b' }}>Bienvenido</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Ingresa tus credenciales para administrar</p>
        </div>

        <form onSubmit={manejarLogin} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={labelStyle}>USUARIO</label>
            <input 
              type="text" 
              required 
              style={inputStyle} 
              placeholder="Ej: admin"
              onChange={e => setCredenciales({...credenciales, usuario: e.target.value})}
            />
          </div>

          <div>
            <label style={labelStyle}>CONTRASEÑA</label>
            <input 
              type="password" 
              required 
              style={inputStyle} 
              placeholder="••••••••"
              onChange={e => setCredenciales({...credenciales, password: e.target.value})}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ Usuario o contraseña incorrectos
            </div>
          )}

          <button type="submit" style={btnLoginStyle}>
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ESTILOS DEL LOGIN ---
const loginOverlayStyle = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
  backgroundSize: '20px 20px'
};

const loginCardStyle = {
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '24px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  width: '100%',
  maxWidth: '400px'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  color: '#64748b',
  marginBottom: '8px',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const btnLoginStyle = {
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  padding: '14px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginTop: '10px'
};

export default LoginView;