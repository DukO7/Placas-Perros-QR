import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const DetalleMascotaModal = ({ 
  seleccionada, 
  setSeleccionada, 
  actualizarEstado, 
  marcarComoImpreso, 
  descargarSVG,
  actualizarFoto 
}) => {
  const [tabActual, setTabActual] = useState('info'); 
  const [verQR, setVerQR] = useState(false);
  const [eventos, setEventos] = useState([]);
  
  // --- Estados para el Mini-Modal de Motivo ---
  const [showMotivo, setShowMotivo] = useState(false);
  const [motivoTexto, setMotivoTexto] = useState('');
  const [estadoTemporal, setEstadoTemporal] = useState(null);

  useEffect(() => {
    if (seleccionada && tabActual === 'historial') {
      cargarHistorial();
    }
  }, [seleccionada, tabActual]);

  const cargarHistorial = async () => {
    try {
      const res = await axios.get(`https://api-qrplacas.onrender.com/api/historial/${seleccionada.id}`);
      setEventos(res.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    }
  };

  // Al hacer clic en un botón de estado, abrimos el mini-modal
  const prepararCambioEstado = (nuevoEstado) => {
    if (nuevoEstado === seleccionada.estado) return;
    setEstadoTemporal(nuevoEstado);
    setShowMotivo(true);
  };

  // Dentro de DetalleMascotaModal.jsx
// --- DetalleMascotaModal.jsx (Busca confirmarCambio) ---
const confirmarCambio = async () => {
    if (!estadoTemporal) return;
  
    try {
      // 1. Actualizamos el estado de la mascota (como siempre)
      await actualizarEstado(seleccionada.id, estadoTemporal);
      
      // 2. ⚡ LLAMADA INDEPENDIENTE AL HISTORIAL
      console.log("Enviando petición de historial...");
      const resHistorial = await axios.post('https://api-qrplacas.onrender.com/api/historial', {
          mascota_id: seleccionada.id,
          evento: "Actualización de Estado",
          detalle: motivoTexto || `Cambio de estado a ${estadoTemporal}`
      });
      
      console.log("Resultado del historial:", resHistorial.data);

      // Limpieza de interfaz
      setShowMotivo(false);
      setMotivoTexto('');
      
      // Recargar y mostrar
      await cargarHistorial(); 
      setTabActual('historial'); 

    } catch (error) {
      console.error("ERROR COMPLETO:", error);
      alert("Error: Revisa la consola del servidor para ver por qué falló el historial.");
    }
};

  if (!seleccionada) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        
        <button 
          onClick={() => { setSeleccionada(null); setTabActual('info'); setVerQR(false); }} 
          style={styles.closeCornerBtn}
        >
          ×
        </button>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div style={styles.tabContainer}>
          <button onClick={() => setTabActual('info')} style={tabButtonStyle(tabActual === 'info')}>📄 Información</button>
          <button onClick={() => setTabActual('historial')} style={tabButtonStyle(tabActual === 'historial')}>
            📜 Historial {eventos.length > 0 && <span style={styles.notifBadge}>{eventos.length}</span>}
          </button>
        </div>

        {tabActual === 'info' ? (
          <>
            <div style={styles.headerPhotoContainer}>
              <div style={styles.photoWrapper}>
                <img src={seleccionada.foto || '🐾'} alt="Pet" style={styles.mainPhoto} />
                <label style={styles.editPhotoBadge}>
                  📷
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => actualizarFoto(seleccionada.id, reader.result);
                    if (file) reader.readAsDataURL(file);
                  }} />
                </label>
              </div>
              <div style={{ marginTop: '10px' }}>
                <h2 style={styles.petName}>{seleccionada.nombre}</h2>
                <div style={badgeStyle(seleccionada.estado)}>{seleccionada.estado}</div>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}><label style={styles.miniLabel}>Dueño</label><div style={styles.dataText}>{seleccionada.dueno}</div></div>
              <div style={styles.infoItem}><label style={styles.miniLabel}>Contacto</label><div style={styles.dataText}>{seleccionada.contacto}</div></div>
              <div style={{ ...styles.infoItem, gridColumn: 'span 2' }}><label style={styles.miniLabel}>Dirección de Residencia</label><div style={styles.dataText}>{seleccionada.direccion || 'No registrada'}</div></div>
            </div>

            {/* BOTONES DE ESTADO */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ ...styles.miniLabel, textAlign: 'center', display: 'block', marginBottom: '10px' }}>Actualizar Situación</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => prepararCambioEstado('perdido')} style={btnEstadoStyle('#ef4444', seleccionada.estado === 'perdido')}>🔴 Perdido</button>
                <button onClick={() => prepararCambioEstado('activo')} style={btnEstadoStyle('#22c55e', seleccionada.estado === 'activo')}>🟢 Activo</button>
                <button onClick={() => prepararCambioEstado('encontrado')} style={btnEstadoStyle('#f59e0b', seleccionada.estado === 'encontrado')}>🟡 Encontrado</button>
              </div>
            </div>

            <div style={styles.footerSection}>
              {!seleccionada.impreso ? (
                <div style={styles.produccionPanel}>
                  <div style={styles.qrPreview}>
                    <QRCodeSVG id="qr-pro" value={`https://placas-perros-qr.onrender.com/scan/${seleccionada.custom_id}`} size={85} level="L" />
                    <button onClick={() => descargarSVG(seleccionada.nombre)} style={styles.btnDownloadMini}>📥 Descargar SVG</button>
                    <button onClick={() => { marcarComoImpreso(seleccionada.id); setSeleccionada(null); }} style={styles.btnConfirmPrint}>✅ CONFIRMAR</button>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  {!verQR ? (
                    <button onClick={() => setVerQR(true)} style={styles.btnShowQR}>🔍 Ver QR y opciones de descarga</button>
                  ) : (
                    <div style={styles.qrPreviewExpanded}>
                       <QRCodeSVG id="qr-pro" value={`https://placas-perros-qr.onrender.com/scan/${seleccionada.custom_id}`} size={85} level="L" />
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                          <button onClick={() => descargarSVG(seleccionada.nombre)} style={styles.btnSecondaryDark}>📥 Descargar SVG</button>
                          <button onClick={() => setVerQR(false)} style={styles.btnLink}>Ocultar QR</button>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
            <div style={styles.historialContainer}>
            <h3 style={{fontSize: '15px', color: '#1e293b', marginBottom: '20px', fontWeight: '700'}}>Línea de Tiempo</h3>
            {eventos.length === 0 ? (
              <div style={styles.emptyState}><div style={{fontSize: '40px', marginBottom: '10px'}}>📜</div>No hay eventos registrados aún.</div>
            ) : (
              <div style={styles.timeline}>
                {eventos.map((ev, i) => {
                  // Detectamos si el detalle contiene el link de Google Maps
                  const tieneMapa = ev.detalle.includes("https://www.google.com/maps");
                  let textoLimpio = ev.detalle;
                  let linkMapa = "";
          
                  if (tieneMapa) {
                    // Separamos el texto del link (asumiendo que el link es lo último que enviamos)
                    const partes = ev.detalle.split("https://");
                    textoLimpio = partes[0];
                    linkMapa = "https://" + partes[1];
                  }
          
                  return (
                    <div key={i} style={styles.timelineItem}>
                      <div style={styles.timelineDot}></div>
                      <div style={styles.timelineContent}>
                        <div style={styles.evTitulo}>{ev.evento}</div>
                        
                        <div style={styles.evDetalle}>
                          {textoLimpio}
                          {tieneMapa && (
                            <div style={{ marginTop: '10px' }}>
                              <a 
                                href={linkMapa} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '8px 15px',
                                  backgroundColor: '#2563eb',
                                  color: 'white',
                                  borderRadius: '10px',
                                  textDecoration: 'none',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
                                }}
                              >
                                📍 Ver Ubicación en Mapa
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div style={styles.evFecha}>{new Date(ev.fecha).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- MINI MODAL DE MOTIVO (Añadido) --- */}
        {showMotivo && (
          <div style={styles.motivoOverlay}>
            <div style={styles.motivoBox}>
              <h4 style={{margin: '0 0 10px 0', fontSize: '14px'}}>Detalle del cambio</h4>
              <p style={{fontSize: '12px', color: '#64748b', marginBottom: '10px'}}>
                ¿Por qué estás cambiando a <strong>{estadoTemporal}</strong>?
              </p>
              <textarea 
                style={styles.textArea} 
                placeholder="Ej: El dueño reportó extravío en el parque..."
                value={motivoTexto}
                onChange={(e) => setMotivoTexto(e.target.value)}
              />
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button onClick={confirmarCambio} style={styles.btnConfirmMini}>Confirmar</button>
                <button onClick={() => setShowMotivo(false)} style={styles.btnCancelMini}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- ESTILOS ---
const tabButtonStyle = (active) => ({
  flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
  backgroundColor: active ? 'white' : 'transparent', color: active ? '#1e293b' : '#94a3b8',
  boxShadow: active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: '0.3s'
});

const badgeStyle = (estado) => ({
  display: 'inline-block', fontSize: '10px', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', textTransform: 'uppercase',
  backgroundColor: estado === 'perdido' ? '#fee2e2' : estado === 'encontrado' ? '#fef3c7' : '#dcfce7',
  color: estado === 'perdido' ? '#dc2626' : estado === 'encontrado' ? '#d97706' : '#16a34a'
});

const btnEstadoStyle = (color, activo) => ({
  flex: 1, padding: '10px', borderRadius: '12px', border: `2px solid ${color}`, fontWeight: 'bold', fontSize: '11px', cursor: 'pointer',
  backgroundColor: activo ? color : 'transparent', color: activo ? 'white' : color, transition: '0.2s'
});

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '28px', width: '420px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  closeCornerBtn: { position: 'absolute', top: '-15px', right: '-15px', width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: '3px solid white', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 10 },
  tabContainer: { display: 'flex', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '15px', marginBottom: '25px' },
  notifBadge: { backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '9px', marginLeft: '5px' },
  headerPhotoContainer: { textAlign: 'center', marginBottom: '20px' },
  photoWrapper: { position: 'relative', width: '110px', height: '110px', margin: '0 auto' },
  mainPhoto: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f1f5f9' },
  editPhotoBadge: { position: 'absolute', bottom: '5px', right: '5px', backgroundColor: '#2563eb', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: '2px solid white' },
  petName: { margin: '10px 0 5px 0', fontSize: '24px', color: '#1e293b', fontWeight: '800' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', marginBottom: '20px', textAlign: 'left' },
  miniLabel: { fontSize: '9px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', display: 'block' },
  dataText: { fontSize: '13px', color: '#1e293b', fontWeight: '700' },
  footerSection: { borderTop: '1px solid #f1f5f9', paddingTop: '20px' },
  produccionPanel: { display: 'flex', flexDirection: 'column', gap: '12px' },
  qrPreview: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '15px' },
  btnDownloadMini: { flex: 1, padding: '10px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px' },
  btnConfirmPrint: { padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
  btnShowQR: { width: '100%', padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px dashed #cbd5e1', borderRadius: '12px', fontWeight: '600' },
  qrPreviewExpanded: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' },
  btnSecondaryDark: { padding: '8px', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' },
  btnLink: { background: 'none', border: 'none', color: '#64748b', fontSize: '11px', textDecoration: 'underline', marginTop: '5px' },
  historialContainer: { textAlign: 'left', minHeight: '320px', maxHeight: '400px', overflowY: 'auto' },
  timeline: { borderLeft: '2px solid #e2e8f0', marginLeft: '10px', paddingLeft: '20px', marginTop: '10px' },
  timelineItem: { position: 'relative', marginBottom: '25px' },
  timelineDot: { position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb', border: '3px solid white' },
  evTitulo: { fontWeight: '800', fontSize: '13px', color: '#1e293b' },
  evDetalle: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  evFecha: { fontSize: '10px', color: '#94a3b8', marginTop: '6px' },
  emptyState: { textAlign: 'center', color: '#94a3b8', marginTop: '60px', fontSize: '13px' },

  // --- Estilos del Mini Modal ---
  motivoOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  motivoBox: { backgroundColor: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '80%' },
  textArea: { width: '100%', height: '80px', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '10px', fontSize: '12px', fontFamily: 'inherit', resize: 'none' },
  btnConfirmMini: { flex: 1, backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  btnCancelMini: { flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }
};

export default DetalleMascotaModal;