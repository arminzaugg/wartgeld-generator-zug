import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Changed from @vitejs/plugin-react-swc
import path from "path";
import { devAddressLookup } from "./scripts/edge/devAddressLookup";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    devAddressLookup(mode),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache well across app deploys.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
