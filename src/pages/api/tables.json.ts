import type { APIRoute } from "astro";
import { getTablesOrders } from "../../lib/googleSheets";

export const GET: APIRoute = async () => {
  const tables = await getTablesOrders();
  return new Response(JSON.stringify(tables));
};
