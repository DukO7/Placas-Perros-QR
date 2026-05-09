import React, { useState } from 'react';
import DetalleMascotaModal from './DetalleMascotaModal';

const ClienteView = (props) => {
  const { mascotas, usuario, onLogout, setSeleccionada } = props;

  return (
    <div style={styles.page}>
      {/* HEADER SIMPLIFICADO */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Mis Mascotas</h1>
          <p style={styles.subtitle}>Hola, {usuario.nombre}</p>
        </div>
        <button onClick={onLogout} style={styles.btnLogout}>Cerrar Sesión</button>
      </header>

      {/* LISTA DE MASCOTAS TIPO TARJETAS DE PERFIL */}
      <main style={styles.grid}>
        {mascotas.length === 0 ? (
          <div style={styles.empty}>No tienes mascotas registradas.</div>
        ) : (
          mascotas.map(m => (
            <div key={m.id} style={styles.card}>
              <div style={styles.cardContent}>
                <div style={styles.imageWrapper}>
                  {m.foto ? (
                    <img src={m.foto} alt="pet" style={styles.photo} />
                  ) : (
                    <span style={{ fontSize: '40px' }}>🐾</span>
                  )}
                  <div style={badgeStyle(m.estado)}>{m.estado}</div>
                </div>
                
                <div style={styles.info}>
                  <h2 style={styles.petName}>{m.nombre}</h2>
                  <p style={styles.petRaza}>{m.raza}</p>
                </div>
              </div>

              <div style={styles.actions}>
                <button 
                  onClick={() => setSeleccionada(m)} 
                  style={styles.btnPrimary}
                >
                  📖 Ver Historial y Ubicación
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* REUTILIZAMOS TU MODAL PARA QUE EL DUEÑO VEA EL MAPA E HISTORIAL */}
      <DetalleMascotaModal {...props} />
    </div>
  );
};

// --- ESTILOS MINIMALISTAS ---
const badgeStyle = (estado) => ({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  fontSize: '10px',
  padding: '4px 12px',
  borderRadius: '20px',
  fontWeight: '800',
  textTransform: 'uppercase',
  backgroundColor: estado === 'perdido' ? '#ef4444' : '#10b981',
  color: 'white',
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
});

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: window.innerWidth < 768 ? '20px' : '40px',
    fontFamily: 'system-ui, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1000px',
    margin: '0 auto 40px auto'
  },
  title: { margin: 0, fontSize: '28px', color: '#1e293b', fontWeight: '800' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '15px' },
  btnLogout: {
    padding: '10px 18px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#64748b',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '25px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '28px',
    padding: '20px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    transition: 'transform 0.2s'
  },
  cardContent: { display: 'flex', alignItems: 'center', gap: '20px' },
  imageWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '22px',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '4px solid #f1f5f9'
  },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { flex: 1 },
  petName: { margin: 0, fontSize: '22px', color: '#1e293b', fontWeight: '800' },
  petRaza: { margin: '4px 0', color: '#64748b', fontSize: '14px' },
  actions: { display: 'flex', gap: '10px' },
  btnPrimary: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#1e293b',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px'
  },
  empty: { textAlign: 'center', gridColumn: '1/-1', padding: '50px', color: '#94a3b8' }
};

export default ClienteView;