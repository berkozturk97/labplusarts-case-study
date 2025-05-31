import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // CSS Modules için klasör ve dosya isimlendirme
      generateScopedName: "[name]__[local]___[hash:base64:5]",
      // Global CSS değişkenlerinin çalışması için
      globalModulePaths: [/\.global\.(css|scss|sass)$/],
    },
  },
});
