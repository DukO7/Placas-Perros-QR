import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DetalleMascotaModal from './DetalleMascotaModal';

const ClienteView = (props) => {
    // Extraemos las funciones y datos que vienen desde App.jsx
    const { usuario, actualizarEstado, onLogout, seleccionada, setSeleccionada } = props;
  
    // Estado local para las mascotas de ESTE cliente
    const [misMascotas, setMisMascotas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorServicio, setErrorServicio] = useState(null);

    useEffect(() => {
        const fetchMisMascotas = async () => {
          // Si no hay ID de usuario, no intentamos disparar el servicio
          if (!usuario?.id) {
            console.error("No se detectó ID de usuario");
            setCargando(false);
            return;
          }

          try {
            // Disparamos la petición al servicio filtrado por ID de usuario
            const response = await axios.get(`https://api-qrplacas.onrender.com/api/mascotas/usuario/${usuario.id}`);
            
            // Si la respuesta es exitosa, guardamos los datos
            setMisMascotas(response.data);
          } catch (error) {
            console.error("Error cargando tus mascotas:", error);
            setErrorServicio("No se pudo conectar con el servidor de mascotas.");
          } finally {
            // Quitamos el estado de carga siempre, falle o funcione
            setCargando(false);
          }
        };
    
        fetchMisMascotas();
      }, [usuario.id]);

    // --- RENDERIZADO DE CARGA ---
    if (cargando) {
        return (
            <div style={{ 
                height: '100vh', display: 'flex', flexDirection: 'column', 
                justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' 
            }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>🐾</div>
                <p style={{ fontFamily: 'sans-serif', fontWeight: 'bold', color: '#64748b' }}>
                    Sincronizando tus mascotas...
                </p>
            </div>
        );
    }

    // Estilos del Dashboard adaptados
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

            {/* ERROR DE SERVICIO */}
            {errorServicio && (
                <div style={{ textAlign: 'center', color: '#dc2626', marginBottom: '20px', fontWeight: 'bold' }}>
                    {errorServicio}
                </div>
            )}

            {/* CUERPO - GRILLA DE TARJETAS */}
            <div style={styles.grid}>
                {misMascotas.length === 0 && !errorServicio ? (
                    <div style={{ 
                        gridColumn: '1/-1', textAlign: 'center', padding: '50px', 
                        backgroundColor: 'white', borderRadius: '24px', color: '#64748b' 
                    }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>No tienes mascotas registradas.</p>
                        <p>Contacta al administrador para vincular tus placas 3D.</p>
                    </div>
                ) : (
                    misMascotas.map(m => (
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

            {/* MODAL DE DETALLES REUTILIZADO */}
            {/* Le pasamos 'misMascotas' como la lista de referencia al modal */}
            <DetalleMascotaModal {...props} mascotas={misMascotas} />
        </div>
    );
};

export default ClienteView;