import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 60_000,
  workers: 1,
  reporter: [['line'], ['junit', { outputFile: 'qa-artifacts/playwright-results.xml' }]],
  use: { screenshot: 'only-on-failure', trace: 'retain-on-failure' },
});
