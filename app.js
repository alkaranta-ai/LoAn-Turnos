// ====== CONFIGURACIÓN DE TU GOOGLE SHEET ======
const SHEET_ID = "1-uDI-x7p-y6xjF4zjQB7-HSR2KW48XK0jlGMktxa4bQ";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
let SERVICES = [];
let selectedServiceId = "s1";
function csvToArray(text) {
  const lines = text.split("\n");
  const result = [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/\r/g, ""));
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const obj = {};
    const currentline = lines[i].split(",").map(c => c.trim().replace(/\r/g, ""));
    headers.forEach((header, index) => {
      let value = currentline[index] || "";
      if (header === "duration") value = Number(value);
      obj[header] = value;
    });
    result.push(obj);
  }
  return result;
}
async function cargarServiciosDesdeGoogle() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.text();
    SERVICES = csvToArray(data);
    // Mapear al formato que usa el HTML (nombre, duracion, precio, imagen, emoji)
    window.SERVICIOS = SERVICES.map(s => {
      const precioMostrar =
        isNaN(s.price) || s.price === "" || s.price === "0" || s.price === 0 ||
        s.price.toString().toLowerCase() === "consultar"
          ? "Consultar"
          : `$${Number(s.price).toLocaleString("es-AR")}`;
      return {
        id:      s.id,
        nombre:  s.name || s.nombre || "",
        duracion: s.duration ? `${s.duration} min` : (s.duracion || ""),
        precio:  precioMostrar,
        // Si el Sheet trae una columna "image" (o "imagen") con una ruta/URL
        // específica, se usa esa. Si no, el HTML busca automáticamente
        // images/{id}.jpg / .png / .webp en el repo.
        imagen:  s.image || s.imagen || "",
        emoji:   s.emoji || "",
        raw:     s
      };
    });
    if (typeof window.__renderServicios === "function") {
      window.__renderServicios();
    }
  } catch (error) {
    console.error("Error al cargar los servicios desde Google Sheet:", error);
    // Datos de fallback para que la app funcione sin conexión
    window.SERVICIOS = [
      { id:"s1", nombre:"Tratamiento Facial", duracion:"60 min", precio:"Consultar", imagen:"", emoji:"" },
      { id:"s2", nombre:"Limpieza de Cutis",  duracion:"45 min", precio:"Consultar", imagen:"", emoji:"" },
      { id:"s3", nombre:"Masaje Relajante",   duracion:"60 min", precio:"Consultar", imagen:"", emoji:"" }
    ];
    if (typeof window.__renderServicios === "function") {
      window.__renderServicios();
    }
  }
}
function contactarWhatsApp(tipo) {
  const s = SERVICES.find(x => x.id === selectedServiceId);
  const servNombre = s ? s.name || s.nombre || selectedServiceId : selectedServiceId;
  const mensaje = tipo === "precio"
    ? `Hola, me gustaría obtener más información sobre: ${servNombre}`
    : `Hola, me gustaría consultar disponibilidad de días y horarios para: ${servNombre}`;
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(mensaje)}`);
  if (typeof window.__guardarHistorial === "function") {
    window.__guardarHistorial({ tipo, servicio: servNombre });
  }
}
// Actualizar selectedServiceId cuando se abre un modal
document.addEventListener("DOMContentLoaded", () => {
  // Permite que el HTML principal sepa qué servicio fue seleccionado
  const origSelected = Object.getOwnPropertyDescriptor(window, "_selectedService");
  const proxy = {
    set(v) {
      if (v && v.id) selectedServiceId = v.id;
      window.__selectedServiceInternal = v;
    },
    get() { return window.__selectedServiceInternal; }
  };
  Object.defineProperty(window, "_selectedService", {
    get: proxy.get, set: proxy.set, configurable: true
  });
});
cargarServiciosDesdeGoogle();
