import React from 'react';

const ClienteView = ({ mascotas, usuario, actualizarEstado, onLogout }) => {
  
  // Estilos internos para asegurar que se apliquen
  const styles = {
    container: { padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    grid: { 
      display: 'grid', 
      gap: '20px', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      width: '100%'
    },
    card: { 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '24px', 
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
      border: '1px solid #f1f5f9'
    },
    avatar: { width: '65px', height: '65px', borderRadius: '18px', objectFit: 'cover', backgroundColor: '#e2e8f0' },
    btnPerfil: { flex: 1, padding: '12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', color: '#475569' },
    btnAlerta: { flex: 1, padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    btnOk: { flex: 1, padding: '12px', backgroundColor: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
    btnLogout: { padding: '10px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', color: '#ef4444' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#1e293b', margin: 0 }}>Mis Mascotas 🐾</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Bienvenido de nuevo, <b>{usuario.nombre}</b></p>
        </div>
        <button onClick={onLogout} style={styles.btnLogout}>Cerrar Sesión</button>
      </header>

      {mascotas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
          <h2>No tienes mascotas registradas aún</h2>
        </div>
      ) : (
        <div style={styles.grid}>
          {mascotas.map(m => (
            <div key={m.id} style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                {m.foto ? (
                  <img src={m.foto} alt={m.nombre} style={styles.avatar} />
                ) : (
                  <div style={{...styles.avatar, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px'}}>🐕</div>
                )}
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>{m.nombre}</h3>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{m.raza}</span>
                  <div style={{ 
                    marginTop: '5px', fontSize: '10px', fontWeight: '800', 
                    color: m.estado === 'perdido' ? '#ef4444' : '#10b981', textTransform: 'uppercase' 
                  }}>
                    ● {m.estado}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.btnPerfil}>Ver Perfil</button>
                
                {m.estado === 'activo' ? (
                  <button 
                    onClick={() => actualizarEstado(m.id, 'perdido', 'Reportado por el dueño')}
                    style={styles.btnAlerta}
                  >
                    🚨 Reportar Extravío
                  </button>
                ) : (
                  <button 
                    onClick={() => actualizarEstado(m.id, 'activo', 'Encontrado por el dueño')}
                    style={styles.btnOk}
                  >
                    ✅ Ya lo encontré
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClienteView;