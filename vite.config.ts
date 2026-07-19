import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Port the Vite dev server itself runs on (frontend only, dev mode only).
const port = Number(process.env.CLIENT_PORT) || 5173;

// Port the Express API server runs on — see server/index.js, which also
// defaults to 3001. The dev server proxies /api requests there so the
// frontend can call relative paths like fetch("/api/books") in both dev
// and production (in production, server/index.js serves both).
const apiPort = Number(process.env.PORT) || 3001;

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
});
