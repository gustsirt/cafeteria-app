import type { APIRoute } from "astro";
import { getArticulos } from "../../lib/googleSheets.ts";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const rango = searchParams.get("range") || "TPRODUCTOS";

  if (!rango) {
    return new Response("Rango Articulos no válido", { status: 400 });
  }

  const articulos = await getArticulos(rango);
  return new Response(JSON.stringify(articulos), {
    headers: { "Content-Type": "application/json" },
  });
};
