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
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
