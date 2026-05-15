import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconos personalizados para Inicio y Fin
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

  const procesarTramos = (datos) => {
    if (datos.length === 0) return [];
    const grupos = [];
    let grupoActual = [];
    let inicioBloque = new Date(datos[0].fecha_hora);

    datos.forEach((p, index) => {
      const fechaPunto = new Date(p.fecha_hora);
      const diferenciaHoras = (fechaPunto - inicioBloque) / (1000 * 60 * 60);
      if (diferenciaHoras < 1) {
        grupoActual.push(p);
      } else {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: fechaPunto.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
        });
        grupoActual = [p];
        inicioBloque = fechaPunto;
      }
      if (index === datos.length - 1) {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: fechaPunto.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
        });
      }
    });
    return grupos.reverse();
  };

  const cargarHistorial = async (id) => {
    try {
      const res = await axios.get(`https://api-qrplacas.onrender.com/api/gps/historial/${id}`);
      // Filtrar por fecha en el cliente (puedes hacerlo en el server después)
      const datosFiltrados = res.data.filter(p => {
        const fechaPunto = p.fecha_hora.split('T')[0]; // O el formato que use tu DB
        return fechaPunto >= fechaDesde && fechaPunto <= fechaHasta;
      });
      const tramosProcesados = procesarTramos(datosFiltrados);
      setTramos(tramosProcesados);
      if (tramosProcesados.length > 0) verTramo(0, tramosProcesados[0].puntos);
    } catch (err) {
      console.error(err);
    }
  };

  const verTramo = (index, pts) => {
    setTramoActivoIndex(index);
    setPuntosVisualizados(pts);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* HEADER / FILTROS */}
      <div style={{ padding: '15px 25px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>📍 Panel de Monitoreo</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
  <div>
    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>Desde:</label>
    <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
  </div>
  <div>
    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block' }}>Hasta:</label>
    <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
  </div>
</div>
      </div>

      {/* CONTENIDO PRINCIPAL (Dashboard) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '15px', gap: '15px' }}>
        
        {/* SIDEBAR UNIDADES (Scroll independiente) */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto', padding: '15px' }}>
            <h4 style={{ marginTop: 0 }}>🚚 Unidades</h4>
            {unidades.map(u => (
              <div key={u.id} style={{ padding: '12px', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>{u.nombre}</div>
                <button 
                  onClick={() => cargarHistorial(u.id)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Analizar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENEDOR MAPA Y TRAMOS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'hidden' }}>
          
          {/* MAPA (Altura Fija) */}
          <div style={{ height: '400px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative' }}>
            <MapContainer center={[18.8497, -97.1036]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {puntosVisualizados.length > 1 && (
                <>
                  <Polyline positions={puntosVisualizados} color="#2563eb" weight={5} opacity={0.7} dashArray="1, 10" /> 
                  <Polyline positions={puntosVisualizados} color="#2563eb" weight={2} opacity={1} /> 
                  
                  {/* Marcador de INICIO */}
                  <Marker position={puntosVisualizados[0]} icon={iconInicio}>
                    <Popup>🏁 Inicio del tramo</Popup>
                  </Marker>

                  {/* Marcador de FIN */}
                  <Marker position={puntosVisualizados[puntosVisualizados.length - 1]} icon={iconFin}>
                    <Popup>🛑 Fin del tramo (Actual)</Popup>
                  </Marker>

                  <RecenterMap coords={puntosVisualizados} />
                </>
              )}
            </MapContainer>
            <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000, backgroundColor: 'white', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
               🟢 Inicio | 🔴 Fin
            </div>
          </div>

          {/* TABLA TRAMOS (Scroll independiente) */}
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Bloque Horario</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Puntos</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {tramos.map((t, i) => (
                  <tr key={i} style={{ backgroundColor: tramoActivoIndex === i ? '#eff6ff' : 'transparent' }}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{t.inicio} - {t.fin}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>{t.puntos.length}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                      <button 
                        onClick={() => verTramo(i, t.puntos)}
                        style={{ padding: '5px 10px', backgroundColor: tramoActivoIndex === i ? '#1e40af' : '#f1f5f9', color: tramoActivoIndex === i ? 'white' : '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRastreo;