import type { APIRoute } from "astro";
import { getArticulos } from "../../lib/googleSheets.ts";
import { ARTICLES_SHEET } from "astro:env/server";

export const GET: APIRoute = async () => {
  const range = ARTICLES_SHEET;

  if (!range || typeof range !== "string") {
    return new Response("Rango Articulos no válido", { status: 400 });
  }

  const articulos = await getArticulos(range);
  return new Response(JSON.stringify(articulos), {
    headers: { "Content-Type": "application/json" },
  });
};
