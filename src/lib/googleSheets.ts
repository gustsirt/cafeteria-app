import { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID, CONFIG_SHEET } from "astro:env/server"
import { google } from 'googleapis';

const SHEET_ID = GOOGLE_SHEETS_ID;
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

export async function getArticulos() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Articulos!A2:D',
  });

  return (res.data.values || []).map(([codigo, descripcion, precio, categoria]) => ({
    codigo, descripcion, precio, categoria,
  }));
}

export async function getWhatsappConfig() {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Config!A2:B',
  });
  const config = Object.fromEntries(res.data.values || []);
  return config.whatsapp_cocina || '';
}
