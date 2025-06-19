import type { APIRoute } from 'astro';
import { getArticulos } from '../../lib/googleSheets.ts';

export const GET: APIRoute = async () => {
  const articulos = await getArticulos();
  return new Response(JSON.stringify(articulos));
};