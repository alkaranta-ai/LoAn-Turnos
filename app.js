/* ============================================================
   LoAn Estética — Lógica de la app de turnos
   Datos guardados en localStorage:
   - loan_services   -> array de servicios
   - loan_bookings   -> array de turnos
   - loan_config     -> configuración (whatsapp, horarios, dias laborales)
   ============================================================ */

const DEFAULT_SERVICES = [
  { id: "s1", icon: "🧖‍♀️", name: "Limpieza facial profunda", duration: 60, price: 15000 },
  { id: "s2", icon: "💆‍♀️", name: "Masaje descontracturante", duration: 50, price: 18000 },
  { id: "s3", icon: "✨", name: "Hidratación corporal", duration: 45, price: 14000 },
  { id: "s4", icon: "🌸", name: "Depilación facial", duration: 20, price: 6000 },
  { id: "s5", icon: "💧", name: "Drenaje linfático", duration: 60, price: 17000 },
  { id: "s6", icon: "🪷", name: "Masaje relajante", duration: 60, price: 18000 }
];

const DEFAULT_CONFIG = {
  whatsapp: "5493489000000", // <-- CAMBIAR por el número real con código país, sin + ni espacios
  workDays: [1,2,3,4,5,6], // 0=domingo ... 6=sabado
  startHour: 9,
  endHour: 18,
  slotMinutes: 30,
  blockedDates: [],   // ["2026-06-20"]
  blockedSlots: {}    // {"2026-06-20": ["10:00","10:30"]}
};

function loadServices(){
  const raw = localStorage.getItem("loan_services");
  return raw ? JSON.parse(raw) : DEFAULT_SERVICES;
}
function saveServices(list){ localStorage.setItem("loan_services", JSON.stringify(list)); }

function loadConfig(){
  const raw = localStorage.getItem("loan_config");
  return raw ? {...DEFAULT_CONFIG, ...JSON.parse(raw)} : DEFAULT_CONFIG;
}
function saveConfig(cfg){ localStorage.setItem("loan_config", JSON.stringify(cfg)); }

function loadBookings(){
  const raw = localStorage.getItem("loan_bookings");
  return raw ? JSON.parse(raw) : [];
}
function saveBookings(list){ localStorage.setItem("loan_bookings", JSON.stringify(list)); }

// init defaults on first run
if(!localStorage.getItem("loan_services")) saveServices(DEFAULT_SERVICES);
if(!localStorage.getItem("loan_config")) saveConfig(DEFAULT_CONFIG);
if(!localStorage.getItem("loan_bookings")) saveBookings([]);

/* ===================== State ===================== */
let services = loadServices();
let config = loadConfig();
let bookings = loadBookings();

let viewDate = new Date(); // mes mostrado en el calendario
let selectedDate = null;   // "YYYY-MM-DD"
let selectedSlot = null;   // "HH:MM"
let selectedService = services[0] ? services[0].id : null;

const MONTH_NAMES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const DOW_NAMES = ["D","L","M","M","J","V","S"];

/* ===================== Helpers ===================== */
function pad(n){ return n.toString().padStart(2,"0"); }
function fmtDate(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function todayStr(){ return fmtDate(new Date()); }
function money(n){ return "$" + n.toLocaleString("es-AR"); }

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2600);
}

/* ===================== Render Services ===================== */
function renderServices(){
  const grid = document.getElementById("servicesGrid");
  const select = document.getElementById("svcSelect");
  if(!grid || !select) return;

  grid.innerHTML = "";
  select.innerHTML = "";

  services.forEach(s=>{
    const card = document.createElement("div");
    card.className = "service-card" + (s.id===selectedService ? " selected":"");
    card.innerHTML = `
      <div class="icon">${s.icon||"🌿"}</div>
      <h3>${s.name}</h3>
      <div class="meta"><span>${s.duration} min</span><span class="price">${money(s.price)}</span></div>
    `;
    card.addEventListener("click", ()=>{
      selectedService = s.id;
      renderServices();
      renderSlots();
      updateSummary();
      document.getElementById("turnos").scrollIntoView({behavior:"smooth"});
    });
    grid.appendChild(card);

    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} — ${s.duration}min — ${money(s.price)}`;
    select.appendChild(opt);
  });

  if(selectedService) select.value = selectedService;
}

document.getElementById("svcSelect")?.addEventListener("change", (e)=>{
  selectedService = e.target.value;
  renderServices();
  renderSlots();
  updateSummary();
});

/* ===================== Calendar ===================== */
function isDateBlocked(dateStr){
  return config.blockedDates.includes(dateStr);
}
function isWorkDay(date){
  return config.workDays.includes(date.getDay());
}

function renderCalendar(){
  const grid = document.getElementById("calGrid");
  const label = document.getElementById("calMonthLabel");
  if(!grid || !label) return;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  label.textContent = `${MONTH_NAMES[month]} ${year}`;

  grid.innerHTML = "";
  DOW_NAMES.forEach(d=>{
    const el = document.createElement("div");
    el.className = "dow";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  for(let i=0;i<startOffset;i++){
    const el = document.createElement("div");
    el.className = "day empty";
    grid.appendChild(el);
  }

  for(let day=1; day<=daysInMonth; day++){
    const date = new Date(year, month, day);
    const dateStr = fmtDate(date);
    const el = document.createElement("div");
    el.className = "day";
    el.textContent = day;

    const isPast = date < today;
    const blocked = isDateBlocked(dateStr) || !isWorkDay(date);

    if(isPast || blocked){
      el.classList.add("disabled");
    } else {
      el.classList.add("available");
      el.addEventListener("click", ()=>{
        selectedDate = dateStr;
        selectedSlot = null;
        renderCalendar();
        renderSlots();
        updateSummary();
      });
    }

    if(dateStr === todayStr()) el.classList.add("today");
    if(dateStr === selectedDate) el.classList.add("selected");

    grid.appendChild(el);
  }
}

document.getElementById("calPrev")?.addEventListener("click", ()=>{
  viewDate.setMonth(viewDate.getMonth()-1);
  renderCalendar();
});
document.getElementById("calNext")?.addEventListener("click", ()=>{
  viewDate.setMonth(viewDate.getMonth()+1);
  renderCalendar();
});

/* ===================== Slots ===================== */
function getServiceDuration(){
  const s = services.find(x=>x.id===selectedService);
  return s ? s.duration : 30;
}

function generateSlots(dateStr){
  const slots = [];
  const step = config.slotMinutes;
  const duration = getServiceDuration();
  const startMin = config.startHour*60;
  const endMin = config.endHour*60;

  for(let t=startMin; t + duration <= endMin; t += step){
    const h = Math.floor(t/60), m = t%60;
    slots.push(`${pad(h)}:${pad(m)}`);
  }
  return slots;
}

function isSlotTaken(dateStr, slot){
  const duration = getServiceDuration();
  const [h,m] = slot.split(":").map(Number);
  const slotStart = h*60+m;
  const slotEnd = slotStart + duration;

  // bloqueado manualmente desde admin
  if(config.blockedSlots[dateStr] && config.blockedSlots[dateStr].includes(slot)) return true;

  // ocupado por otro turno (chequea superposición)
  return bookings.some(b=>{
    if(b.date !== dateStr) return false;
    const bSvc = services.find(s=>s.id===b.serviceId);
    const bDur = bSvc ? bSvc.duration : 30;
    const [bh,bm] = b.time.split(":").map(Number);
    const bStart = bh*60+bm;
    const bEnd = bStart + bDur;
    return slotStart < bEnd && slotEnd > bStart;
  });
}

function renderSlots(){
  const container = document.getElementById("slotsContainer");
  if(!container) return;
  container.innerHTML = "";

  if(!selectedDate){
    container.innerHTML = `<div class="empty-msg">Elegí una fecha en el calendario para ver los horarios disponibles.</div>`;
    return;
  }

  const slots = generateSlots(selectedDate);
  const isToday = selectedDate === todayStr();
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();

  let anyAvailable = false;

  slots.forEach(slot=>{
    const [h,m] = slot.split(":").map(Number);
    const slotMin = h*60+m;
    if(isToday && slotMin <= nowMin) return; // no mostrar horarios pasados hoy

    const taken = isSlotTaken(selectedDate, slot);
    if(!taken) anyAvailable = true;

    const el = document.createElement("div");
    el.className = "slot" + (taken ? " taken":"") + (slot===selectedSlot ? " selected":"");
    el.textContent = slot;
    if(!taken){
      el.addEventListener("click", ()=>{
        selectedSlot = slot;
        renderSlots();
        updateSummary();
      });
    }
    container.appendChild(el);
  });

  if(!anyAvailable){
    container.innerHTML = `<div class="empty-msg">No quedan horarios disponibles para este día. Probá otra fecha 🙏</div>`;
  }
}

/* ===================== Summary ===================== */
function updateSummary(){
  const box = document.getElementById("summaryBox");
  if(!box) return;

  const svc = services.find(s=>s.id===selectedService);

  if(!svc || !selectedDate || !selectedSlot){
    box.style.display = "none";
    return;
  }

  box.style.display = "flex";
  document.getElementById("sumService").textContent = svc.name;

  const d = new Date(selectedDate+"T00:00:00");
  const dateLabel = d.toLocaleDateString("es-AR", {weekday:"long", day:"numeric", month:"long"});
  document.getElementById("sumDate").textContent = dateLabel.charAt(0).toUpperCase()+dateLabel.slice(1);
  document.getElementById("sumTime").textContent = selectedSlot;
  document.getElementById("sumDuration").textContent = svc.duration + " min";
  document.getElementById("sumPrice").textContent = money(svc.price);
}

/* ===================== Confirmar turno ===================== */
document.getElementById("confirmBtn")?.addEventListener("click", ()=>{
  const name = document.getElementById("clientName").value.trim();
  const phone = document.getElementById("clientPhone").value.trim();
  const note = document.getElementById("clientNote").value.trim();
  const svc = services.find(s=>s.id===selectedService);

  if(!svc){ showToast("Elegí un servicio"); return; }
  if(!selectedDate){ showToast("Elegí una fecha"); return; }
  if(!selectedSlot){ showToast("Elegí un horario"); return; }
  if(!name){ showToast("Ingresá tu nombre"); document.getElementById("clientName").focus(); return; }
  if(!phone){ showToast("Ingresá tu WhatsApp"); document.getElementById("clientPhone").focus(); return; }

  // doble check de disponibilidad (por si cambió)
  if(isSlotTaken(selectedDate, selectedSlot)){
    showToast("Ese horario ya no está disponible. Elegí otro.");
    renderSlots();
    return;
  }

  const booking = {
    id: "b_" + Date.now(),
    serviceId: svc.id,
    serviceName: svc.name,
    duration: svc.duration,
    price: svc.price,
    date: selectedDate,
    time: selectedSlot,
    clientName: name,
    clientPhone: phone,
    note: note,
    status: "pendiente",
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  saveBookings(bookings);

  // Mensaje de WhatsApp
  const d = new Date(selectedDate+"T00:00:00");
  const dateLabel = d.toLocaleDateString("es-AR", {weekday:"long", day:"numeric", month:"long", year:"numeric"});
  const msg = `Hola LoAn! 🌸 Quiero confirmar mi turno:\n\n` +
              `*Servicio:* ${svc.name}\n` +
              `*Fecha:* ${dateLabel}\n` +
              `*Horario:* ${selectedSlot}\n` +
              `*Duración:* ${svc.duration} min\n` +
              `*Precio:* ${money(svc.price)}\n\n` +
              `*Nombre:* ${name}\n` +
              (note ? `*Comentario:* ${note}\n\n` : "\n") +
              `¡Gracias!`;

  const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  showToast("¡Turno guardado! Abrimos WhatsApp para confirmar 🌿");

  // reset
  selectedSlot = null;
  document.getElementById("clientNote").value = "";
  renderSlots();
  updateSummary();
});

/* ===================== Active nav link on scroll ===================== */
const navLinks = document.querySelectorAll("nav.bottom .nav-link");
const sections = ["servicios","turnos","nosotros","ubicacion"].map(id=>document.getElementById(id)).filter(Boolean);

function updateActiveNav(){
  let current = sections[0]?.id;
  sections.forEach(sec=>{
    const rect = sec.getBoundingClientRect();
    if(rect.top <= 120) current = sec.id;
  });
  navLinks.forEach(link=>{
    link.classList.toggle("active", link.getAttribute("href") === "#"+current);
  });
}
window.addEventListener("scroll", updateActiveNav, {passive:true});

/* ===================== Init ===================== */
document.getElementById("year").textContent = new Date().getFullYear();
renderServices();
renderCalendar();
renderSlots();
updateSummary();
updateActiveNav();

/* ===================== PWA install ===================== */
if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>{
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  });
}
