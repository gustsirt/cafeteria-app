// src/scripts/cocina.js
const contenedor = document.getElementById("vista-cocina");

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
  // const estadoSeleccionado = filtroSelect.value;
  // const pedidosFiltrados = todosLosPedidos.filter(p => p.estado === estadoSeleccionado);

  contenedor.innerHTML = todosLosPedidos.map(pedido => {
    return `
        <div class="bg-white rounded-lg border shadow p-4 mb-4">
          <h2 class="text-lg font-bold mb-1">🧾 Pedido ID: ${pedido.id
      } - 🍽 Mesa ${pedido.mesa}</h2>
          <p class="text-sm text-gray-600 mb-2">🧍‍♂️ ${pedido.mozo} | 🕒 ${pedido.fecha
      } | Estado: <strong>${pedido.estado}</strong></p>
          <ul class="space-y-2">
            ${pedido.productos
        .map((prod) => {
          const art =
            articulos.find((a) => a.codigo === prod.codigo) || {};
          return `
                <li class="flex justify-between items-center border p-2 rounded bg-yellow-100">
                  <div>
                    <strong>${art.categoria || "¿?"}</strong> - ${art.descripcion || prod.codigo
            } - ${prod.cantidad}u
                    <span class="text-xs text-gray-600 block">Estado: ${pedido.estado
            }</span>
                  </div>
                  ${pedido.estado !== "REALIZADO"
              ? `<button class="bg-green-500 text-white px-2 py-1 rounded" onclick="marcarRealizado('${pedido.id}', '${prod.codigo}')">✅ Realizado</button>`
              : '<span class="text-green-700 font-semibold">Listo</span>'
            }
                </li>
              `;
        })
        .join("")}
          </ul>
        </div>
      `;
  }).join('');
}

window.marcarRealizado = async function (id, codigo) {
  const confirmacion = confirm("¿Marcar producto como REALIZADO?");
  if (!confirmacion) return;

  const res = await fetch("/api/marcar-realizado.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, codigo })
  });

  if (res.ok) {
    await cargarPedidos();
  } else {
    alert("Error marcando producto.");
  }
};

cargarPedidos();