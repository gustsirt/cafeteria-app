// src\scripts\pedidos.js
const app = document.getElementById("app");

let config = {};
let articulos = [];
let pedido = [];
let mesa = '';

async function init() {
  try {
    const configres = await fetch('/api/config.json');
    if (!configres.ok) throw new Error("Error al cargar la config");
    config = await configres.json();
    console.log("Config cargada:", config);

    if (config.RangoProductos) {
      const articulosres = await fetch(`/api/articulos.json?range=${config.RangoProductos}`);
      if (!articulosres.ok) throw new Error("Error al cargar los artículos");
      articulos = await articulosres.json();
      console.log("Artículos cargados:", articulos);
    } else {
      console.warn("No se especificó RangoProductos en la config.");
    }

    app.innerHTML = `<p>WhatsApp cocina: ${config.whatsapp_cocina || "no definido"}</p>`;
  } catch (err) {
    console.error("Error inicializando app:", err);
    app.innerHTML = `<p class="text-red-600">Error cargando datos.</p>`;
  }
}

init()