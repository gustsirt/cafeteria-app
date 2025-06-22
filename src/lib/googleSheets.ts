// src\lib\googleSheets.ts
import {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEETS_ID,
  CONFIG_SHEET,
  ARTICLES_SHEET,
  ORDER_SHEET,
} from "astro:env/server";
import { google } from "googleapis";

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
      precio,
    }),
  );
}

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

/**
 * Agrega datos a una hoja de cálculo
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
