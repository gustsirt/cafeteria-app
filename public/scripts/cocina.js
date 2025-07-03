// src/scripts/cocina.js
const contenedor = document.getElementById("vista-cocina");
const filtroSelect = document.getElementById("filtro-estado");

let articulos = [];
let todosLosPedidos = [];

async function cargarPedidos() {
  try {
    // Cargar artículos
    const articulosres = await fetch(`/api/articles.json`);
    if (!articulosres.ok) throw new Error("Error al cargar los artículos");
    articulos = await articulosres.json();

    // Cargar pedidos
    const res = await fetch("/api/orders.json");
    if (!res.ok) throw new Error("Error al cargar pedidos");
    todosLosPedidos = await res.json();

    // Renderizar pedidos
    renderizarPedidos()

  } catch (err) {
    contenedor.innerHTML = `<p class="text-red-600">Error cargando pedidos</p>`;
    console.error(err);
  }
}

function renderizarPedidos() {
  const estadoSeleccionado = filtroSelect.value;
  const pedidosFiltrados = estadoSeleccionado === "TODOS"
    ? todosLosPedidos
    : todosLosPedidos.filter(p => p.estado === estadoSeleccionado);

  contenedor.innerHTML = pedidosFiltrados.map(pedido => {
    return `
      <div class="bg-white rounded-lg border shadow p-4 mb-4">
        <h2 class="text-lg font-bold mb-1">🧾 Pedido ID: ${pedido.id} - 🍽 Mesa ${pedido.mesa}</h2>
        <p class="text-sm text-gray-600 mb-2">🧍‍♂️ ${pedido.mozo} | 🕒 ${pedido.fecha} | Estado: <strong>${pedido.estado}</strong></p>
        <ul class="space-y-2 mb-2">
          ${pedido.productos.map(prod => {
      const art = articulos.find(a => a.codigo === prod.codigo) || {};
      return `
              <li class="flex justify-between items-center border p-2 rounded bg-yellow-100">
                <div>
                  <strong>${art.categoria || "¿?"}</strong> - ${art.descripcion || prod.codigo} - ${prod.cantidad}u
                </div>
              </li>
            `;
    }).join("")}
        </ul>
        ${pedido.estado !== "REALIZADO"
        ? `<button class="bg-green-500 text-white px-3 py-1 rounded" onclick="marcarPedidoRealizado('${pedido.id}')">✅ Marcar como Realizado</button>`
        : '<span class="text-green-700 font-semibold">✔️ Pedido Listo</span>'
      }
      <button class="bg-red-500 text-white px-3 py-1 rounded" onclick="borrarPedido('${pedido.id}')">❌ Borrar pedido</button>
      </div>
    `;
  }).join('');
}

window.marcarPedidoRealizado = async function (id) {
  const confirmar = confirm("¿Marcar pedido completo como REALIZADO?");
  if (!confirmar) return;

  const res = await fetch("/api/marcar-realizado.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  if (res.ok) {
    await cargarPedidos();
  } else {
    alert("Error actualizando estado del pedido.");
  }
};

window.borrarPedido = async function (pedido) {
  const confirmar = confirm("¿Borrar este pedido?");
  if (!confirmar) return;

  const res = await fetch("/api/borrar-order.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedido })
  });

  if (res.ok) {
    alert("✅ Pedido Eliminado.");
    await cargarPedidos();
  } else {
    alert("❌ No se pudo eliminar el pedido.");
  }
};

// Escuchar cambios en el filtro
filtroSelect.addEventListener("change", renderizarPedidos);

// Carga inicial
cargarPedidos();