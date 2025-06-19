import type { APIRoute } from "astro";
import { getWhatsappConfig } from "../../lib/googleSheets.ts";


export const GET: APIRoute = async () => {
  const telefono = await getWhatsappConfig();
  console.log("config: ", telefono);
  return new Response(JSON.stringify({ telefono }));
};