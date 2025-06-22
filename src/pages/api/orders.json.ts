// src\pages\api\orders.json.ts

import type { APIRoute } from "astro";
import { appendToSheet } from "../../lib/googleSheets";

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

  await appendToSheet("orders", values);

  return new Response(JSON.stringify({ success: true }));
};
