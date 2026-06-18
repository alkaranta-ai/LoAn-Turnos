// ====== CONFIGURACIÓN DE TU GOOGLE SHEET ======
const SHEET_ID = "1-uDI-x7p-y6xjF4zjQB7-HSR2KW48XK0jlGMktxa4bQ";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

let SERVICES = [];
let selectedServiceId = "s1";

// Función para transformar el CSV de Google Sheet en una lista que entienda JS
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
      // Convertir SOLO la duración a número. El precio queda libre para aceptar texto como "Consultar"
      if (header === "duration") {
        value = Number(value);
      }
      obj[header] = value;
    });
    result.push(obj);
  }
  return result;
}

// Descargar los datos desde Google Sheets de forma automática
async function cargarServiciosDesdeGoogle() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.text();
    SERVICES = csvToArray(data);
    renderServices(); // Dibuja las tarjetas cuando termina de descargar los datos de Google
  } catch (error) {
    console.error("Error al cargar los precios desde Google Sheet:", error);
  }
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  SERVICES.forEach((s, index) => {
    // Si s.price no es un número (es decir, es la palabra "Consultar"), lo muestra directo.
    // Si es un número (ej: "35000"), le pone el signo $ y el formato de miles.
    const precioMostrar = isNaN(s.price) || s.price === "" || s.price === 0 || s.price.toString().toLowerCase() === "consultar"
      ? "Consultar" 
      : `$${Number(s.price).toLocaleString()}`;

    const card = document.createElement("div");
    card.className = "service-card";
    card.style.backgroundImage = `url('${s.image}')`;
    card.style.position = 'sticky';
    card.style.top = `${16 + index * 14}px`;
    card.style.zIndex = index + 1;
    card.innerHTML = `<h3>${s.name}</h3><div class="meta"><span>${s.duration} min</span><span class="price">${precioMostrar}</span></div>`;
    
    card.onclick = () => {
      selectedServiceId = s.id;
      document.getElementById('modalTitle').textContent = s.name;
      document.getElementById('serviceModal').style.display = 'flex';
    };
    grid.appendChild(card);
  });
}

function contactarWhatsApp(tipo) {
  const s = SERVICES.find(x => x.id === selectedServiceId);
  let mensaje = tipo === 'precio' 
    ? `Hola, me gustaría consultar el precio de: ${s.name}` 
    : `Hola, me gustaría consultar disponibilidad de días y horarios para: ${s.name}`;
    
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(mensaje)}`);
  document.getElementById('serviceModal').style.display = 'none';
}

// Arranca la descarga automática desde tu Google Sheet al cargar la web
cargarServiciosDesdeGoogle();


// =============================================
// LÓGICA DE CALIFICACIONES INTERACTIVAS 
// =============================================
let ratingSeleccionado = 5; // Inicia con las 5 estrellas seleccionadas por defecto

const estrellas = document.querySelectorAll('#starRating span');
estrellas.forEach(estrella => {
  estrella.addEventListener('click', () => {
    ratingSeleccionado = parseInt(estrella.getAttribute('data-value'));
    actualizarEstraws();
  });
});

function actualizarEstraws() {
  estrellas.forEach(estrella => {
    const valor = parseInt(estrella.getAttribute('data-value'));
    if (valor <= ratingSeleccionado) {
      estrella.style.color = '#FFD700'; // Dorado brillante para las activas
    } else {
      estrella.style.color = '#E0E0E0'; // Gris claro para las apagadas
    }
  });
}

function enviarCalificacion() {
  // Convertimos el número seleccionado en un texto con emojis de estrellas
  let estrellasEmoji = "⭐".repeat(ratingSeleccionado);
  
  let mensaje = `¡Hola! Quiero dejar una reseña de ${estrellasEmoji} sobre mi servicio: `;
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(mensaje)}`);
}

// Ejecuta la función por primera vez para pintar las estrellas de dorado al entrar
actualizarEstraws();
