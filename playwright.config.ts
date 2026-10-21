import { defineConfig, devices } from "@playwright/test";

const PORT = 5179;
// CI tests the built bundle (what gets deployed); locally the dev server is quicker.
const PREVIEW = process.env.E2E_PREVIEW === "1";

export default defineConfig({
  // Root as testDir so reports name files from the project root (e2e/…), as the evidence reader expects.
  testDir: ".",
  testMatch: "e2e/**/*.spec.ts",
  fullyParallel: true,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e-results.json" }], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: PREVIEW
      ? `npx vite build && npx vite preview --port ${PORT} --strictPort`
      : `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    // Turns off the dev address service: tests stub /api/address and never call Swiss Post.
    env: { E2E: "1" },
  },
});
