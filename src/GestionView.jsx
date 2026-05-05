import React, { useState } from 'react';

const GestionView = ({ mascotas, agregarMascota, eliminarMascota, setSeleccionada }) => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [vistaActual, setVistaActual] = useState('censo'); 
  
  // 🔍 Estado para filtros actualizado con "estado"
  const [filtros, setFiltros] = useState({
    nombre: '',
    dueno: '',
    impreso: 'todos',
    estado: 'todos'
  });

  const [nueva, setNueva] = useState({ 
    nombre: '', dueno: '', contacto: '', raza: '', señas: '', foto: '', direccion: '' 
  });

  // --- LÓGICA DE FILTRADO MULTI-COLUMNA ---
  const listaBase = vistaActual === 'censo' ? mascotas : mascotas.filter(m => !m.impreso);

  const mascotasFiltradas = listaBase.filter(m => {
    const matchNombre = m.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
    const matchDueno = m.dueno.toLowerCase().includes(filtros.dueno.toLowerCase());
    const matchImpreso = filtros.impreso === 'todos' 
      ? true 
      : filtros.impreso === 'si' ? m.impreso : !m.impreso;
    const matchEstado = filtros.estado === 'todos'
      ? true
      : m.estado === filtros.estado;

    return matchNombre && matchDueno && matchImpreso && matchEstado;
  });

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNueva({ ...nueva, foto: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    agregarMascota(nueva);
    setMostrarForm(false);
    setNueva({ nombre: '', dueno: '', contacto: '', raza: '', señas: '', foto: '', direccion: '' });
  };

  // Función para dar estilo a los badges de estado
  const renderEstadoBadge = (estado) => {
    const estilos = {
      perdido: { bg: '#fee2e2', text: '#dc2626' },
      encontrado: { bg: '#fef3c7', text: '#d97706' },
      activo: { bg: '#dcfce7', text: '#16a34a' }
    };
    const current = estilos[estado] || estilos.activo;
    return (
      <span style={{ 
        fontSize: '10px', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', 
        backgroundColor: current.bg, color: current.text, textTransform: 'uppercase'
      }}>
        {estado || 'activo'}
      </span>
    );
  };

  return (
    <>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a' }}>
            {vistaActual === 'censo' ? 'Censo General' : 'Cola de Impresión 🖨️'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', gap: '5px' }}>
            <button onClick={() => setVistaActual('censo')} style={tabButtonStyle(vistaActual === 'censo')}>📋 Todos</button>
            <button onClick={() => setVistaActual('pendientes')} style={tabButtonStyle(vistaActual === 'pendientes', true)}>🕒 Pendientes</button>
          </div>
          <button onClick={() => setMostrarForm(true)} style={btnPrimaryStyle}>➕ Nuevo Registro</button>
        </div>
      </header>

      <div style={containerStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={thStyle}>Mascota</th>
              <th style={thStyle}>Dueño</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Placa</th>
              <th style={thStyle}>Acciones</th>
            </tr>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              <th style={{ padding: '10px' }}>
                <input 
                  placeholder="Nombre..." 
                  style={filterInputStyle}
                  onChange={(e) => setFiltros({...filtros, nombre: e.target.value})}
                />
              </th>
              <th style={{ padding: '10px' }}>
                <input 
                  placeholder="Dueño..." 
                  style={filterInputStyle}
                  onChange={(e) => setFiltros({...filtros, dueno: e.target.value})}
                />
              </th>
              <th style={{ padding: '10px' }}>
                <select 
                  style={filterInputStyle} 
                  onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                >
                  <option value="todos">Todos</option>
                  <option value="activo">🟢 Activos</option>
                  <option value="perdido">🔴 Perdidos</option>
                  <option value="encontrado">🟡 Encontrados</option>
                </select>
              </th>
              <th style={{ padding: '10px' }}>
                <select 
                  style={filterInputStyle} 
                  onChange={(e) => setFiltros({...filtros, impreso: e.target.value})}
                >
                  <option value="todos">Placa (Todas)</option>
                  <option value="si">✅ Listas</option>
                  <option value="no">⏳ Pendientes</option>
                </select>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mascotasFiltradas.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {m.foto ? <img src={m.foto} alt="pet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🐾</span>}
                    </div>
                    <div>
                      <div style={{fontWeight:'700'}}>{m.nombre}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{m.raza}</div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{m.dueno}</td>
                <td style={tdStyle}>{renderEstadoBadge(m.estado)}</td>
                <td style={tdStyle}>
                  {m.impreso ? 
                    <span style={{color: '#16a34a', fontWeight: 'bold', fontSize: '11px'}}>✅ OK</span> : 
                    <span style={{color: '#f59e0b', fontWeight: 'bold', fontSize: '11px'}}>⏳ PENDIENTE</span>
                  }
                </td>
                <td style={tdStyle}>
                  <button onClick={() => setSeleccionada(m)} style={btnMiniStyle}>Ficha</button>
                  <button onClick={() => eliminarMascota(m.id)} style={{...btnMiniStyle, color: '#ef4444', border: 'none', marginLeft: '5px'}}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE REGISTRO */}
      {mostrarForm && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, width: '450px', textAlign: 'left'}}>
            <h2 style={{marginTop: 0, fontSize: '20px'}}>Registrar en Rosfran 🐾</h2>
            <form onSubmit={handleSubmit} style={{display: 'grid', gap: '15px'}}>
               <input placeholder="Nombre de la Mascota" required style={inputStyle} onChange={e => setNueva({...nueva, nombre: e.target.value})} />
               <input placeholder="Raza" required style={inputStyle} onChange={e => setNueva({...nueva, raza: e.target.value})} />
               <input placeholder="Nombre del Dueño" required style={inputStyle} onChange={e => setNueva({...nueva, dueno: e.target.value})} />
               <input placeholder="Teléfono de contacto" required style={inputStyle} onChange={e => setNueva({...nueva, contacto: e.target.value})} />
               <input placeholder="Dirección para placa" required style={inputStyle} value={nueva.direccion} onChange={e => setNueva({...nueva, direccion: e.target.value})} />
               
               <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                 <label style={{fontSize: '11px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px'}}>FOTO DE LA MASCOTA</label>
                 <input type="file" accept="image/*" onChange={manejarArchivo} style={{ fontSize: '12px' }} />
               </div>

               <div style={{display: 'flex', gap: '10px'}}>
                  <button type="submit" style={{...btnPrimaryStyle, flex: 1}}>Guardar Registro</button>
                  <button type="button" onClick={() => setMostrarForm(false)} style={{...btnSecondaryStyle, flex: 1}}>Cancelar</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ... (Mismos estilos que tenías)
const filterInputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', outline: 'none', boxSizing: 'border-box' };
const tabButtonStyle = (active, isAlert = false) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: active ? (isAlert && active ? '#ef4444' : 'white') : 'transparent', color: active ? (isAlert && active ? 'white' : '#1e293b') : '#64748b', boxShadow: active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' });
const containerStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflowX: 'auto' };
const thStyle = { padding: '15px', color: '#64748b', fontSize: '13px', borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap' };
const tdStyle = { padding: '15px', fontSize: '14px', whiteSpace: 'nowrap' };
const btnPrimaryStyle = { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondaryStyle = { backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' };
const btnMiniStyle = { padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', border: '1px solid #e2e8f0', backgroundColor: 'white' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '24px' };
const inputStyle = { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' };

export default GestionView;