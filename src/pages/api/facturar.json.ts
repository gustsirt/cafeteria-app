import type { APIRoute } from "astro";
import { removeOrdersFromSheet } from "../../lib/googleSheets";
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { mesa } = await request.json();

  if (!mesa) {
    return new Response(JSON.stringify({ error: "Falta mesa" }), {
      status: 400,
    });
  }

  const result = await removeOrdersFromSheet(mesa);

  return new Response(JSON.stringify({ success: true, result }));
};
