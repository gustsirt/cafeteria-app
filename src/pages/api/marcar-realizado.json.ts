// src/pages/api/marcar-realizado.json.ts
import type { APIRoute } from "astro";
import { marcarPedidoComoRealizado } from "../../lib/googleSheets.ts";
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { id } = body;

  try {
    await marcarPedidoComoRealizado(id);
    return new Response(JSON.stringify({ ok: true }));
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
};
