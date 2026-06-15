/* ============================================================
   LoAn Estética — Panel Admin
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
  whatsapp: "5491136047671",
  workDays: [1,2,3,4,5,6],
  startHour: 9,
  endHour: 18,
  slotMinutes: 30,
  blockedDates: [],
  blockedSlots: {}
};

const DEFAULT_PASSWORD = "loan2026";

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

function loadPassword(){
  return localStorage.getItem("loan_admin_pw") || DEFAULT_PASSWORD;
}
function savePassword(pw){ localStorage.setItem("loan_admin_pw", pw); }

if(!localStorage.getItem("loan_services")) saveServices(DEFAULT_SERVICES);
if(!localStorage.getItem("loan_config")) saveConfig(DEFAULT_CONFIG);
if(!localStorage.getItem("loan_bookings")) saveBookings([]);

let services = loadServices();
let config = loadConfig();
let bookings = loadBookings();
let currentFilter = "todos";

const DOW_LABELS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2500);
}
function money(n){ return "$" + n.toLocaleString("es-AR"); }

/* ===================== Login ===================== */
const SESSION_KEY = "loan_admin_session";

function checkSession(){
  if(sessionStorage.getItem(SESSION_KEY) === "ok"){
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminMain").style.display = "block";
    initAdmin();
  }
}

document.getElementById("loginBtn").addEventListener("click", ()=>{
  const val = document.getElementById("pwInput").value;
  if(val === loadPassword()){
    sessionStorage.setItem(SESSION_KEY, "ok");
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminMain").style.display = "block";
    initAdmin();
  } else {
    showToast("Contraseña incorrecta");
  }
});
document.getElementById("pwInput").addEventListener("keydown", (e)=>{
  if(e.key === "Enter") document.getElementById("loginBtn").click();
});

document.getElementById("logoutBtn").addEventListener("click", ()=>{
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
});

checkSession();

/* ===================== Init ===================== */
let initialized = false;
function initAdmin(){
  if(initialized) return;
  initialized = true;

  setupTabs();
  renderBookings();
  renderBookingFilters();
  renderServicesList();
  renderHoursForm();
  renderWorkDaysChips();
  renderBlockedDates();
  renderConfigForm();
  setupServiceForm();
  setupHoursForm();
  setupBlockDate();
  setupConfigActions();
}

/* ===================== Tabs ===================== */
function setupTabs(){
  document.querySelectorAll(".tab").forEach(tab=>{
    tab.addEventListener("click", ()=>{
      document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("panel-"+tab.dataset.tab).classList.add("active");
    });
  });
}

/* ===================== Bookings ===================== */
function renderBookingFilters(){
  const wrap = document.getElementById("bookingFilters");
  const filters = [
    {id:"todos", label:"Todos"},
    {id:"proximos", label:"Próximos"},
    {id:"pendiente", label:"Pendientes"},
    {id:"confirmado", label:"Confirmados"},
    {id:"cancelado", label:"Cancelados"}
  ];
  wrap.innerHTML = "";
  filters.forEach(f=>{
    const chip = document.createElement("div");
    chip.className = "chip" + (f.id===currentFilter ? " active":"");
    chip.textContent = f.label;
    chip.addEventListener("click", ()=>{
      currentFilter = f.id;
      renderBookingFilters();
      renderBookings();
    });
    wrap.appendChild(chip);
  });
}

function renderBookings(){
  const list = document.getElementById("bookingsList");
  list.innerHTML = "";

  let filtered = [...bookings];
  const todayStr = new Date().toISOString().slice(0,10);

  if(currentFilter === "proximos"){
    filtered = filtered.filter(b=> b.date >= todayStr && b.status !== "cancelado");
  } else if(currentFilter !== "todos"){
    filtered = filtered.filter(b=> b.status === currentFilter);
  }

  filtered.sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));

  if(filtered.length === 0){
    list.innerHTML = `<div class="empty-state">No hay turnos en esta categoría.</div>`;
    return;
  }

  filtered.forEach(b=>{
    const d = new Date(b.date+"T00:00:00");
    const dateLabel = d.toLocaleDateString("es-AR",{day:"numeric", month:"short"});
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="info">
        <div class="title">${b.clientName} · ${b.serviceName}</div>
        <div class="meta">${dateLabel} a las ${b.time} · ${b.clientPhone}</div>
        <div style="margin-top:4px;"><span class="badge ${b.status}">${b.status}</span></div>
      </div>
      <div class="actions">
        ${b.status!=="confirmado" ? `<button class="icon-btn" title="Confirmar" data-action="confirm" data-id="${b.id}">✅</button>` : ""}
        <button class="icon-btn" title="WhatsApp" data-action="wa" data-id="${b.id}">💬</button>
        ${b.status!=="cancelado" ? `<button class="icon-btn" title="Cancelar" data-action="cancel" data-id="${b.id}">🚫</button>` : ""}
        <button class="icon-btn" title="Eliminar" data-action="delete" data-id="${b.id}">🗑️</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll("[data-action]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const booking = bookings.find(b=>b.id===id);
      if(!booking) return;

      if(action==="confirm"){
        booking.status = "confirmado";
        saveBookings(bookings);
        renderBookings();
        showToast("Turno confirmado");
      } else if(action==="cancel"){
        booking.status = "cancelado";
        saveBookings(bookings);
        renderBookings();
        showToast("Turno cancelado");
      } else if(action==="delete"){
        if(confirm("¿Eliminar este turno definitivamente?")){
          bookings = bookings.filter(b=>b.id!==id);
          saveBookings(bookings);
          renderBookings();
          showToast("Turno eliminado");
        }
      } else if(action==="wa"){
        const d = new Date(booking.date+"T00:00:00");
        const dateLabel = d.toLocaleDateString("es-AR",{weekday:"long", day:"numeric", month:"long"});
        const msg = `Hola ${booking.clientName}! 🌿 Te escribo de LoAn Estética para confirmar tu turno de ${booking.serviceName} el ${dateLabel} a las ${booking.time}hs. ¡Te esperamos!`;
        const phone = booking.clientPhone.replace(/[^0-9]/g,"");
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    });
  });
}

/* ===================== Servicios ===================== */
function renderServicesList(){
  const list = document.getElementById("servicesList");
  list.innerHTML = "";

  if(services.length===0){
    list.innerHTML = `<div class="empty-state">Todavía no agregaste servicios.</div>`;
    return;
  }

  services.forEach(s=>{
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="info">
        <div class="title">${s.icon||"🌿"} ${s.name}</div>
        <div class="meta">${s.duration} min · ${money(s.price)}</div>
      </div>
      <div class="actions">
        <button class="icon-btn" title="Editar" data-action="edit" data-id="${s.id}">✏️</button>
        <button class="icon-btn" title="Eliminar" data-action="delete" data-id="${s.id}">🗑️</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll("[data-action]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if(action==="edit"){
        const s = services.find(x=>x.id===id);
        document.getElementById("svcEditId").value = s.id;
        document.getElementById("svcName").value = s.name;
        document.getElementById("svcIcon").value = s.icon||"";
        document.getElementById("svcDuration").value = s.duration;
        document.getElementById("svcPrice").value = s.price;
        document.getElementById("svcFormTitle").textContent = "Editar servicio";
        document.getElementById("svcCancelBtn").style.display = "inline-flex";
        document.getElementById("svcSaveBtn").textContent = "Guardar cambios";
        window.scrollTo({top:0, behavior:"smooth"});
      } else if(action==="delete"){
        if(confirm("¿Eliminar este servicio?")){
          services = services.filter(x=>x.id!==id);
          saveServices(services);
          renderServicesList();
          showToast("Servicio eliminado");
        }
      }
    });
  });
}

function setupServiceForm(){
  document.getElementById("svcSaveBtn").addEventListener("click", ()=>{
    const name = document.getElementById("svcName").value.trim();
    const icon = document.getElementById("svcIcon").value.trim() || "🌿";
    const duration = parseInt(document.getElementById("svcDuration").value);
    const price = parseInt(document.getElementById("svcPrice").value);
    const editId = document.getElementById("svcEditId").value;

    if(!name){ showToast("Ingresá un nombre"); return; }
    if(!duration || duration<=0){ showToast("Ingresá una duración válida"); return; }
    if(isNaN(price) || price<0){ showToast("Ingresá un precio válido"); return; }

    if(editId){
      const s = services.find(x=>x.id===editId);
      s.name = name; s.icon = icon; s.duration = duration; s.price = price;
      showToast("Servicio actualizado");
    } else {
      services.push({ id:"s_"+Date.now(), icon, name, duration, price });
      showToast("Servicio agregado");
    }

    saveServices(services);
    resetServiceForm();
    renderServicesList();
  });

  document.getElementById("svcCancelBtn").addEventListener("click", resetServiceForm);
}

function resetServiceForm(){
  document.getElementById("svcEditId").value = "";
  document.getElementById("svcName").value = "";
  document.getElementById("svcIcon").value = "";
  document.getElementById("svcDuration").value = "";
  document.getElementById("svcPrice").value = "";
  document.getElementById("svcFormTitle").textContent = "Nuevo servicio";
  document.getElementById("svcCancelBtn").style.display = "none";
  document.getElementById("svcSaveBtn").textContent = "Guardar servicio";
}

/* ===================== Horarios ===================== */
function renderHoursForm(){
  document.getElementById("cfgStartHour").value = config.startHour;
  document.getElementById("cfgEndHour").value = config.endHour;
  document.getElementById("cfgSlotMinutes").value = config.slotMinutes;
}

function renderWorkDaysChips(){
  const wrap = document.getElementById("workDaysChips");
  wrap.innerHTML = "";
  DOW_LABELS.forEach((label, idx)=>{
    const chip = document.createElement("div");
    chip.className = "chip" + (config.workDays.includes(idx) ? " active":"");
    chip.textContent = label;
    chip.addEventListener("click", ()=>{
      if(config.workDays.includes(idx)){
        config.workDays = config.workDays.filter(d=>d!==idx);
      } else {
        config.workDays.push(idx);
      }
      renderWorkDaysChips();
    });
    wrap.appendChild(chip);
  });
}

function setupHoursForm(){
  document.getElementById("saveHoursBtn").addEventListener("click", ()=>{
    const start = parseInt(document.getElementById("cfgStartHour").value);
    const end = parseInt(document.getElementById("cfgEndHour").value);
    const slot = parseInt(document.getElementById("cfgSlotMinutes").value);

    if(isNaN(start) || isNaN(end) || start>=end){ showToast("Revisá el horario de inicio y fin"); return; }
    if(!slot || slot<=0){ showToast("Intervalo inválido"); return; }

    config.startHour = start;
    config.endHour = end;
    config.slotMinutes = slot;
    saveConfig(config);
    showToast("Horario guardado");
  });
}

/* ===================== Bloquear fechas ===================== */
function renderBlockedDates(){
  const wrap = document.getElementById("blockedDatesList");
  wrap.innerHTML = "";

  if(config.blockedDates.length===0){
    wrap.innerHTML = `<div class="empty-state" style="padding:14px;">No hay fechas bloqueadas.</div>`;
    return;
  }

  config.blockedDates.sort().forEach(dateStr=>{
    const d = new Date(dateStr+"T00:00:00");
    const label = d.toLocaleDateString("es-AR",{weekday:"long", day:"numeric", month:"long", year:"numeric"});
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div class="info"><div class="title" style="text-transform:capitalize;">${label}</div></div>
      <div class="actions"><button class="icon-btn" data-date="${dateStr}">🗑️</button></div>
    `;
    wrap.appendChild(item);
  });

  wrap.querySelectorAll("[data-date]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      config.blockedDates = config.blockedDates.filter(d=>d!==btn.dataset.date);
      saveConfig(config);
      renderBlockedDates();
      showToast("Fecha desbloqueada");
    });
  });
}

function setupBlockDate(){
  document.getElementById("blockDateBtn").addEventListener("click", ()=>{
    const val = document.getElementById("blockDateInput").value;
    if(!val){ showToast("Elegí una fecha"); return; }
    if(!config.blockedDates.includes(val)){
      config.blockedDates.push(val);
      saveConfig(config);
      renderBlockedDates();
      showToast("Fecha bloqueada");
    } else {
      showToast("Esa fecha ya está bloqueada");
    }
    document.getElementById("blockDateInput").value = "";
  });
}

/* ===================== Config general ===================== */
function renderConfigForm(){
  document.getElementById("cfgWhatsapp").value = config.whatsapp;
}

function setupConfigActions(){
  document.getElementById("saveWhatsappBtn").addEventListener("click", ()=>{
    const val = document.getElementById("cfgWhatsapp").value.trim().replace(/[^0-9]/g,"");
    if(!val || val.length<8){ showToast("Ingresá un número válido"); return; }
    config.whatsapp = val;
    saveConfig(config);
    document.getElementById("cfgWhatsapp").value = val;
    showToast("Número actualizado");
  });

  document.getElementById("savePasswordBtn").addEventListener("click", ()=>{
    const val = document.getElementById("newPassword").value;
    if(!val || val.length<4){ showToast("Mínimo 4 caracteres"); return; }
    savePassword(val);
    document.getElementById("newPassword").value = "";
    showToast("Contraseña actualizada");
  });

  document.getElementById("exportBtn").addEventListener("click", ()=>{
    const data = {
      services, config, bookings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loan-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importBtn").addEventListener("click", ()=>{
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const data = JSON.parse(ev.target.result);
        if(data.services) { services = data.services; saveServices(services); }
        if(data.config) { config = {...DEFAULT_CONFIG, ...data.config}; saveConfig(config); }
        if(data.bookings) { bookings = data.bookings; saveBookings(bookings); }
        renderServicesList();
        renderHoursForm();
        renderWorkDaysChips();
        renderBlockedDates();
        renderConfigForm();
        renderBookings();
        showToast("Respaldo importado correctamente");
      } catch(err){
        showToast("Archivo inválido");
      }
    };
    reader.readAsText(file);
  });
}
