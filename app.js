// --- CONFIGURACIÓN DE SERVICIOS ---
const SERVICES = [
  { id: "s1", name: "Limpieza facial profunda", duration: 60, price: 35000, image: "Limpieza Facial Profunda.png" },
  { id: "s2", name: "Masaje descontracturante", duration: 60, price: 45000, image: "Masaje descontracturante.png" },
  { id: "s3", name: "Exfoliación corporal", duration: 60, price: 35000, image: "Exfoliación Corporal.png" },
  { id: "s4", name: "Depilación láser", duration: 30, price: 16000, image: "Depilación láser.png" },
  { id: "s5", name: "Drenaje linfático", duration: 60, price: 45000, image: "Drenaje Linfático.png" },
  { id: "s6", name: "Masaje relajante", duration: 60, price: 45000, image: "Masaje Relajante.png" }
];

let selectedService = "s1";
let selectedDate = "";
let selectedSlot = "";

// --- FUNCIÓN PARA DIBUJAR LAS TARJETAS ---
function renderServices() {
  const grid = document.getElementById("servicesGrid");
  const select = document.getElementById("svcSelect");
  if (!grid || !select) return;
  
  grid.innerHTML = "";
  select.innerHTML = "";

  SERVICES.forEach(s => {
    const card = document.createElement("div");
    card.className = "service-card" + (s.id === selectedService ? " selected" : "");
    if (s.image) card.style.backgroundImage = `url('${s.image}')`;
    card.innerHTML = `<h3>${s.name}</h3><div class="meta"><span>${s.duration} min</span><span class="price">$${s.price.toLocaleString()}</span></div>`;
    
    card.onclick = () => { 
      selectedService = s.id; 
      renderServices(); 
      select.value = s.id;
    };
    grid.appendChild(card);

    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
  select.value = selectedService;
}

// --- CALENDARIO Y HORARIOS ---
function renderCalendar() {
  const grid = document.getElementById("calGrid");
  if (!grid) return;
  grid.innerHTML = '<div class="dow">Lu</div><div class="dow">Ma</div><div class="dow">Mi</div><div class="dow">Ju</div><div class="dow">Vi</div><div class="dow">Sa</div><div class="dow">Do</div>';
  for(let i=1; i<=30; i++) {
    const day = document.createElement("div");
    day.className = "day available";
    day.textContent = i;
    day.onclick = () => {
      document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
      day.classList.add('selected');
      selectedDate = "Junio " + i;
      renderSlots();
    };
    grid.appendChild(day);
  }
}

function renderSlots() {
  const container = document.getElementById("slotsContainer");
  if (!container) return;
  container.innerHTML = "";
  ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].forEach(time => {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.textContent = time;
    slot.onclick = () => {
      document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedSlot = time;
    };
    container.appendChild(slot);
  });
}

// --- EJECUCIÓN ---
renderServices();
renderCalendar();
renderSlots();
document.getElementById("year").textContent = new Date().getFullYear();

// --- WHATSAPP ---
document.getElementById("confirmBtn").onclick = () => {
  const name = document.getElementById("clientName").value;
  const s = SERVICES.find(x => x.id === selectedService).name;
  const msg = `Reserva: ${s}. Cliente: ${name}. Fecha: ${selectedDate}, Hora: ${selectedSlot}`;
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(msg)}`);
};
