import React, { useState } from 'react';

const ClienteView = (props) => {
  // Mantenemos el estado de navegación interna igual que el Dashboard
  const [seccionInterna, setSeccionInterna] = useState('inicio');
  const { mascotas, usuario, actualizarEstado, onLogout } = props;

  const renderContent = () => {
    // Si el cliente tiene muchas mascotas, mostramos el KPI Grid
    return (
      <>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '800' }}>Panel de Dueño</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Bienvenido, {usuario.nombre}. Gestiona la seguridad de tus amigos.</p>
        </header>

        {/* Mismos KPIs que el Dash pero solo de sus mascotas */}
        <section style={styles.kpiGrid}>
          <KPICard title="Mis Mascotas" count={mascotas.length} icon="🐶" />
          <KPICard title="Protegidos" count={mascotas.filter(m => m.estado === 'activo').length} icon="🛡️" color="#16a34a" />
          <KPICard title="Reportes" count={mascotas.filter(m => m.estado === 'perdido').length} icon="⚠️" color="#dc2626" />
        </section>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Mis Perfiles Activos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mascotas.length === 0 ? (
              <p style={{textAlign: 'center', color: '#64748b'}}>No tienes mascotas registradas.</p>
            ) : (
              mascotas.map(m => (
                <div key={m.id} style={styles.recentItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={styles.miniPhotoContainer}>
                      {m.foto ? <img src={m.foto} alt="pet" style={styles.miniPhoto} /> : <span>🐾</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.nombre}
                      </div>
                      <div style={badgeStyle(m.estado)}>{m.estado}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {m.estado === 'activo' ? (
                      <button 
                        onClick={() => actualizarEstado(m.id, 'perdido', 'Reportado por el dueño')}
                        style={{...styles.btnMini, backgroundColor: '#fee2e2', color: '#dc2626', border: 'none'}}
                      >🚨 Reportar</button>
                    ) : (
                      <button 
                        onClick={() => actualizarEstado(m.id, 'activo', 'Encontrado por el dueño')}
                        style={{...styles.btnMini, backgroundColor: '#dcfce7', color: '#16a34a', border: 'none'}}
                      >✅ Encontrado</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={{ fontSize: '28px' }}>🐕</div>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>PETID CLIENTE</h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div onClick={() => setSeccionInterna('inicio')} style={navItemStyle(seccionInterna === 'inicio')}>🏠 Mis Mascotas</div>
          <div onClick={onLogout} style={navItemStyle(false)}>🚪 Cerrar Sesión</div>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
};

// --- COMPONENTES Y ESTILOS CLONADOS DEL DASHBOARD ---

const KPICard = ({ title, count, icon, color = '#1e293b' }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div style={{fontSize:'20px', marginBottom:'5px'}}>{icon}</div>
    <div style={{color:'#64748b', fontSize:'13px'}}>{title}</div>
    <div style={{fontSize:'24px', fontWeight:'800', color}}>{count}</div>
  </div>
);

const navItemStyle = (activo) => ({ 
    padding: '10px 12px', 
    backgroundColor: activo ? '#334155' : 'transparent', 
    color: activo ? 'white' : '#94a3b8', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: activo ? '600' : '400',
    transition: '0.2s'
});

const badgeStyle = (estado) => ({ 
    fontSize: '9px', 
    padding: '2px 8px', 
    borderRadius: '10px', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    display: 'inline-block',
    backgroundColor: estado === 'perdido' ? '#fee2e2' : '#dcfce7', 
    color: estado === 'perdido' ? '#dc2626' : '#16a34a' 
});

const styles = {
    layout: { 
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        fontFamily: 'system-ui, sans-serif' 
    },
    sidebar: { 
        width: window.innerWidth < 768 ? '100%' : '260px', 
        boxSizing: 'border-box',
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '20px' 
    },
    logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' },
    mainContent: { 
        flex: 1, 
        padding: window.innerWidth < 768 ? '20px' : '40px', 
        overflowY: 'auto' 
    },
    kpiGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
    },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    cardTitle: { marginTop: 0, marginBottom: '25px', fontSize: '17px', color: '#1e293b', fontWeight: '700' },
    recentItem: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px', 
        borderRadius: '16px', 
        backgroundColor: '#f8fafc', 
        border: '1px solid #f1f5f9',
        marginBottom: '8px'
    },
    miniPhotoContainer: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    miniPhoto: { width: '100%', height: '100%', objectFit: 'cover' },
    btnMini: { padding: '6px 12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }
};

export default ClienteView;