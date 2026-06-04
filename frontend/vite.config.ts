import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Use absolute base path on GitHub Pages so assets resolve under /shamba-point/
const base = process.env.NODE_ENV === "production" ? "/shamba-point/" : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    proxy: {
      // During dev: forward /api/* to the local PHP backend
      "/api": {
        target: "http://localhost/Small-Farmers/backend",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  define: {
    // Inject build-time env vars for production
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE_URL ?? "/api"),
  },
});
