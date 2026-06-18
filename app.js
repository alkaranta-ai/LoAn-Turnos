const SERVICES = [
  { id: "s1", name: "Limpieza facial profunda", duration: 60, price: 35000, image: "limpieza.png" },
  { id: "s2", name: "Masaje descontracturante", duration: 60, price: 45000, image: "masaje_des.png" },
  { id: "s3", name: "Exfoliación corporal", duration: 60, price: 35000, image: "exfoliacion.png" },
  { id: "s4", name: "Depilación láser", duration: 30, price: 16000, image: "depilacion.png" },
  { id: "s5", name: "Drenaje linfático", duration: 60, price: 45000, image: "drenaje.png" },
  { id: "s6", name: "Masaje relajante", duration: 60, price: 45000, image: "masaje_rel.png" }
];

let selectedService = "s1";

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  grid.innerHTML = "";
  SERVICES.forEach(s => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.style.backgroundImage = `url('${s.image}')`;
    card.innerHTML = `<h3>${s.name}</h3><div class="meta"><span>${s.duration} min</span><span>$${s.price.toLocaleString()}</span></div>`;
    card.onclick = () => { 
      selectedService = s.id;
      document.getElementById('modalTitle').textContent = s.name;
      document.getElementById('serviceModal').style.display = 'flex';
    };
    grid.appendChild(card);
  });
}

function contactarWhatsApp(tipo) {
  const service = SERVICES.find(x => x.id === selectedService).name;
  const msg = tipo === 'precio' ? `Hola, quiero saber el precio de: ${service}` : `Hola, consulto disponibilidad para: ${service}`;
  window.open(`https://wa.me/541136047671?text=${encodeURIComponent(msg)}`);
  document.getElementById('serviceModal').style.display = 'none';
}

renderServices();
