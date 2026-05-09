import React from 'react';

const ClienteView = ({ mascotas, usuario, actualizarEstado, onLogout }) => {
  
  // USAMOS LOS MISMOS ESTILOS QUE EL DASHBOARD PARA ASEGURAR COMPATIBILIDAD
  const styles = {
    layout: { 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', // Fondo gris claro del dash
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    },
    header: { 
      backgroundColor: 'white', 
      padding: '20px 40px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid #e2e8f0'
    },
    content: { 
      padding: window.innerWidth < 768 ? '20px' : '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '25px' 
    },
    card: { 
      backgroundColor: 'white', 
      padding: '25px', 
      borderRadius: '24px', 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', // Sombra suave del dash
      border: '1px solid #f1f5f9'
    },
    photoContainer: { 
      width: '60px', 
      height: '60px', 
      borderRadius: '16px', 
      backgroundColor: '#f1f5f9', 
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    btnPrimary: { 
      flex: 1, padding: '12px', backgroundColor: '#2563eb', color: 'white', 
      border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' 
    },
    btnDanger: { 
      flex: 1, padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', 
      border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' 
    },
    btnSuccess: { 
      flex: 1, padding: '12px', backgroundColor: '#dcfce7', color: '#16a34a', 
      border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' 
    },
    btnSecondary: { 
      padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', 
      borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#64748b' 
    }
  };

  return (
    <div style={styles.layout}>
      {/* BARRA SUPERIOR */}
      <header style={styles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Mis Mascotas</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Sesión iniciada como <b>{usuario.nombre}</b></span>
        </div>
        <button onClick={onLogout} style={styles.btnSecondary}>Salir</button>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main style={styles.content}>
        {mascotas.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{ fontSize: '50px' }}>🔍</div>
            <h3 style={{ color: '#64748b' }}>No se encontraron mascotas vinculadas a tu cuenta.</h3>
          </div>
        ) : (
          <div style={styles.grid}>
            {mascotas.map(m => (
              <div key={m.id} style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={styles.photoContainer}>
                    {m.foto ? <img src={m.foto} style={styles.img} alt="pet" /> : <span>🐾</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{m.nombre}</h3>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{m.raza}</div>
                    <div style={{ 
                      marginTop: '5px', 
                      display: 'inline-block', 
                      padding: '2px 8px', 
                      borderRadius: '8px', 
                      fontSize: '10px', 
                      fontWeight: '800',
                      backgroundColor: m.estado === 'perdido' ? '#fee2e2' : '#dcfce7',
                      color: m.estado === 'perdido' ? '#dc2626' : '#16a34a'
                    }}>
                      {m.estado.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.btnPrimary}>Ver Perfil</button>
                  
                  {m.estado === 'activo' ? (
                    <button 
                      onClick={() => actualizarEstado(m.id, 'perdido', 'Reportado por el dueño')}
                      style={styles.btnDanger}
                    >
                      🚨 Perdido
                    </button>
                  ) : (
                    <button 
                      onClick={() => actualizarEstado(m.id, 'activo', 'Encontrado por el dueño')}
                      style={styles.btnSuccess}
                    >
                      ✅ Encontrado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClienteView;