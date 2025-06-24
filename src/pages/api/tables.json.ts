import type { APIRoute } from "astro";
import { getTablesOrders } from "../../lib/googleSheets";
import { MODE } from "astro:env/server";

const mocktables = [
  {
    mesa: "1",
    productos: [
      {
        id: "2",
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
        id: "1",
        codigo: "1006",
        cantidad: 1,
        mozo: "Gustavo",
        precio: 1,
        fecha: "22/6/2025 10:55",
      },
      {
        id: "3",
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

export const GET: APIRoute = async () => {
  let tables = [];
  if (MODE != "DEVELOP") {
    tables = await getTablesOrders();
  } else {
    tables = mocktables;
  }
  return new Response(JSON.stringify(tables));
};
