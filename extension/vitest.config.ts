import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.test.ts", "tests/**/*.test.ts"],
    setupFiles: [],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
      ],
    },
  },
});
