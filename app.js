const SERVICES = [
  { id: "s1", name: "Limpieza facial profunda", duration: 60, price: 35000, image: "limpieza.png" },
  { id: "s2", name: "Masaje descontracturante", duration: 60, price: 45000, image: "masaje_des.png" },
  { id: "s3", name: "Exfoliación corporal", duration: 60, price: 35000, image: "body_exf.png" },
  { id: "s4", name: "Depilación láser", duration: 30, price: 16000, image: "depilacion.png" },
  { id: "s5", name: "Drenaje linfático", duration: 60, price: 45000, image: "dren_linf.png" },
  { id: "s6", name: "Masaje relajante", duration: 60, price: 45000, image: "masaje_rel.png" }
];

let selectedServiceId = "s1";

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  SERVICES.forEach(s => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.style.backgroundImage = `url('${s.image}')`;
    card.innerHTML = `<h3>${s.name}</h3><div class="meta"><span>${s.duration} min</span><span class="price">$${s.price.toLocaleString()}</span></div>`;
    
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

// Inicializa las tarjetas de servicios al cargar la página
renderServices();


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
  let mensaje = `¡Hola! Quiero dejar una reseña de ${ratingSeleccionado} estrellas sobre mi servicio: `;
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(mensaje)}`);
}

// Ejecuta la función por primera vez para pintar las estrellas de dorado al entrar
actualizarEstraws();
