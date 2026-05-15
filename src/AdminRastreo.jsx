import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [50, 50] });
    }
  }, [coords]);
  return null;
}

const AdminRastreo = () => {
  const [unidades] = useState([{ id: 1, nombre: "PRUEBA_MOVIL_5S" }]);
  const [seleccionada, setSeleccionada] = useState("");
  const [tramos, setTramos] = useState([]); // Los bloques de 1 hora
  const [puntosVisualizados, setPuntosVisualizados] = useState([]); // Lo que se ve en el mapa
  const [tramoActivoIndex, setTramoActivoIndex] = useState(null);

  // Función para agrupar puntos en bloques de 1 hora
  const procesarTramos = (datos) => {
    if (datos.length === 0) return [];
    
    const grupos = [];
    let grupoActual = [];
    let inicioBloque = new Date(datos[0].fecha_hora);

    datos.forEach((p, index) => {
      const fechaPunto = new Date(p.fecha_hora);
      const diferenciaHoras = (fechaPunto - inicioBloque) / (1000 * 60 * 60);

      // Si el punto entra en la misma hora o es el último
      if (diferenciaHoras < 1) {
        grupoActual.push(p);
      } else {
        // Guardamos el tramo completado
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: fechaPunto.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
          cantidad: grupoActual.length
        });
        // Iniciamos nuevo bloque
        grupoActual = [p];
        inicioBloque = fechaPunto;
      }

      // Si es el último registro, cerramos el grupo
      if (index === datos.length - 1) {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: fechaPunto.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
          cantidad: grupoActual.length
        });
      }
    });

    return grupos.reverse(); // Lo más reciente primero
  };

  const cargarHistorial = async (id, nombre) => {
    try {
      const res = await axios.get(`https://api-qrplacas.onrender.com/api/gps/historial/${id}`);
      const tramosProcesados = procesarTramos(res.data);
      
      setTramos(tramosProcesados);
      setSeleccionada(nombre);
      
      // Por defecto mostrar el tramo más reciente (el primero de la lista invertida)
      if (tramosProcesados.length > 0) {
        verTramo(0, tramosProcesados[0].puntos);
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  const verTramo = (index, pts) => {
    setTramoActivoIndex(index);
    setPuntosVisualizados(pts);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* SIDEBAR DE UNIDADES */}
        <div style={{ flex: '1', minWidth: '250px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>🚚 Unidades</h3>
          {unidades.map(u => (
            <div key={u.id} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{u.nombre}</p>
              <button 
                onClick={() => cargarHistorial(u.id, u.nombre)}
                style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cargar Tramos
              </button>
            </div>
          ))}
        </div>

        {/* MAPA PRINCIPAL */}
        <div style={{ flex: '3', minWidth: '400px', height: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <MapContainer center={[18.8497, -97.1036]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {puntosVisualizados.length > 0 && (
              <>
                <Polyline positions={puntosVisualizados} color="#2563eb" weight={6} opacity={0.8} />
                <Marker position={puntosVisualizados[puntosVisualizados.length - 1]}>
                  <Popup>Fin del tramo seleccionado</Popup>
                </Marker>
                <Marker position={puntosVisualizados[0]}>
                   <Popup>Inicio del tramo seleccionado</Popup>
                </Marker>
                <RecenterMap coords={puntosVisualizados} />
              </>
            )}
          </MapContainer>
        </div>
      </div>

      {/* TABLA DE TRAMOS POR HORA */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>⏱️ Historial de Tramos (Cortes de 1 Hora)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Periodo</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Puntos Capturados</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Estado</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Mapa</th>
            </tr>
          </thead>
          <tbody>
            {tramos.length > 0 ? tramos.map((t, i) => (
              <tr key={i} style={{ backgroundColor: tramoActivoIndex === i ? '#eff6ff' : 'transparent' }}>
                <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                   De <b>{t.inicio}</b> a <b>{t.fin}</b>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{t.cantidad} pts</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                   <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#166534' }}>Completado</span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                  <button 
                    onClick={() => verTramo(i, t.puntos)}
                    style={{ padding: '6px 12px', backgroundColor: tramoActivoIndex === i ? '#1e40af' : '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {tramoActivoIndex === i ? "Visualizando" : "Ver en Mapa"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Selecciona una unidad para desglosar tramos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRastreo;