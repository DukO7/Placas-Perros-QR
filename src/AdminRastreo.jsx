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
      map.fitBounds(coords, { padding: [40, 40] });
    }
  }, [coords]);
  return null;
}

const AdminRastreo = () => {
  const [unidades] = useState([{ id: 1, nombre: "PRUEBA_MOVIL_5S" }]);
  const [fechaDesde, setFechaDesde] = useState(new Date(Date.now() - 864e5).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  
  const [tramos, setTramos] = useState([]);
  const [indicesSeleccionados, setIndicesSeleccionados] = useState([]); // Array para múltiples filas
  const [puntosMapa, setPuntosMapa] = useState([]); // Puntos acumulados

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
      const lat = parseFloat(p.latitud);
      const lng = parseFloat(p.longitud);
      if (grupoActual.length > 0) {
        const lastP = grupoActual[grupoActual.length - 1];
        distanciaAcumulada += calcularDistancia(parseFloat(lastP.latitud), parseFloat(lastP.longitud), lat, lng);
      }
      const diferenciaHoras = (new Date(p.fecha_hora) - inicioBloque) / (1000 * 60 * 60);
      
      if (diferenciaHoras < 1) {
        grupoActual.push(p);
      } else {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: new Date(p.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          puntos: grupoActual.map(pt => [parseFloat(pt.latitud), parseFloat(pt.longitud)]),
          km: distanciaAcumulada.toFixed(2)
        });
        grupoActual = [p];
        inicioBloque = new Date(p.fecha_hora);
        distanciaAcumulada = 0;
      }
      if (index === datos.length - 1) {
        grupos.push({
          inicio: inicioBloque.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fin: new Date(p.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        const f = p.fecha_hora.split('T')[0];
        return f >= fechaDesde && f <= fechaHasta;
      });
      setTramos(procesarTramos(datosFiltrados));
      setIndicesSeleccionados([]); // Limpiar selección al cambiar unidad
      setPuntosMapa([]);
    } catch (err) { console.error(err); }
  };

  const toggleTramo = (index) => {
    let nuevasSelecciones;
    if (indicesSeleccionados.includes(index)) {
      nuevasSelecciones = indicesSeleccionados.filter(i => i !== index);
    } else {
      nuevasSelecciones = [...indicesSeleccionados, index];
    }
    
    setIndicesSeleccionados(nuevasSelecciones);

    // Unimos todos los puntos de los tramos seleccionados respetando el orden cronológico
    // Ordenamos las selecciones para que el trazado no salte aleatoriamente
    const puntosUnidos = nuevasSelecciones
      .sort((a, b) => b - a) // Invertido porque los tramos están en reverse()
      .flatMap(idx => tramos[idx].puntos);
    
    setPuntosMapa(puntosUnidos);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ padding: '12px 25px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', color: '#1e293b' }}>📍 Monitoreo Municipal</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} style={{padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1'}} />
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} style={{padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1'}} />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '15px', gap: '15px' }}>
        
        {/* SIDEBAR UNIDADES */}
        <div style={{ width: '240px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '15px', overflowY: 'auto' }}>
          <h4 style={{ color: '#64748b', fontSize: '12px', marginBottom: '15px' }}>UNIDADES</h4>
          {unidades.map(u => (
            <div key={u.id} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{u.nombre}</div>
              <button onClick={() => cargarHistorial(u.id)} style={{ width: '100%', padding: '6px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Analizar</button>
            </div>
          ))}
        </div>

        {/* MAPA Y TABLA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflow: 'hidden' }}>
          
          {/* MAPA DINÁMICO */}
          <div style={{ height: puntosMapa.length > 0 ? '400px' : '0px', transition: 'height 0.4s ease', overflow: 'hidden', borderRadius: '12px', border: puntosMapa.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
            <MapContainer center={[18.8497, -97.1036]} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {puntosMapa.length > 0 && (
                <>
                  <Polyline positions={puntosMapa} color="#2563eb" weight={5} opacity={0.6} dashArray="5, 10" />
                  <Polyline positions={puntosMapa} color="#2563eb" weight={3} opacity={1} />
                  <Marker position={puntosMapa[0]} icon={iconInicio}><Popup>Inicio del trayecto</Popup></Marker>
                  <Marker position={puntosMapa[puntosMapa.length - 1]} icon={iconFin}><Popup>Posición final</Popup></Marker>
                  <RecenterMap coords={puntosMapa} />
                </>
              )}
            </MapContainer>
          </div>

          {/* TABLA DE TRAMOS */}
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>MOSTRAR</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>HORARIO</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>DISTANCIA</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>PUNTOS</th>
                </tr>
              </thead>
              <tbody>
                {tramos.map((t, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: indicesSeleccionados.includes(i) ? '#f0f9ff' : 'transparent' }}>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      {/* ESTE ES EL SWITCH / TOGGLE */}
                      <label style={{ position: 'relative', display: 'inline-block', width: '34px', height: '20px' }}>
                        <input 
                          type="checkbox" 
                          checked={indicesSeleccionados.includes(i)} 
                          onChange={() => toggleTramo(i)} 
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{ 
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                          backgroundColor: indicesSeleccionados.includes(i) ? '#2563eb' : '#ccc', 
                          transition: '.4s', borderRadius: '20px' 
                        }}>
                          <span style={{ 
                            position: 'absolute', height: '14px', width: '14px', left: '3px', bottom: '3px', 
                            backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                            transform: indicesSeleccionados.includes(i) ? 'translateX(14px)' : 'none'
                          }}></span>
                        </span>
                      </label>
                    </td>
                    <td style={{ padding: '12px' }}>{t.inicio} - {t.fin}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#0369a1' }}>{t.km} km</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{t.puntos.length} pts</td>
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