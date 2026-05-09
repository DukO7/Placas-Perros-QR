import { useState, useEffect } from 'react'
import axios from 'axios'
import ScanView from './ScanView'
import DashboardView from './DashboardView'
import LoginView from './LoginView'
import ClienteView from './ClienteView' // <-- Asegúrate de crear este archivo

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'https://api-qrplacas.onrender.com/api/mascotas';

function App() {
  const [mascotas, setMascotas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Cambiamos el booleano por el objeto usuario
  const [usuario, setUsuario] = useState(null);

  const notify = (msg, type = "success") => {
    toast[type](msg, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      style: { borderRadius: '12px', fontWeight: '600' }
    });
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  const fetchMascotas = async () => {
    try {
      const response = await axios.get(API_BASE);
      setMascotas(response.data);
    } catch (error) {
      console.error("Error cargando mascotas:", error);
      notify("Error al conectar con la base de datos", "error");
    }
  };

  const agregarMascota = async (nueva) => {
    try {
      const response = await axios.post(API_BASE, nueva);
      setMascotas([...mascotas, response.data]);
      notify(`✨ ${nueva.nombre} registrado con éxito`);
    } catch (error) {
      console.error("Error al registrar:", error);
      notify("Error al crear el registro", "error");
    }
  };

  const eliminarMascota = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar a esta mascota?")) {
      try {
        await axios.delete(`${API_BASE}/${id}`);
        setMascotas(mascotas.filter(m => m.id !== id));
        notify("Registro eliminado correctamente", "info");
      } catch (error) {
        console.error("Error al eliminar:", error);
        notify("No se pudo eliminar el registro", "error");
      }
    }
  };

  const marcarComoImpreso = async (id) => {
    try {
      await axios.patch(`${API_BASE}/${id}/impreso`);
      setMascotas(mascotas.map(m => m.id === id ? { ...m, impreso: 1 } : m));
      notify("✅ Placa confirmada para producción");
    } catch (error) {
      console.error("Error al actualizar impresión:", error);
      notify("Error al actualizar impresión", "error");
    }
  };

  const actualizarEstado = async (id, nuevoEstado, motivo) => {
    try {
      await axios.patch(`${API_BASE}/${id}/estado`, { 
        estado: nuevoEstado, 
        motivo: motivo 
      });

      setMascotas(prev => prev.map(m => m.id === id ? { ...m, estado: nuevoEstado } : m));
      setSeleccionada(prev => (prev && prev.id === id ? { ...prev, estado: nuevoEstado } : prev));
      
      if (nuevoEstado === 'perdido') {
        notify(`🚨 REPORTE: Mascota marcada como PERDIDA`, "error");
      } else {
        notify(`🚀 Estado actualizado a: ${nuevoEstado.toUpperCase()}`, "info");
      }

    } catch (error) {
      console.error("Error en la petición PATCH:", error);
      notify("Error al cambiar estado", "error");
      throw error; 
    }
  };

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
    notify("🎨 Archivo SVG listo para impresión 3D");
  };

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // --- RENDERIZADO FINAL ---

  if (currentPath.startsWith('/scan/')) {
    return <ScanView mascotas={mascotas} />;
  }

  if (!usuario) {
    return <LoginView onLogin={(datos) => setUsuario(datos)} />;
  }

  return (
    <>
      <ToastContainer limit={5} newestOnTop />
      {usuario.rol === 'admin' ? (
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
          onLogout={() => setUsuario(null)}
        />
      ) : (
        <ClienteView 
          usuario={usuario}
          mascotas={mascotas.filter(m => m.dueno === usuario.nombre)}
          actualizarEstado={actualizarEstado}
          onLogout={() => setUsuario(null)}
        />
      )}
    </>
  );
}

export default App;