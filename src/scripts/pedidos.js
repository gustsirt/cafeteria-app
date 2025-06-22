// src\scripts\pedidos.js
const app = document.getElementById("app");

let config = {};
let articulos = [];
let pedido = [];
let mesa = '';

async function init() {
  try {
    // --- Cargar la configuración y los artículos

    // ! por ahora sin uso
    // const configres = await fetch('/api/config.json');
    // if (!configres.ok) throw new Error("Error al cargar la config");
    // config = await configres.json();
    // console.log("Config cargada:", config);

    // if (config.RangoProductos) {
    const articulosres = await fetch(`/api/articulos.json`);
    if (!articulosres.ok) throw new Error("Error al cargar los artículos");
    articulos = await articulosres.json();
    console.log("Artículos cargados:", articulos);
    // } else {
    //   console.warn("No se especificó RangoProductos en la config.");
    // }

    const cats = [...new Set(articulos.map((a) => a.categoria))];

    // Solicita el Mozo
    let mozo = localStorage.getItem("mozo") || "";
    if (!mozo) {
      mozo = prompt("¿Nombre del mozo?");
      localStorage.setItem("mozo", mozo);
    }

    app.innerHTML = `
    <label class="block mb-2">Filtrar por categoría:
      <select id="filtro" class="ml-2 border p-1 rounded">
        ${cats.map((c) => `<option>${c}</option>`).join("")}
      </select>
    </label>
    <ul id="lista" class="space-y-2"></ul>
    <div class="mt-4">
      <button id="whatsapp" class="bg-green-500 text-white px-4 py-2 rounded mr-2">📱 Enviar a cocina</button>
      <button id="facturar" class="bg-red-500 text-white px-4 py-2 rounded">✅ Facturar</button>
    </div>
  `;

    renderLista();
    document.getElementById("filtro").addEventListener("change", renderLista);
    document
      .getElementById("whatsapp")
      .addEventListener("click", enviarWhatsApp);
    document.getElementById("facturar").addEventListener("click", () => {
      if (confirm("¿Borrar pedido?")) {
        pedido = [];
        renderLista();
      }
    });
  } catch (err) {
    console.error("Error inicializando app:", err);
    app.innerHTML = `<p class="text-red-600">Error cargando datos.</p>`;
  }
}

function renderLista() {
  const cat = document.getElementById('filtro').value;
  const lista = articulos.filter(a => a.categoria === cat);
  document.getElementById('lista').innerHTML = lista.map(a => `
    <li class="border p-2 rounded flex justify-between items-center">
      <span>${a.descripcion}1
      </span>
      <button onclick="agregarPedido('${a.codigo}')" class="bg-blue-500 text-white px-2 py-1 rounded">+</button>
    </li>
  `).join('');
}

window.agregarPedido = (codigo) => {
  const art = articulos.find(a => a.codigo === codigo);
  const existente = pedido.find(p => p.codigo === codigo);
  if (existente) existente.cantidad++;
  else pedido.push({ ...art, cantidad: 1 });
  alert(`${art.descripcion} agregado`);
}

async function enviarWhatsApp() {
  const res = await fetch('/api/config.json');
  const { telefono } = await res.json();
  const texto = `🧾 Pedido mesa ${mesa}:\n` + pedido.map(p => `• ${p.cantidad} x ${p.descripcion}`).join('\n');
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
}

init()