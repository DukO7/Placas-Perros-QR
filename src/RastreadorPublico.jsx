import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RastreadorPublico = () => {
  const [tracking, setTracking] = useState(false);
  const [logs, setLogs] = useState([]); 
  const [error, setError] = useState(null);
  const [ultimaPos, setUltimaPos] = useState({ lat: null, lng: null });
  
  const logsRef = useRef([]);
  const intervalRef = useRef(null); // Para controlar los 5 segundos

  const agregarLog = (mensaje) => {
    const nuevoLog = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString(),
      msg: mensaje
    };
    const actualizados = [nuevoLog, ...logsRef.current].slice(0, 10);
    logsRef.current = actualizados;
    setLogs(actualizados);
  };

  const obtenerYEnviarUbicacion = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta GPS.");
      return;
    }
  
    // Definimos las opciones fuera para que sea más claro
    const opcionesGps = { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 0 
    };
  
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUltimaPos({ lat: latitude, lng: longitude });
  
        try {
          await axios.post('https://api-qrplacas.onrender.com/api/rastreo-prueba', {
            conductor_id: 1,
            unidad: "PRUEBA_MOVIL_5S",
            lat: latitude,
            lng: longitude,
            precision: accuracy
          });
          
          agregarLog(`✅ Enviado (5s): ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } catch (err) {
          agregarLog(`❌ Error de red: ${err.message}`);
        }
      },
      (err) => {
        setError(err.message);
        agregarLog(`⚠️ Error GPS: ${err.message}`);
      },
      opcionesGps // <--- ¡Asegúrate de que este sea el tercer argumento!
    );
  };
  useEffect(() => {
    if (tracking) {
      agregarLog("🚀 Rastreo programado cada 5s...");
      
      // Intentar mantener la pantalla encendida (WakeLock)
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {
          console.log("WakeLock no disponible");
        });
      }

      // Ejecutar inmediatamente y luego cada 5 segundos
      obtenerYEnviarUbicacion();
      intervalRef.current = setInterval(obtenerYEnviarUbicacion, 5000);
      
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        agregarLog("🛑 Rastreo detenido.");
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tracking]);

  return (
    <div style={{ 
      padding: '20px', maxWidth: '500px', margin: '0 auto', 
      fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' 
    }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b' }}>🛰️ Monitor de Ruta (5s)</h2>
      
      <button 
        onClick={() => setTracking(!tracking)}
        style={{
          width: '100%', padding: '20px', borderRadius: '15px', border: 'none',
          backgroundColor: tracking ? '#ef4444' : '#22c55e',
          color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer'
        }}
      >
        {tracking ? "DETENER TRANSMISIÓN" : "INICIAR TRANSMISIÓN"}
      </button>

      <div style={{ 
        backgroundColor: 'white', padding: '15px', borderRadius: '12px', 
        border: '1px solid #e2e8f0', marginBottom: '20px', textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>ÚLTIMA POSICIÓN:</p>
        <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'mono', color: '#0f172a' }}>
          {ultimaPos.lat ? `${ultimaPos.lat.toFixed(6)}, ${ultimaPos.lng.toFixed(6)}` : "Sin señal"}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', margin: '0 0 5px 5px' }}>Historial de envíos (Últimos 10):</p>
        {logs.map(log => (
          <div key={log.id} style={{ 
            backgroundColor: 'white', padding: '10px 15px', borderRadius: '10px', 
            fontSize: '13px', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>[{log.hora}]</span> {log.msg}
          </div>
        ))}
        {logs.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No hay actividad reciente.</p>}
      </div>

      {error && (
        <div style={{ 
          marginTop: '20px', padding: '10px', backgroundColor: '#fee2e2', 
          color: '#b91c1c', borderRadius: '8px', fontSize: '12px', textAlign: 'center' 
        }}>
          ❌ Error: {error}
        </div>
      )}
    </div>
  );
};

export default RastreadorPublico;