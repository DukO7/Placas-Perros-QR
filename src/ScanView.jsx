import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScanView = ({ mascotas }) => {
    // 1. Estados para manejar los datos dinámicamente
    const [perroLocal, setPerroLocal] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [reportando, setReportando] = useState(false);
    const [modalCerrado, setModalCerrado] = useState(false);

    const currentPath = window.location.pathname;
    const idUrl = currentPath.split('/')[2];

    // 🔗 CONFIGURACIÓN DE URL: 
    // Cambia esto a tu URL actual de ngrok (la que apunta al puerto 3000 de tu servidor)
    const API_BASE = "https://api-qrplacas.onrender.com";

    // 2. Efecto para cargar los datos del perro apenas se abre la página
    useEffect(() => {
        const fetchDatos = async () => {
            // Intentamos buscarlo en las props (si eres el administrador)
            const encontrado = mascotas?.find(m => m.custom_id === idUrl);
            
            if (encontrado) {
                setPerroLocal(encontrado);
                setCargando(false);
            } else {
                // Si es el público (props vacías), lo pedimos al servidor vía ngrok
                try {
                    const res = await axios.get(`${API_BASE}/api/mascotas/public/${idUrl}`);
                    setPerroLocal(res.data);
                } catch (error) {
                    console.error("Error al obtener mascota:", error);
                } finally {
                    setCargando(false);
                }
            }
        };
        fetchDatos();
    }, [idUrl, mascotas]);

    const enviarUbicacion = () => {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        setReportando(true);

        const opcionesGps = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

                try {
                    // 🚀 USAMOS API_BASE para asegurar que llegue al servidor desde el celular
                    await axios.post(`${API_BASE}/api/historial`, {
                        mascota_id: perroLocal.id,
                        evento: "📍 Ubicación Reportada",
                        detalle: `Escaneo detectado. Ubicación GPS del rescatista: ${googleMapsLink}`
                    });
                    alert("¡Ubicación enviada! Muchas gracias por ayudar.");
                    setModalCerrado(true);
                } catch (error) {
                    console.error("Error al reportar:", error);
                    alert("Error de conexión con el servidor.");
                } finally {
                    setReportando(false);
                }
            },
            (error) => {
                setReportando(false);
                if (error.code === 1) {
                    alert("Favor de permitir el acceso al GPS en tu navegador.");
                } else {
                    alert("Error al obtener ubicación: " + error.message);
                }
            },
            opcionesGps
        );
    };

    if (cargando) return (
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'system-ui' }}>
            <h2>Buscando datos de la mascota... 🐾</h2>
        </div>
    );

    if (!perroLocal) {
        return (
            <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'system-ui' }}>
                <h2>Mascota no encontrada ⚠️</h2>
                <p>El código QR no coincide con nuestros registros.</p>
            </div>
        );
    }

    // Renombramos para mantener tu diseño original
    const perro = perroLocal;

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#eef2f7', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '20px', 
            fontFamily: 'system-ui',
            position: 'relative',
            overflow: 'hidden'
        }}>
            
            {/* --- MODAL EMERGENCIA --- */}
            {perro.estado === 'perdido' && !modalCerrado && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 3000, 
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '35px 25px', borderRadius: '32px',
                        textAlign: 'center', maxWidth: '400px', width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
                    }}>
                        <button 
                            onClick={() => setModalCerrado(true)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
                        >✕</button>

                        <div style={{ fontSize: '60px', marginBottom: '10px' }}>🆘</div>
                        <h2 style={{ color: '#dc3545', margin: '0 0 10px 0', fontWeight: '800' }}>¡ESTOY PERDIDO!</h2>
                        <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.5', marginBottom: '25px' }}>
                            Hola, mi familia me está buscando. Por favor, <b>comparte tu ubicación</b> para que puedan venir por mí.
                        </p>
                        
                        <button 
                            onClick={enviarUbicacion}
                            disabled={reportando}
                            style={{
                                width: '100%', padding: '18px', backgroundColor: '#2563eb', color: 'white',
                                border: 'none', borderRadius: '18px', fontWeight: '800', fontSize: '16px',
                                cursor: 'pointer', marginBottom: '12px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                            }}
                        >
                            {reportando ? '⌛ ENVIANDO...' : '📍 COMPARTIR UBICACIÓN'}
                        </button>
                        
                        <a href={`tel:${perro.contacto}`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            width: '100%', 
                            padding: '18px',
                            backgroundColor: '#16a34a',
                            color: 'white', 
                            borderRadius: '18px', 
                            textDecoration: 'none',
                            fontWeight: '800', 
                            fontSize: '16px', 
                            textAlign: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <span>📞</span> LLAMAR AL DUEÑO
                        </a>
                        
                        <button 
                            onClick={() => setModalCerrado(true)}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}
                        >Solo quiero ver la ficha</button>
                    </div>
                </div>
            )}

            {/* HUELLAS DE FONDO */}
            <div style={{ position: 'absolute', top: '5%', left: '5%', fontSize: '40px', opacity: 0.1, transform: 'rotate(-20deg)' }}>🐾</div>
            <div style={{ position: 'absolute', top: '15%', right: '10%', fontSize: '30px', opacity: 0.1, transform: 'rotate(15deg)' }}>🐾</div>
            <div style={{ position: 'absolute', bottom: '10%', left: '15%', fontSize: '35px', opacity: 0.1, transform: 'rotate(-10deg)' }}>🐾</div>
            <div style={{ position: 'absolute', bottom: '20%', right: '5%', fontSize: '45px', opacity: 0.1, transform: 'rotate(25deg)' }}>🐾</div>

            <div style={{ 
                backgroundColor: 'white', width: '100%', maxWidth: '450px', 
                borderRadius: '35px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                position: 'relative', zIndex: 1
            }}>
                {/* CABECERA DINÁMICA */}
                <div style={{ 
                    background: perro.estado === 'perdido' 
                        ? 'linear-gradient(135deg, #dc3545 0%, #a71d2a 100%)' 
                        : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', 
                    padding: '40px 20px', color: 'white', textAlign: 'center',
                    borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px'
                }}>
                    
                    <div style={{ 
                        width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto 15px',
                        backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
                        border: '4px solid rgba(255,255,255,0.3)', overflow: 'hidden',
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        {perro.foto && perro.foto.length > 20 ? (
                            <img src={perro.foto} alt={perro.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '60px' }}>🐶</span>
                        )}
                    </div>

                    <h1 style={{ margin: 0, fontSize: '28px' }}>{perro.nombre}</h1>
                    <p style={{ opacity: 0.9, fontSize: '18px', fontWeight: '300', margin: '5px 0 0 0' }}>{perro.raza}</p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div style={{ 
                        width: '100%', height: '180px', borderRadius: '20px', overflow: 'hidden', 
                        marginBottom: '25px', border: '1px solid #e2e8f0', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' 
                    }}>
                        <iframe
                            width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(perro.direccion)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`}
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '20px' }}>👤</span>
                            <div>
                                <label style={{ fontSize: '11px', color: '#888', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Dueño</label>
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>{perro.dueno}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '20px' }}>📍</span>
                            <div>
                                <label style={{ fontSize: '11px', color: '#888', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Dirección</label>
                                <span style={{ fontWeight: '600', color: '#1e293b' }}>{perro.direccion}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        marginBottom: '25px', padding: '15px', textAlign: 'center', borderRadius: '18px', 
                        backgroundColor: perro.estado === 'perdido' ? '#fff5f5' : '#f0fff4', 
                        color: perro.estado === 'perdido' ? '#dc3545' : '#28a745', 
                        fontWeight: '900', border: `2px solid ${perro.estado === 'perdido' ? '#feb2b2' : '#9ae6b4'}`,
                        letterSpacing: '1px'
                    }}>
                        {perro.estado === 'perdido' ? '🆘 REPORTE: PERDIDO' : '💚 ESTADO: PROTEGIDO'}
                    </div>

                    <a href={`tel:${perro.contacto}`} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        backgroundColor: '#28a745', color: 'white', padding: '15px', 
                        borderRadius: '18px', textDecoration: 'none', fontWeight: '800', fontSize: '18px',
                        boxShadow: '0 10px 20px rgba(40, 167, 69, 0.3)', width: '100%', boxSizing: 'border-box'
                    }}>
                        <span>📞</span> LLAMAR AL DUEÑO
                    </a>
                    
                    <button 
                        onClick={enviarUbicacion}
                        disabled={reportando}
                        style={{
                            width: '100%', marginTop: '10px', padding: '12px', backgroundColor: 'transparent',
                            color: '#64748b', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'
                        }}
                    >
                        {reportando ? '⌛ Enviando...' : '📍 Compartir mi ubicación actual'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScanView;