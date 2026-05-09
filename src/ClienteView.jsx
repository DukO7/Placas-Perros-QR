import React from 'react';

const ClienteView = ({ mascotas, usuario }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '22px', color: '#1e293b' }}>Mis Mascotas</h1>
        <p style={{ color: '#64748b' }}>Hola, {usuario.nombre}. Gestiona la seguridad de tus amigos.</p>
      </header>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {mascotas.map(m => (
          <div key={m.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <img src={m.foto || '🐾'} alt={m.nombre} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0 }}>{m.nombre}</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{m.raza}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                Ver Perfil
              </button>
              {m.estado === 'activo' ? (
                <button style={{ flex: 1, padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                  🚨 Reportar Extravío
                </button>
              ) : (
                <button style={{ flex: 1, padding: '10px', backgroundColor: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>
                  ✅ Ya lo encontré
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClienteView;