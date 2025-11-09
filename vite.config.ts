import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
// https://vite.dev/config/
const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-query": resolve(__dirname, "src/shared/lib/react-query"),
    },
  },
  server: {
    host: true,
    allowedHosts: true,
  },

});
