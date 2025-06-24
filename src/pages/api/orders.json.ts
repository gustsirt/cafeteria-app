// src\pages\api\orders.json.ts

export const prerender = false;

import type { APIRoute } from "astro";
import { appendToSheet, getPedidosResumen } from "../../lib/googleSheets.ts";
import { MODE } from "astro:env/server";

const mockorders = [
  {
    id: "1",
    mozo: "Gustavo",
    fecha: "22/6/2025 10:55",
    mesa: "2",
    estado: "nuevo",
    productos: [
      {
        codigo: "1006",
        cantidad: 1,
        precio: 1,
      },
    ],
  },
  {
    id: "2",
    mozo: "Gustavo",
    fecha: "22/6/2025 10:55",
    mesa: "1",
    estado: "nuevo",
    productos: [
      {
        codigo: "1030",
        cantidad: 2,
        precio: 1,
      },
    ],
  },
  {
    id: "3",
    mozo: "Gustavo",
    fecha: "22/6/2025 10:55",
    mesa: "2",
    estado: "nuevo",
    productos: [
      {
        codigo: "1030",
        cantidad: 2,
        precio: 1,
      },
    ],
  },
];

// POST: guarda el pedido
export const POST: APIRoute = async ({ request }) => {
  const { id, mesa, mozo, pedido, fecha } = await request.json();

  let nid = id;

  if (!id) {
    nid = Date.now();
  }

  if (!pedido || !Array.isArray(pedido)) {
    return new Response(JSON.stringify({ error: "Pedido inválido" }), {
      status: 400,
    });
  }

  const values = pedido.map((p) => [
    nid,
    mesa,
    mozo,
    p.codigo,
    p.cantidad,
    p.precio,
    fecha,
  ]);

  console.log("🧾 Pedido recibido:", values);
  await appendToSheet("orders", values);

  return new Response(JSON.stringify({ success: true }));
};

// GET: devuelve resumen de pedidos
export const GET: APIRoute = async () => {
  try {
    let pedidos = [];
    if (MODE != "DEVELOP") {
      pedidos = await getPedidosResumen();
    } else {
      pedidos = mockorders;
    }
    return new Response(JSON.stringify(pedidos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    return new Response(JSON.stringify({ error: "Error al obtener pedidos" }), {
      status: 500,
    });
  }
};
