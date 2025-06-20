import type { APIRoute } from "astro";
import { getArticulos } from "../../lib/googleSheets.ts";

export const GET: APIRoute = async ({ url }) => {
  const rango = url.searchParams.get("range") || "";
  if (rango == "") return new Response("Rango Articulos no válido");
  const articulos = await getArticulos(rango);
  return new Response(JSON.stringify(articulos));
};
