// src/scripts/cocina.js
const contenedor = document.getElementById("vista-cocina");

async function cargarPedidos() {
  try {
    const res = await fetch("/api/tables.json");
    if (!res.ok) throw new Error("Error al cargar pedidos");

    const mesas = await res.json();
    const agrupado = {};

    mesas.forEach(m => {
      m.productos.forEach(p => {
        if (!agrupado[p.id]) agrupado[p.id] = [];
        agrupado[p.id].push({ ...p, mesa: m.mesa });
      });
    });

    contenedor.innerHTML = Object.entries(agrupado).map(([id, productos]) => {
      return `
        <div class="bg-white rounded-lg border shadow p-4 mb-4">
          <h2 class="text-lg font-bold mb-2">🧾 Pedido ID: ${id}</h2>
          <ul class="space-y-2">
            ${productos.map(p => `
              <li class="flex justify-between items-center border p-2 rounded ${p.estado === 'REALIZADO' ? 'bg-green-100' : 'bg-yellow-100'}">
                <div>
                  <strong>Mesa ${p.mesa}</strong> - ${p.codigo} - ${p.cantidad}u
                  <span class="text-xs text-gray-600 block">Estado: ${p.estado}</span>
                </div>
                ${p.estado !== 'REALIZADO' ? `<button class="bg-green-500 text-white px-2 py-1 rounded" onclick="marcarRealizado('${p.id}', '${p.codigo}')">✅ Realizado</button>` : '<span class="text-green-700 font-semibold">Listo</span>'}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }).join('');

  } catch (err) {
    contenedor.innerHTML = `<p class="text-red-600">Error cargando pedidos</p>`;
    console.error(err);
  }
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