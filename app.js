const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwi0uw13O2zDuairDSUXeuUoRamlUHEUMavGuNh9kugWk_dn9GElsPHQQHjURZkCVIy/exec";

const DEFAULT_SERVICES = [
  { id: "s1", icon: "✩", name: "Limpieza facial profunda", duration: 60, price: 35000, image: "Limpieza Facial Profunda.png" },
  { id: "s2", icon: "✩", name: "Masaje descontracturante", duration: 60, price: 45000, image: "Masaje descontracturante.png" },
  { id: "s3", icon: "✩", name: "Exfoliación corporal", duration: 60, price: 35000, image: "Exfoliación Corporal.png" },
  { id: "s4", icon: "✩", name: "Depilación láser", duration: 30, price: 16000, priceLabel: "Desde $16.000 / $38.000", image: "Depilación láser.png" },
  { id: "s5", icon: "✩", name: "Drenaje linfático", duration: 60, price: 45000, image: "Drenaje Linfático.png" },
  { id: "s6", icon: "✩", name: "Masaje relajante", duration: 60, price: 45000, image: "Masaje Relajante.png" }
];

const DEFAULT_CONFIG = { whatsapp: "541136047671", workDays: [1,2,3,4,5], startHour: 8, endHour: 20, slotMinutes: 30, blockedDates: [], blockedSlots: {} };

let services = JSON.parse(localStorage.getItem("loan_services")) || DEFAULT_SERVICES;
let config = JSON.parse(localStorage.getItem("loan_config")) || DEFAULT_CONFIG;
let bookings = JSON.parse(localStorage.getItem("loan_bookings")) || [];

let selectedService = services[0].id;

function money(s) { return s.priceLabel ? s.priceLabel : "$" + s.price.toLocaleString("es-AR"); }

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  const select = document.getElementById("svcSelect");
  if (!grid || !select) return;
  grid.innerHTML = "";
  select.innerHTML = "";
  services.forEach(s => {
    const card = document.createElement("div");
    card.className = "service-card" + (s.id === selectedService ? " selected" : "");
    if (s.image) card.style.backgroundImage = `url('${s.image}')`;
    card.innerHTML = `<h3>${s.name}</h3><div class="meta"><span>${s.duration} min</span><span class="price">${money(s)}</span></div>`;
    card.addEventListener("click", () => { 
        selectedService = s.id; 
        renderServices(); 
        document.getElementById("turnos").scrollIntoView({ behavior: "smooth" }); 
    });
    grid.appendChild(card);
    
    const opt = document.createElement("option");
    opt.value = s.id; 
    opt.textContent = `${s.name} — ${s.duration}min — ${money(s)}`;
    select.appendChild(opt);
  });
  if (select) select.value = selectedService;
}

renderServices();
document.getElementById("year").textContent = new Date().getFullYear();
