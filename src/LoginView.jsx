import React from 'react';
import axios from 'axios';

const LoginView = ({ onLogin }) => {
  const [usuario, setUsuario] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Llamada real a tu API en Render
      const response = await axios.post('https://api-qrplacas.onrender.com/api/login', {
        usuario,
        password
      });

      if (response.data.success) {
        // 'datos' ahora incluirá { id, nombre, rol }
        console.log("rESPPPSONDE"+response.data.user);
        onLogin(response.data.user);
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div style={{
      height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', 
      alignItems: 'center', backgroundColor: '#f8fafc'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '40px', borderRadius: '24px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px' }}>🔐</span>
          <h2 style={{ color: '#1e293b', marginTop: '10px' }}>Acceso al Sistema</h2>
        </div>

        <form onSubmit={manejarLogin} style={{ display: 'grid', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Usuario" 
            required
            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            onChange={e => setUsuario(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            required
            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
            onChange={e => setPassword(e.target.value)}
          />
          
          {error && <p style={{ color: 'red', fontSize: '12px', textAlign: 'center' }}>❌ Datos incorrectos</p>}

          <button type="submit" style={{
            backgroundColor: '#2563eb', color: 'white', border: 'none', 
            padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;