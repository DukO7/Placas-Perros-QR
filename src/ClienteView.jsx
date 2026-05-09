import React from 'react';
import DetalleMascotaModal from './DetalleMascotaModal';

const ClienteView = (props) => {
  const { mascotas, usuario, onLogout, setSeleccionada } = props;

  // Estilos definidos como constantes para evitar errores de renderizado
  const styles = {
    wrapper: {
      margin: 0,
      padding: window.innerWidth < 768 ? '20px' : '40px',
      backgroundColor: '#f1f5f9',
      minHeight: '100vh',
      width: '100vw',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '900px',
      margin: '0 auto 30px auto',
      width: '100%'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      maxWidth: '900px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '24px',
      padding: '20px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    petInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    imgContainer: {
      width: '80px',
      height: '80px',
      borderRadius: '18px',
      backgroundColor: '#f8fafc',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px solid #e2e8f0'
    },
    btnMain: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#1e293b',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '14px',
      transition: '0.2s'
    },
    btnLogout: {
      padding: '8px 16px',
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      color: '#ef4444',
      fontWeight: '600',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* CABECERA */}
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Mis Mascotas</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Bienvenido, {usuario.nombre}</p>
        </div>
        <button onClick={onLogout} style={styles.btnLogout}>Salir</button>
      </header>

      {/* CUERPO - GRILLA DE TARJETAS */}
      <div style={styles.grid}>
        {mascotas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', gridColumn: '1/-1' }}>
            No tienes mascotas registradas.
          </p>
        ) : (
          mascotas.map(m => (
            <div key={m.id} style={styles.card}>
              <div style={styles.petInfo}>
                <div style={styles.imgContainer}>
                  {m.foto ? (
                    <img src={m.foto} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '30px' }}>🐶</span>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>{m.nombre}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{m.raza}</p>
                  <span style={{ 
                    display: 'inline-block', 
                    marginTop: '5px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: m.estado === 'perdido' ? '#fee2e2' : '#dcfce7',
                    color: m.estado === 'perdido' ? '#dc2626' : '#16a34a'
                  }}>
                    {m.estado.toUpperCase()}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSeleccionada(m)} 
                style={styles.btnMain}
              >
                Ver Detalles e Historial
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE DETALLES (REUTILIZADO) */}
      <DetalleMascotaModal {...props} />
    </div>
  );
};

export default ClienteView;