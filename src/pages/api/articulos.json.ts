import type { APIRoute } from "astro";
import { getArticulos, getWhatsappConfig } from "../../lib/googleSheets.ts";

export const GET: APIRoute = async () => {
  const config = await getWhatsappConfig();
  const articulos = await getArticulos(config.RangoProductos);
  return new Response(JSON.stringify(articulos));
};
