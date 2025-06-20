// src\pages\api\config.json.ts

import type { APIRoute } from "astro";
import { getWhatsappConfig } from "../../lib/googleSheets.ts";

export const GET: APIRoute = async () => {
  const config = await getWhatsappConfig();
  // console.log("config: ", config);
  return new Response(JSON.stringify(config), {
    headers: { "Content-Type": "application/json" },
  });
};
