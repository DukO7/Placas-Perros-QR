import React, { useState } from 'react'
import GestionView from './GestionView'
import DetalleMascotaModal from './DetalleMascotaModal'

const DashboardView = (props) => {
  // 1. RE-INSERTAMOS EL ESTADO AQUÍ (Esto es lo que hace que funcione el sidebar)
  const [seccionInterna, setSeccionInterna] = useState('dashboard');
  
  const { mascotas, contar, setSeleccionada, seleccionada } = props;

  // 2. Lógica de navegación restaurada
  const renderContent = () => {
    if (seccionInterna === 'censo') {
      return <GestionView {...props} />;
    }

    return (
      <>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '800' }}>Sistema de Identificación</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Métricas de impacto municipal</p>
        </header>

        <section style={styles.kpiGrid}>
          <KPICard title="Total" count={mascotas.length} icon="🐾" />
          <KPICard title="Activos" count={contar('activo')} icon="🟢" color="#16a34a" />
          <KPICard title="Perdidos" count={contar('perdido')} icon="🔴" color="#dc2626" />
          <KPICard title="Éxito" count={`${((contar('encontrado') / (contar('perdido') + contar('encontrado')) || 0) * 100).toFixed(0)}%`} icon="📈" color="#2563eb" />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Efectividad de Recuperación</h3>
            <div style={styles.chartContainer}>
              <Bar height={(contar('encontrado') / (contar('perdido') + contar('encontrado')) * 100) || 0} count={`${((contar('encontrado') / (contar('perdido') + contar('encontrado'))) * 100 || 0).toFixed(0)}%`} color="#22c55e" label="Éxito" />
              <Bar height={100} count={mascotas.length} color="#1e293b" label="Total" />
            </div>
          </div>
          
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Actividad Reciente</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mascotas.slice(0, 4).map(m => (
                <div key={m.id} style={styles.recentItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={styles.miniPhotoContainer}>
                      {m.foto && m.foto.length > 10 ? 
                        <img src={m.foto} alt="pet" style={styles.miniPhoto} /> : <span>🐾</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>{m.nombre}</div>
                      <div style={badgeStyle(m.estado)}>{m.estado}</div>
                    </div>
                  </div>
                  <button onClick={() => setSeleccionada(m)} style={styles.btnMini}>Ficha</button>
                </div>
              ))}
              <button onClick={() => setSeccionInterna('censo')} style={styles.btnText}>Ver censo completo →</button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={{ fontSize: '28px' }}>🛡️</div>
          <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '700' }}>PETID QRO</h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* USAMOS setSeccionInterna PARA QUE NAVEGUE */}
          <div onClick={() => setSeccionInterna('dashboard')} style={navItemStyle(seccionInterna === 'dashboard')}>📊 Dashboard</div>
          <div onClick={() => setSeccionInterna('censo')} style={navItemStyle(seccionInterna === 'censo')}>🐶 Censo Mascotas</div>
        </nav>
      </aside>

      <main style={styles.mainContent}>
        {renderContent()}
      </main>

      <DetalleMascotaModal {...props} />
    </div>
  )
}

// --- ESTILOS (IGUALES A LOS ANTERIORES) ---
const navItemStyle = (activo) => ({ padding: '12px 15px', backgroundColor: activo ? '#334155' : 'transparent', color: activo ? 'white' : '#94a3b8', borderRadius: '10px', cursor: 'pointer', fontWeight: activo ? '600' : '400' });
const badgeStyle = (estado) => ({ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: estado === 'perdido' ? '#fee2e2' : '#dcfce7', color: estado === 'perdido' ? '#dc2626' : '#16a34a' });
const styles = {
    layout: { 
        display: 'flex', 
        flexDirection: window.innerWidth < 768 ? 'column' : 'row', // Apilar en móvil
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        fontFamily: 'system-ui, sans-serif' 
    },
    sidebar: { 
        width: window.innerWidth < 768 ? '100%' : '260px', // Ancho completo en móvil
        boxSizing: 'border-box',
        backgroundColor: '#1e293b', 
        color: 'white', 
        padding: '20px' 
    },
  logoArea: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' },
  mainContent: { 
    flex: 1, 
    padding: window.innerWidth < 768 ? '20px' : '40px', // Menos margen en móvil
    overflowY: 'auto' 
},
kpiGrid: { 
    display: 'grid', 
    // auto-fit ajusta las columnas automáticamente según el espacio disponible
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
    gap: '15px', 
    marginBottom: '30px' 
}, kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardTitle: { marginTop: 0, marginBottom: '25px', fontSize: '17px', color: '#1e293b', fontWeight: '700' },
  chartContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '220px' },
  recentItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' },
  miniPhotoContainer: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  miniPhoto: { width: '100%', height: '100%', objectFit: 'cover' },
  btnMini: { padding: '6px 12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  btnText: { border: 'none', background: 'none', color: '#2563eb', fontSize: '13px', cursor: 'pointer', marginTop: '10px', fontWeight: '600', textAlign: 'left' }
};

const KPICard = ({ title, count, icon, color = '#1e293b' }) => (
  <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
    <div style={{fontSize:'20px', marginBottom:'5px'}}>{icon}</div>
    <div style={{color:'#64748b', fontSize:'13px'}}>{title}</div>
    <div style={{fontSize:'24px', fontWeight:'800', color}}>{count}</div>
  </div>
);

const Bar = ({ height, color, label, count }) => (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        height: '100%', 
        flex: 1, // Usa el espacio disponible en lugar de width fijo
        minWidth: '40px' 
    }}>
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: color }}>{count}</span>
      <div style={{ 
          width: '80%', // Proporcional al contenedor
          height: `${(height * 150) / 100}px`, // Un poco más bajo para móvil
          backgroundColor: color, 
          borderRadius: '5px 5px 0 0' 
      }}></div>
      <span style={{ fontSize: '9px', textAlign: 'center', marginTop: '5px' }}>{label}</span>
    </div>
  );

export default DashboardView;