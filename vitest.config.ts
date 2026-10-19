import { defineConfig } from 'vite-plus'

// Unit tests do not need the Start/Nitro app servers or devtools plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { environment: 'node' },
})
