// src\pages\api\pedido.json.ts

import type { APIRoute } from "astro";
import { appendToSheet } from "../../lib/googleSheets";

export const POST: APIRoute = async ({ request }) => {
  const { mesa, mozo, pedido, fecha } = await request.json();

  if (!pedido || !Array.isArray(pedido)) {
    return new Response(JSON.stringify({ error: "Pedido inválido" }), {
      status: 400,
    });
  }

  const values = pedido.map((p) => [mesa, mozo, p.codigo, p.cantidad, fecha]);

  await appendToSheet("orders", values);

  return new Response(JSON.stringify({ success: true }));
};
