// --- CONFIGURACIÓN ---
const SERVICES = [
  { id: "s1", name: "Limpieza facial profunda", duration: 60, price: 35000, image: "Limpieza Facial Profunda.png" },
  { id: "s2", name: "Masaje descontracturante", duration: 60, price: 45000, image: "Masaje descontracturante.png" },
  { id: "s3", name: "Exfoliación corporal", duration: 60, price: 35000, image: "Exfoliación Corporal.png" },
  { id: "s4", name: "Depilación láser", duration: 30, price: 16000, image: "Depilación láser.png" },
  { id: "s5", name: "Drenaje linfático", duration: 60, price: 45000, image: "Drenaje Linfático.png" },
  { id: "s6", name: "Masaje relajante", duration: 60, price: 45000, image: "Masaje Relajante.png" }
];

let selectedService = "s1";
let selectedDate = new Date().toISOString().split('T')[0];
let selectedSlot = "10:00";

// --- FUNCIONES ---

function money(price) { return "$" + price.toLocaleString("es-AR"); }

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  const select = document.getElementById("svcSelect");
  if (!grid || !select) return;
  
  grid.innerHTML = "";
  select.innerHTML = "";

  SERVICES.forEach(s => {
    // Tarjeta
    const card = document.createElement("div");
    card.className = "service-card" + (s.id === selectedService ? " selected" : "");
    if (s.image) card.style.backgroundImage = `url('${s.image}')`;
    card.innerHTML = `<h3>${s.name}</h3><div class="meta"><span>${s.duration} min</span><span class="price">${money(s.price)}</span></div>`;
    card.onclick = () => { selectedService = s.id; renderServices(); };
    grid.appendChild(card);

    // Opcion de select
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
  select.value = selectedService;
}

// Inicializar
renderServices();
document.getElementById("year").textContent = new Date().getFullYear();

// Botón WhatsApp
document.getElementById("confirmBtn").onclick = () => {
  const name = document.getElementById("clientName").value;
  const service = SERVICES.find(s => s.id === selectedService).name;
  const msg = `Hola, quiero reservar: ${service}. Nombre: ${name}. Fecha: ${selectedDate}, Hora: ${selectedSlot}`;
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(msg)}`);
};
