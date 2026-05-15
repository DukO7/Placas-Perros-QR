import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconos personalizados
const iconInicio = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const iconFin = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(coords, { padding: [30, 30] });
    }
  }, [coords]);
  return null;
}

const AdminRastreo = () => {
  const [unidades] = useState([{ id: 1, nombre: "PRUEBA_MOVIL_5S" }]);
  const [fechaDesde, setFechaDesde] = useState(new Date(Date.now() - 864e5).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [tramos, setTramos] = useState([]);
  const [puntosVisualizados, setPuntosVisualizados] = useState([]);
  const [tramoActivoIndex, setTramoActivoIndex] = useState(null);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const procesarTramos = (datos) => {
    if (datos.length === 0) return [];
    const grupos = [];
    let grupoActual = [];
    let inicioBloque = new Date(datos[0].fecha_hora);
    let distanciaAcumulada = 0;

    datos.forEach((p, index) => {
      const fechaPunto = new Date(p.fecha_hora);
      const lat = parseFloat(p.latitud);
      const lng = parseFloat(p.longitud);

      if (grupoActual.length > 0) {
        const lastP = grupoActual[grupoActual.length - 1];
        distanciaAcumulada += calcularDistancia(parseFloat(lastP.latitud), parseFloat(lastP.longitud), lat, lng);
      }

      const diferenciaHoras = (fechaPunto - inicioBloque) / (1000 * 60 * 60);
      if (diferenciaHoras < 1) {
        grupoActual.push(p);
      } else {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: fechaPunto.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
          km: distanciaAcumulada.toFixed(2)
        });
        grupoActual = [p];
        inicioBloque = fechaPunto;
        distanciaAcumulada = 0;
      }

      if (index === datos.length - 1) {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: fechaPunto.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
          km: distanciaAcumulada.toFixed(2)
        });
      }
    });
    return grupos.reverse();
  };

  const cargarHistorial = async (id) => {
    try {
      const res = await axios.get(`https://api-qrplacas.onrender.com/api/gps/historial/${id}`);
      const datosFiltrados = res.data.filter(p => {
        const fechaPunto = p.fecha_hora.split('T')[0];
        return fechaPunto >= fechaDesde && fechaPunto <= fechaHasta;
      });
      const tramosProcesados = procesarTramos(datosFiltrados);
      setTramos(tramosProcesados);
      // RESET: Al analizar, limpiamos la selección previa del mapa
      setTramoActivoIndex(null);
      setPuntosVisualizados([]);
    } catch (err) {
      console.error(err);
    }
  };

  const verTramo = (index, pts) => {
    // Si ya está seleccionado, lo ocultamos (Toggle)
    if (tramoActivoIndex === index) {
      setTramoActivoIndex(null);
      setPuntosVisualizados([]);
    } else {
      setTramoActivoIndex(index);
      setPuntosVisualizados(pts);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ padding: '15px 25px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>📍 Panel de Monitoreo</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#64748b' }}>DESDE</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} style={{border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px'}}/>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', color: '#64748b' }}>HASTA</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} style={{border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px'}}/>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '15px', gap: '15px' }}>
        
        {/* SIDEBAR */}
        <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto', padding: '15px' }}>
            <h4 style={{ marginTop: 0, fontSize: '14px', color: '#64748b' }}>UNIDADES ACTIVAS</h4>
            {unidades.map(u => (
              <div key={u.id} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '8px', backgroundColor: '#fdfdfd' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{u.nombre}</div>
                <button onClick={() => cargarHistorial(u.id)} style={{ width: '100%', padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Analizar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENEDOR DINÁMICO */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'hidden' }}>
          
          {/* MAPA CONDICIONAL */}
          {puntosVisualizados.length > 0 ? (
            <div style={{ height: '450px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', transition: 'all 0.3s ease' }}>
              <MapContainer center={[18.8497, -97.1036]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={puntosVisualizados} color="#2563eb" weight={5} opacity={0.7} dashArray="1, 10" /> 
                <Polyline positions={puntosVisualizados} color="#2563eb" weight={2} opacity={1} /> 
                <Marker position={puntosVisualizados[0]} icon={iconInicio}><Popup>🏁 Inicio</Popup></Marker>
                <Marker position={puntosVisualizados[puntosVisualizados.length - 1]} icon={iconFin}><Popup>🛑 Fin</Popup></Marker>
                <RecenterMap coords={puntosVisualizados} />
              </MapContainer>
            </div>
          ) : (
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#94a3b8' }}>
              Seleccione un tramo en la tabla para visualizar el mapa
            </div>
          )}

          {/* TABLA TRAMOS */}
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>BLOQUE HORARIO</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>PUNTOS</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>DISTANCIA</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {tramos.length > 0 ? tramos.map((t, i) => (
                  <tr key={i} style={{ backgroundColor: tramoActivoIndex === i ? '#eff6ff' : 'transparent' }}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}><b>{t.inicio}</b> a <b>{t.fin}</b></td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>{t.puntos.length} pts</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}><span style={{ color: '#059669', fontWeight: 'bold' }}>{t.km} km</span></td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                      <button 
                        onClick={() => verTramo(i, t.puntos)}
                        style={{ padding: '6px 16px', backgroundColor: tramoActivoIndex === i ? '#ef4444' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        {tramoActivoIndex === i ? "Ocultar Mapa" : "Ver en Mapa"}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay datos cargados. Use el botón "Analizar".</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRastreo;