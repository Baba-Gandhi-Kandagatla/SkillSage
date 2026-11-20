import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 4,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    // Slow down actions for better visibility (optional)
    launchOptions: {
      slowMo: 50,
    },
  },
  // Other settings...
});
