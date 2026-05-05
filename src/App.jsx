import { useState, useEffect } from 'react'
import axios from 'axios'
import ScanView from './ScanView'
import DashboardView from './DashboardView'

// 🔗 1. Cambiamos la IP local por tu URL de Render
const API_BASE = 'https://api-qrplacas.onrender.com/api/mascotas';

function App() {
  const [mascotas, setMascotas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    fetchMascotas();
  }, []);

  // --- 🔄 CARGAR DATOS ---
  const fetchMascotas = async () => {
    try {
      const response = await axios.get(API_BASE);
      // PostgreSQL devuelve los datos en el mismo formato, así que response.data funciona igual
      setMascotas(response.data);
    } catch (error) {
      console.error("Error cargando mascotas:", error);
    }
  };

  // --- ➕ AGREGAR MASCOTA ---
  const agregarMascota = async (nueva) => {
    try {
      const response = await axios.post(API_BASE, nueva);
      // El backend ahora devuelve el nuevo ID generado por Postgres
      setMascotas([...mascotas, response.data]);
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  // --- 🗑️ ELIMINAR MASCOTA ---
  const eliminarMascota = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar a esta mascota?")) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        setMascotas(mascotas.filter(m => m.id !== id));
        alert("Mascota eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // --- ✅ MARCAR COMO IMPRESO ---
  const marcarComoImpreso = async (id) => {
    try {
      // Usamos la constante API_BASE para que pegue en Render
      await axios.patch(`${API_BASE}/${id}/impreso`);
      
      setMascotas(mascotas.map(m => 
        m.id === id ? { ...m, impreso: 1 } : m
      ));
    } catch (error) {
      console.error("Error al actualizar impresión:", error);
    }
  };

  // --- 📍 ACTUALIZAR ESTADO (CORREGIDO) ---
  const actualizarEstado = async (id, nuevoEstado, motivo) => {
    try {
      // 🚀 ELIMINAMOS LAS IPS LOCALES AQUÍ TAMBIÉN
      const respuesta = await axios.patch(`${API_BASE}/${id}/estado`, { 
        estado: nuevoEstado, 
        motivo: motivo 
      });
      
      console.log("Respuesta del servidor:", respuesta.data);

      setMascotas(prev => prev.map(m => m.id === id ? { ...m, estado: nuevoEstado } : m));
      setSeleccionada(prev => (prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev));

    } catch (error) {
      console.error("Error en la petición PATCH:", error);
      throw error; 
    }
  };

  // --- LÓGICA DE CONTEO Y SVG (Se mantiene igual) ---
  const contar = (estado) => mascotas.filter(m => m.estado === estado).length;

  const descargarSVG = (nombre) => {
    const svgOriginal = document.getElementById("qr-pro");
    if (!svgOriginal) return;
    const clon = svgOriginal.cloneNode(true);
    const elementos = clon.querySelectorAll('*');
    elementos.forEach(el => {
      const fill = el.getAttribute('fill')?.toLowerCase();
      if (fill === '#ffffff' || fill === 'white' || fill === 'rgba(255,255,255,1)' || fill === 'none' || !fill) {
        el.remove();
      } else {
        el.setAttribute('fill', '#000000');
      }
    });
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clon);
    const finalSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${svgString}`;
    const blob = new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PLACA_3D_${nombre.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // --- RENDERIZADO ---
  if (currentPath.startsWith('/scan/')) {
    // IMPORTANTE: Aquí pasamos la lista de mascotas para que ScanView intente buscar localmente antes de pedir al servidor
    return <ScanView mascotas={mascotas} />;
  }

  return (
    <DashboardView 
      mascotas={mascotas}
      contar={contar}
      seleccionada={seleccionada}
      setSeleccionada={setSeleccionada}
      descargarSVG={descargarSVG}
      agregarMascota={agregarMascota}
      eliminarMascota={eliminarMascota}
      marcarComoImpreso={marcarComoImpreso}
      actualizarEstado={actualizarEstado}
    />
  );
}

export default App;