// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_PRIVATE_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      GOOGLE_SHEETS_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      CONFIG_SHEET: envField.string({ context: "server", access: "secret" }),
      ARTICLES_SHEET: envField.string({ context: "server", access: "secret" }),
      ORDER_SHEET: envField.string({ context: "server", access: "secret" }),
      TOTAL_MESAS: envField.string({ context: "server", access: "secret" }),
      MODE: envField.string({ context: "server", access: "secret" }),
    },
  },
});