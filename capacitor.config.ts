import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vault.app',
  appName: 'Vault',
  webDir: 'dist',
  server: {
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    }
  }
};

export default config;
