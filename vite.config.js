```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: { '.js': 'jsx' },
  },
  server: {
    allowedHosts: [
      'dnx5yv-5173.csb.app', // Spezifischer Host für deine Sandbox
      '*.csb.app', // Erlaubt alle CodeSandbox-Hosts (optional, für Flexibilität)
    ],
  },
});
```
