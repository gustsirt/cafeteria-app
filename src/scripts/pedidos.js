// src\scripts\pedidos.js

// ==============================
// 🔧 Variables globales
// ==============================
const app = document.getElementById("app");

let articulos = [];
let mesas = [];
let mozo = ""
let mesa = ""
let pedido = [];

// ==============================
// 🚀 Función principal de inicio
// ==============================
async function init() {
  try {
    // --- Cargar Mesas
    await cargarMesas();

    // --- Cargar Artículos
    const articulosres = await fetch(`/api/articles.json`);
    if (!articulosres.ok) throw new Error("Error al cargar los artículos");
    articulos = await articulosres.json();
    // const cats = [...new Set(articulos.map((a) => a.categoria))];

    // --- Solicita el Mozo
    mozo = localStorage.getItem("mozo") || "";
    if (!mozo) {
      mozo = prompt("¿Nombre del mozo?");
      localStorage.setItem("mozo", mozo);
    }

    // Render de la vista principal con mesas
    app.innerHTML = `
      <h2 class="text-2xl font-bold mb-4">👤 Mozo: ${mozo}</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    ${mesas.map(({ mesa, productos }) => {
      const cantidad = productos.reduce((acc, p) => acc + Number(p.cantidad), 0);
      const total = productos.reduce((acc, p) => acc + (p.precio || 0) * Number(p.cantidad), 0);

      return `
        <div class="rounded-xl border shadow-sm p-4 ${productos.length ? 'bg-yellow-100' : 'bg-gray-100'}">
          <button onclick="seleccionarMesa('${mesa}')" class="w-full text-left">
            <div class="text-lg font-semibold">🍽️ Mesa ${mesa}</div>
            <div class="text-sm text-gray-700">${cantidad} producto(s)</div>
            <div class="text-sm text-gray-700">💵 $${total.toFixed(2)}</div>
          </button>
          ${productos.length > 0 ? `
            <ul class="mt-2 text-sm text-gray-800">
              ${productos.map(p => {
        const articulo = articulos.find(a => a.codigo === p.codigo);
        const nombre = articulo ? articulo.descripcion : p.codigo;
        return `<li>- ${p.cantidad} x ${nombre}</li>`;
      }).join("")}
            </ul>
          ` : ""}
        </div>
      `;
    }).join("")}
      </div>
    `
  } catch (err) {
    console.error("Error inicializando app:", err);
    app.innerHTML = `<p class="text-red-600">Error cargando datos.</p>`;
  }
}

// ==============================
// 📥 Cargar datos de mesas
// ============================
async function cargarMesas() {
  const res = await fetch('/api/tables.json');
  if (!res.ok) throw new Error('Error al cargar las mesas');
  mesas = await res.json();
}

// ==============================
// 📋 Selección de mesa y carga de interfaz
// ==============================
window.seleccionarMesa = (mesaId) => {
  mesa = mesaId;
  const productos = mesas.find(m => m.mesa === mesaId).productos;
  const cantidad = productos.reduce((acc, p) => acc + p.cantidad, 0);
  const total = productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  console.log(productos);

  pedido = []; // vaciamos, podrías precargar con productos si querés
  const cats = [...new Set(articulos.map(a => a.categoria))];

  app.innerHTML = `
  <h2 class="text-2xl font-bold mb-2">🪑 Mesa ${mesa}</h2>
  <div class="mb-4 text-gray-700">
    <div><strong>${cantidad}</strong> producto(s)</div>
    <div>Total: <strong>$${total.toFixed(2)}</strong></div>
    ${productos.length > 0 ? `
      <ul class="mt-2 text-sm text-gray-800">
        ${productos.map(p => {
    const articulo = articulos.find(a => a.codigo === p.codigo);
    const nombre = articulo ? articulo.descripcion : p.codigo;
    return `<li>- ${p.cantidad} x ${nombre}</li>`;
  }).join("")}
      </ul>
    ` : ""}
  </div>

  <div class="mt-6 flex flex-wrap gap-2">
    <button id="preparar" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">📱 Enviar a cocina</button>
    <button id="facturar" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">✅ Facturar</button>
    <button onclick="init()" class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">⬅️ Volver</button>
  </div>

  <label class="block mb-4">

  <hr class="my-4" />
  <div>
  <div id="resumen" class="bg-gray-100 p-4 rounded shadow-sm text-sm"></div>

<hr class="my-4" />
  <span class="block mb-1 text-sm font-medium">Filtrar por categoría</span>
    <select id="filtro" class="w-full border p-2 rounded">
      <option value="__TODAS__">🍽️ Todas</option>
      ${cats.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
  </label>

  <ul id="lista" class="space-y-2"></ul>

`;


  renderLista();
  document.getElementById("filtro").addEventListener("change", renderLista);
  document.getElementById("preparar").addEventListener("click", enviarOrden);
}

// ==============================
// 🧾 Render de artículos por categoría
// ==============================
function renderLista() {
  const cat = document.getElementById('filtro').value;
  const lista = cat === "__TODAS__" ? articulos : articulos.filter(a => a.categoria === cat);

  document.getElementById('lista').innerHTML = lista.map(a => {
    const yaPedido = pedido.find(p => p.codigo === a.codigo);
    const cantidad = yaPedido ? yaPedido.cantidad : 0;

    return `
      <li class="flex items-center justify-between border p-3 rounded shadow-sm ${yaPedido ? 'bg-blue-300' : ''}">
        <div class="text-sm">
          <div class="font-medium">${a.descripcion}</div>
          <div class="text-gray-600">$${a.precio}</div>
          ${yaPedido ? `<div class="text-blue-700 text-xs mt-1">En pedido: ${cantidad}</div>` : ''}
        </div>
        <button onclick="agregarPedido('${a.codigo}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-lg leading-none">＋</button>
      </li>
    `;
  }).join('');
}

// ==============================
// ➕ Agregar artículo al pedido
// ==============================
window.agregarPedido = (codigo) => {
  const art = articulos.find(a => a.codigo === codigo);
  const existente = pedido.find(p => p.codigo === codigo);

  if (existente) existente.cantidad++;
  else pedido.push({ ...art, cantidad: 1 });

  renderLista();      // Actualiza la lista resaltando
  renderResumen();    // Muestra resumen actualizado
}

// ==============================
// 📄 Render del resumen del pedido
// ==============================
function renderResumen() {
  const contenedor = document.getElementById("resumen");

  if (!contenedor || pedido.length === 0) {
    contenedor.innerHTML = `<p class="text-sm text-gray-500">Sin artículos agregados.</p>`;
    return;
  }

  const total = pedido.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  contenedor.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">🧾 Pedido actual</h3>
    <ul class="text-sm mb-2">
      ${pedido.map(p => `<li>- ${p.cantidad} x ${p.descripcion}</li>`).join("")}
    </ul>
    <div class="font-medium">💰 Total: $${total.toFixed(2)}</div>
  `;
}

// ==============================
// 📤 Enviar pedido al servidor
// ==============================
async function enviarOrden() {
  if (pedido.length === 0) {
    alert("No hay artículos en el pedido.");
    return;
  }

  const fecha = new Date().toLocaleString("es-AR");
  const payload = {
    mesa,
    mozo,
    pedido,
    fecha,
  };

  const res = await fetch("/api/orders.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("✅ Pedido enviado a cocina.");
    pedido = [];
    renderResumen();
  } else {
    alert("❌ Error al enviar el pedido.");
  }
}

// ==============================
// ▶️ Iniciar app al cargar
// ==============================
window.init = init;
init()