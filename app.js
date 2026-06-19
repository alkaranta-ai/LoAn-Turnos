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
    if (!lines[i]) continue;
    const obj = {};
    const currentline = lines[i].split(",").map(c => c.trim().replace(/\r/g, ""));
    headers.forEach((header, index) => {
      let value = currentline[index];
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
    renderServices();
  } catch (error) {
    console.error("Error al cargar los precios desde Google Sheet:", error);
  }
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  SERVICES.forEach((s) => {
    const precioMostrar = isNaN(s.price) || s.price === "" || s.price === 0 || s.price.toString().toLowerCase() === "consultar"
      ? "Consultar"
      : `$${Number(s.price).toLocaleString()}`;

    const card = document.createElement("div");
    card.className = "service-card";
    if (s.image) card.style.backgroundImage = `url('${s.image}')`;
    card.innerHTML = `
      <h3>${s.name}</h3>
      <div class="meta">
        <span>${s.duration} min</span>
        <span class="price">${precioMostrar}</span>
      </div>`;

    card.onclick = () => {
      selectedServiceId = s.id;
      document.getElementById('modalTitle').textContent = s.name;
      document.getElementById('serviceModal').classList.add('flex');
    };
    grid.appendChild(card);
  });
}

function contactarWhatsApp(tipo) {
  const s = SERVICES.find(x => x.id === selectedServiceId);
  if (!s) return;

  let mensaje = tipo === 'precio'
    ? `Hola, me gustaría obtener más información sobre: ${s.name}`
    : `Hola, me gustaría consultar disponibilidad de días y horarios para: ${s.name}`;

  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(mensaje)}`);
  document.getElementById('serviceModal').classList.remove('flex');

  // Guardar automáticamente en el historial
  if (typeof window.__guardarHistorial === 'function') {
    window.__guardarHistorial({ tipo: tipo, servicio: s.name });
  }
}

cargarServiciosDesdeGoogle();
