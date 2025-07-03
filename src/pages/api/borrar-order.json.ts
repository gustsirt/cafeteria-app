import type { APIRoute } from "astro";
import { removeOrderFromSheet } from "../../lib/googleSheets";
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { pedido } = await request.json();

  if (!pedido) {
    return new Response(JSON.stringify({ error: "Falta Pedido" }), {
      status: 400,
    });
  }

  const result = await removeOrderFromSheet(pedido);

  return new Response(JSON.stringify({ success: true, result }));
};
