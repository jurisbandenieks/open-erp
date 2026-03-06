import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]]
      }
    })
  ],
  server: {
    host: "0.0.0.0", // allow external access (useful in Docker)
    port: 3000, // match Dockerfile exposed port
    hmr: {
      overlay: true // Show error overlay
    },
    watch: {
      usePolling: true // Enable polling for file changes (useful in Docker/WSL)
    },
    proxy: {
      "/api": {
        target: "http://api:5000",
        rewrite: (path) => path.replace(/^\/api/, "")
      },
      "/auth": {
        target: "http://auth:5001",
        rewrite: (path) => path.replace(/^\/auth/, "")
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
