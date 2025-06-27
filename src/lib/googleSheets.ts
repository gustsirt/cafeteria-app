// src\lib\googleSheets.ts
import {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEETS_ID,
  CONFIG_SHEET,
  ARTICLES_SHEET, // getArticulos
  ORDER_SHEET, // appendToSheet y getTablesOrders
  TOTAL_MESAS, // getTablesOrders
} from "astro:env/server";
import { google } from "googleapis";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

// 🛡️ Crea el authClient
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Cliente de Sheets con auth incluido
const sheets = google.sheets({ version: "v4", auth });

/** Funcion para obtener la configuracion de la APP
 * @returns
 */
export async function getWhatsappConfig() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    // range: 'Config!A2:B',
    range: CONFIG_SHEET,
  });
  const values = res.data.values || [];
  const config = Object.fromEntries(values);
  return config || "";
}

/** Funcion para obtener los productos
 * @returns
 */
export async function getArticulos() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: ARTICLES_SHEET,
  });

  return (res.data.values || []).map(
    ([codigo, categoria, descripcion, precio]) => ({
      codigo,
      categoria,
      descripcion,
      precio: Number(precio),
    }),
  );
}

/** Agrega datos a una hoja de cálculo
 * @param range Ejemplo: 'Pedidos!A1'
 * @param values Array bidimensional: [[valor1, valor2], [fila2...], ...]
 */
export async function appendToSheet(rangeString: string, values: any[][]) {
  const range = rangeString == "orders" ? ORDER_SHEET : null;

  if (range == null) {
    console.log(
      "no se puede agregar datos a la hoja de cálculo: Rango incorrecto",
    );
    return;
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range,
      valueInputOption: "USER_ENTERED",
      resource: {
        values,
      },
    });
    return "✅ Datos correctamente agregados";
  } catch (error) {
    console.error("❌ Error en addToSheet:", error);
    throw error;
  }
}

/** Obtiene el total ordenado por mesa
 * @returns
 */
export async function getTablesOrders() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: ORDER_SHEET,
  });

  const datos = res.data.values || [];

  // Remover la cabecera
  const [, ...filas] = datos;

  // Inicializar estructura para cada mesa
  const mesas = Array.from({ length: Number(TOTAL_MESAS) }, (_, i) => ({
    mesa: (i + 1).toString(),
    productos: [],
  }));

  for (const fila of filas) {
    const [id, mesa, mozo, codigo, cantidad, precio, fecha, estado] = fila;

    const mesaEncontrada = mesas.find((m) => m.mesa === mesa);
    if (mesaEncontrada) {
      mesaEncontrada.productos.push({
        id,
        codigo,
        cantidad: Number(cantidad),
        mozo,
        precio: Number(precio),
        fecha,
      });
    }
  }
  return mesas;
}

/** Permite limpiar mesa luego de la facturación
 * @param mesa Ejemplo '1'
 * @returns
 */
export async function removeOrdersFromSheet(mesa: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: ORDER_SHEET,
  });

  const rows = res.data.values || [];
  const [, ...filas] = rows;

  const indicesParaBorrar = filas
    .map((fila, i) => ({ index: i + 1, mesa: fila[1] })) // index real = +1 por header
    .filter((fila) => fila.mesa === mesa)
    .map((f) => f.index);

  if (indicesParaBorrar.length === 0) return "Nada que borrar.";

  // Borramos desde el final hacia el principio
  indicesParaBorrar.sort((a, b) => b - a);

  for (const i of indicesParaBorrar) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEETS_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetIdFromRange(ORDER_SHEET),
                dimension: "ROWS",
                startIndex: i,
                endIndex: i + 1,
              },
            },
          },
        ],
      },
    });
  }

  return `Borradas ${indicesParaBorrar.length} filas.`;
}

// 🧠 Devuelve el sheetId necesario para borrar filas
async function getSheetIdFromRange(namedRange: string): Promise<number> {
  const res = await sheets.spreadsheets.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    includeGridData: false,
  });

  const sheet = res.data.sheets?.find(
    (s) => s.properties?.title === namedRange.split("!")[0],
  );

  return sheet?.properties?.sheetId || 0;
}

/** Obtiene la lista de pedidos con su estado, mozo y fecha
 * @returns
 */
export async function getPedidosResumen() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: ORDER_SHEET,
  });

  const datos = res.data.values || [];

  // Remover cabecera
  const [, ...filas] = datos;

  const pedidosMap = new Map();

  for (const fila of filas) {
    const [id, mesa, mozo, codigo, cantidad, precio, fecha, estado] = fila;

    if (pedidosMap.has(id)) {
      pedidosMap.get(id).productos.push({
        codigo,
        cantidad: Number(cantidad),
        precio: Number(precio),
      });
    } else {
      pedidosMap.set(id, {
        id,
        mozo,
        fecha,
        mesa,
        estado: estado || "nuevo",
        productos: [
          {
            codigo,
            cantidad: Number(cantidad),
            precio: Number(precio),
          },
        ],
      });
    }
  }

  // Usar dayjs para parsear y ordenar por fecha
  return Array.from(pedidosMap.values()).sort(
    (a, b) =>
      dayjs(a.fecha, "D/M/YYYY H:mm").valueOf() -
      dayjs(b.fecha, "D/M/YYYY H:mm").valueOf(),
  );
}

/**
 *
 * @param id
 * @param codigo
 * @returns
 */
export async function marcarPedidoComoRealizado(id: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range: ORDER_SHEET,
  });

  const rows = res.data.values || [];
  const header = rows[0];
  const idIndex = header.indexOf("ID");
  const estadoIndex = header.indexOf("Estado");
  if (idIndex === -1 || estadoIndex === -1) {
    throw new Error("Columnas ID o Estado no encontradas");
  }

  const updates: { range: string; values: string[][] }[] = [];

  rows.forEach((row, i) => {
    if (i === 0) return; // Saltar encabezado
    if (row[idIndex] === id) {
      const cell = `${ORDER_SHEET.split("!")[0]}!${String.fromCharCode(65 + estadoIndex)}${i + 1}`;
      updates.push({
        range: cell,
        values: [["REALIZADO"]],
      });
    }
  });

  if (updates.length === 0) throw new Error("Pedido no encontrado");

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: GOOGLE_SHEETS_ID,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates,
    },
  });

  return true;
}
