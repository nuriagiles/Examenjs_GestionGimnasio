//Catálogo base de actividades del gimnasio
const actividades = [
  {
    id: "yoga",
    nombre: "Yoga Suave",
    duracion: 60,
    intensidad: "Baja",
    imagen: "img/yoga.svg"
  },
  {
    id: "spinning",
    nombre: "Spinning Intensivo",
    duracion: 45,
    intensidad: "Alta",
    imagen: "img/spinning.svg"
  },
  {
    id: "crossfit",
    nombre: "CrossFit Funcional",
    duracion: 50,
    intensidad: "Alta",
    imagen: "img/crossfit.svg"
  },
  {
    id: "pilates",
    nombre: "Pilates Máquinas",
    duracion: 55,
    intensidad: "Media",
    imagen: "img/pilates.svg"
  },
  {
    id: "zumba",
    nombre: "Zumba Fitness",
    duracion: 40,
    intensidad: "Media",
    imagen: "img/zumba.svg"
  }
];

//Horas fijas en las que se pueden hacer reservas
const FRANJAS_HORARIAS = ["09:00", "11:00", "13:00", "17:00", "19:00"];

//Aquí guardamos las reservas en memoria según se van creando
const reservas = [];

//Elementos del modal de detalles
const mainLayout = document.getElementById("main-layout");
const toggleActividadesBtn = document.getElementById("toggle-actividades-btn");
const actividadesTbody = document.getElementById("actividades-tbody");
const selectActividad = document.getElementById("select-actividad");
const selectPersonas = document.getElementById("select-personas");
const selectFranja = document.getElementById("select-franja");
const reservaForm = document.getElementById("reserva-form");
const franjasGrid = document.getElementById("franjas-grid");

//Referencias del modal
const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitulo = document.getElementById("modal-titulo");
const modalVacio = document.getElementById("modal-vacio");
const modalTablaContenedor = document.getElementById("modal-tabla-contenedor");
const modalTbody = document.getElementById("modal-tbody");
const modalTotalMinutos = document.getElementById("modal-total-minutos");
const cerrarModalBtn = document.getElementById("cerrar-modal-btn");

//Guardamos qué franja está abierta por si se añade una reserva mientras se ve el modal
let franjaAbiertaEnModal = null;

//Busca los datos completos de una actividad por su id
function obtenerActividadPorId(actividadId) {
  return actividades.find((act) => act.id === actividadId) || null;
}

//Filtra las reservas que pertenecen a una hora concreta
function obtenerReservasDeFranja(franja) {
  return reservas.filter((res) => res.franja === franja);
}

//Da formato al texto que va dentro de cada tarjeta ("Actividad - X personas")
function formatearTextoReserva(reserva) {
  const actividad = obtenerActividadPorId(reserva.actividadId);
  const nombreActividad = actividad ? actividad.nombre : reserva.actividadId;
  const etiquetaPersona = reserva.personas === 1 ? "persona" : "personas";
  return `${nombreActividad} - ${reserva.personas} ${etiquetaPersona}`;
}

//Pinta la tabla de actividades a partir del array inicial
function renderizarTablaActividades() {
  actividadesTbody.innerHTML = "";

  actividades.forEach((act) => {
    const tr = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = act.nombre;

    const tdDuracion = document.createElement("td");
    tdDuracion.textContent = `${act.duracion} min`;

    const tdIntensidad = document.createElement("td");
    tdIntensidad.textContent = act.intensidad;

    const tdFoto = document.createElement("td");
    const img = document.createElement("img");
    img.src = act.imagen;
    img.alt = act.nombre;
    img.className = "actividad-img";
    tdFoto.appendChild(img);

    tr.append(tdNombre, tdDuracion, tdIntensidad, tdFoto);
    actividadesTbody.appendChild(tr);
  });
}

//Carga las opciones del select de actividades desde el array
function poblarSelectorActividades() {
  selectActividad.innerHTML = "";

  actividades.forEach((act) => {
    const option = document.createElement("option");
    option.value = act.id;
    option.textContent = act.nombre;
    selectActividad.appendChild(option);
  });
}

//Dibuja las 5 tarjetas de franjas y actualiza lo que hay en cada una
function renderizarFranjas() {
  franjasGrid.innerHTML = "";

  FRANJAS_HORARIAS.forEach((franja) => {
    const reservasFranja = obtenerReservasDeFranja(franja);

    const card = document.createElement("article");
    card.className = "franja-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalles de reservas para las ${franja}`);

    const header = document.createElement("div");
    header.className = "franja-header";

    const horaSpan = document.createElement("span");
    horaSpan.className = "franja-hora";
    horaSpan.textContent = franja;

    const hintSpan = document.createElement("span");
    hintSpan.className = "franja-hint";
    hintSpan.textContent = "Ver detalles";

    header.append(horaSpan, hintSpan);
    card.appendChild(header);

    if (reservasFranja.length === 0) {
      const vacioP = document.createElement("p");
      vacioP.className = "franja-sin-reservas";
      vacioP.textContent = "Sin reservas";
      card.appendChild(vacioP);
    } else {
      const ul = document.createElement("ul");
      ul.className = "franja-lista";

      reservasFranja.forEach((res) => {
        const li = document.createElement("li");
        li.textContent = formatearTextoReserva(res);
        ul.appendChild(li);
      });

      card.appendChild(ul);
    }

    // Permitimos abrir el modal tanto con clic como con Enter o Espacio
    const abrirDetalleFranja = () => abrirModal(franja);
    card.addEventListener("click", abrirDetalleFranja);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        abrirDetalleFranja();
      }
    });

    franjasGrid.appendChild(card);
  });
}

//Abre el modal de una franja, calcula la carga en minutos y suma el total
function abrirModal(franja) {
  franjaAbiertaEnModal = franja;
  modalTitulo.textContent = `Detalles de reservas para las ${franja}`;

  const reservasFranja = obtenerReservasDeFranja(franja);
  modalTbody.innerHTML = "";

  if (reservasFranja.length === 0) {
    modalVacio.textContent = "Sin reservas";
    modalVacio.classList.remove("hidden");
    modalTablaContenedor.classList.add("hidden");
    modalTotalMinutos.textContent = "0 minutos";
  } else {
    modalVacio.classList.add("hidden");
    modalTablaContenedor.classList.remove("hidden");

    let totalMinutos = 0;

    reservasFranja.forEach((res) => {
      const actividad = obtenerActividadPorId(res.actividadId);
      const nombre = actividad ? actividad.nombre : res.actividadId;
      const duracion = actividad ? actividad.duracion : 0;
      const cargaMinutos = res.personas * duracion;
      totalMinutos += cargaMinutos;

      const tr = document.createElement("tr");

      const tdActividad = document.createElement("td");
      tdActividad.textContent = nombre;

      const tdPersonas = document.createElement("td");
      tdPersonas.textContent = String(res.personas);

      const tdDuracion = document.createElement("td");
      tdDuracion.textContent = String(duracion);

      const tdCarga = document.createElement("td");
      tdCarga.textContent = `${cargaMinutos} minutos`;

      tr.append(tdActividad, tdPersonas, tdDuracion, tdCarga);
      modalTbody.appendChild(tr);
    });

    modalTotalMinutos.textContent = `${totalMinutos} minutos`;
  }

  modalBackdrop.classList.remove("hidden");
  cerrarModalBtn.focus();
}

//Oculta el modal y limpia la franja activa
function cerrarModal() {
  modalBackdrop.classList.add("hidden");
  franjaAbiertaEnModal = null;
}

//Guarda una nueva reserva al enviar el formulario y refresca la vista
reservaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const actividadId = selectActividad.value;
  const personas = Number.parseInt(selectPersonas.value, 10);
  const franja = selectFranja.value;

  if (!actividadId || Number.isNaN(personas) || personas < 1 || !franja) {
    return;
  }

  reservas.push({
    actividadId,
    personas,
    franja
  });

  renderizarFranjas();

  if (franjaAbiertaEnModal === franja) {
    abrirModal(franja);
  }
});

//Muestra u oculta la columna de actividades
toggleActividadesBtn.addEventListener("click", () => {
  const oculta = mainLayout.classList.toggle("sin-actividades");
  toggleActividadesBtn.setAttribute("aria-expanded", String(!oculta));
});

cerrarModalBtn.addEventListener("click", cerrarModal);

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    cerrarModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
    cerrarModal();
  }
});

//Carga inicial de la interfaz
renderizarTablaActividades();
poblarSelectorActividades();
renderizarFranjas();