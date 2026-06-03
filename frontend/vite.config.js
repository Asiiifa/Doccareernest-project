import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes("lucide-react"),
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
