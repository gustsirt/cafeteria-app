import type { APIRoute } from "astro";
import { marcarProductoComoRealizado } from "../../lib/googleSheets.ts";
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { id, codigo } = body;

  try {
    await marcarProductoComoRealizado(id, codigo);
    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500 }
    );
  }
};