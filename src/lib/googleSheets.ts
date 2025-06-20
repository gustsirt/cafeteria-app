// src\lib\googleSheets.ts
import {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEETS_ID,
  CONFIG_SHEET,
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

export async function getArticulos(range: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEETS_ID,
    range,
  });

  return (res.data.values || []).map(
    ([codigo, detalle, categoria, descripcion]) => ({
      codigo,
      detalle,
      categoria,
      descripcion,
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
