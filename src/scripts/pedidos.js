// src\scripts\pedidos.js
const app = document.getElementById("app");

let articulos = [];
let mesas = [];
let mozo = ""
let mesa = ""
let pedido = [];

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

    // Mostrar lista de mesas
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

async function cargarMesas() {
  const res = await fetch('/api/tables.json');
  if (!res.ok) throw new Error('Error al cargar las mesas');
  mesas = await res.json();
}

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
    <button id="whatsapp" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">📱 Enviar a cocina</button>
    <button id="facturar" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">✅ Facturar</button>
    <button onclick="init()" class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">⬅️ Volver</button>
  </div>
  
  <label class="block mb-4">
    <span class="block mb-1 text-sm font-medium">Filtrar por categoría</span>
    <select id="filtro" class="w-full border p-2 rounded">
      ${cats.map(c => `<option>${c}</option>`).join("")}
    </select>
  </label>

  <ul id="lista" class="space-y-2"></ul>

`;


  renderLista();
  document.getElementById("filtro").addEventListener("change", renderLista);
}

function renderLista() {
  const cat = document.getElementById('filtro').value;
  const lista = articulos.filter(a => a.categoria === cat);
  document.getElementById('lista').innerHTML = lista.map(a => `
    <li class="flex items-center justify-between border p-3 rounded shadow-sm">
      <div class="text-sm">
        <div class="font-medium">${a.descripcion}</div>
        <div class="text-gray-600">$${a.precio}</div>
      </div>
      <button onclick="agregarPedido('${a.codigo}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-lg leading-none">＋</button>
    </li>
  `).join('');
}

window.init = init;
init()