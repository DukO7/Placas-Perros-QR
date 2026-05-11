import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir iconos de Leaflet por defecto en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para re-centrar el mapa cuando cambian las coordenadas
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.panTo(coords[coords.length - 1]);
    }
  }, [coords]);
  return null;
}

const AdminRastreo = () => {
  const [unidades] = useState(["SIN_NOMBRE"]); // Lista de conductores/unidades
  const [seleccionada, setSeleccionada] = useState("");
  const [puntos, setPuntos] = useState([]); // [[lat, lng], [lat, lng]...]

  const cargarHistorial = async (unidad) => {
    try {
      const res = await axios.get(`https://api-qrplacas.onrender.com/api/historial/${unidad}`);
      const ruta = res.data.map(p => [parseFloat(p.latitud), parseFloat(p.longitud)]);
      setPuntos(ruta);
      setSeleccionada(unidad);
    } catch (err) {
      console.error("Error cargando ruta");
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {/* PANEL LATERAL: SELECCIÓN */}
      <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0 }}>🚚 Unidades Activas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>ID Unidad</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map(u => (
              <tr key={u} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontSize: '14px' }}>{u}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  <button 
                    onClick={() => cargarHistorial(u)}
                    style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Ver Ruta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {puntos.length > 0 && (
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '15px' }}>
            📍 Mostrando <b>{puntos.length}</b> puntos de recorrido.
          </p>
        )}
      </div>

      {/* MAPA PRINCIPAL */}
      <div style={{ flex: '3', minWidth: '400px', height: '600px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <MapContainer center={[19.4326, -99.1332]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {puntos.length > 0 && (
            <>
              {/* Línea que une los puntos (el camino) */}
              <Polyline positions={puntos} color="#2563eb" weight={5} opacity={0.7} />
              
              {/* Marcador en la posición más reciente */}
              <Marker position={puntos[puntos.length - 1]}>
                <Popup>Última ubicación de {seleccionada}</Popup>
              </Marker>

              <RecenterMap coords={puntos} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default AdminRastreo;