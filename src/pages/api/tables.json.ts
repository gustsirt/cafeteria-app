import type { APIRoute } from "astro";
import { getTablesOrders } from "../../lib/googleSheets";

export const GET: APIRoute = async () => {
  // const tables = await getTablesOrders();
  const tables = [
    {
      mesa: "1",
      productos: [
        {
          codigo: "1030",
          cantidad: 2,
          mozo: "Gustavo",
          precio: 1,
          fecha: "22/6/2025 10:55",
        },
      ],
    },
    {
      mesa: "2",
      productos: [
        {
          codigo: "1006",
          cantidad: 1,
          mozo: "Gustavo",
          precio: 1,
          fecha: "22/6/2025 10:55",
        },
        {
          codigo: "1030",
          cantidad: 2,
          mozo: "Gustavo",
          precio: 1,
          fecha: "22/6/2025 10:55",
        },
      ],
    },
    {
      mesa: "3",
      productos: [],
    },
    {
      mesa: "4",
      productos: [],
    },
    {
      mesa: "5",
      productos: [],
    },
    {
      mesa: "6",
      productos: [],
    },
    {
      mesa: "7",
      productos: [],
    },
    {
      mesa: "8",
      productos: [],
    },
    {
      mesa: "9",
      productos: [],
    },
    {
      mesa: "10",
      productos: [],
    },
    {
      mesa: "11",
      productos: [],
    },
    {
      mesa: "12",
      productos: [],
    },
  ];
  return new Response(JSON.stringify(tables));
};
