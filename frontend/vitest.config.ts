// Run tests with: npx vitest
// Required packages (install when npm registry is available):
//   npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
