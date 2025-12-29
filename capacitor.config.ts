import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mlsmakina.app',
  appName: 'MLSMakina',
  webDir: 'mobile-assets',
  server: {
    androidScheme: 'http',
    allowNavigation: ['*'],
    // ÖNEMLİ: Uygulamanın çalışması için bu URL'i bilgisayarınızın yerel IP adresiyle değiştirin.
    // Örnek: http://192.168.1.35:3000
    // Android Emulator kullanıyorsanız: http://10.0.2.2:3000
    url: 'http://192.168.1.100:3000',
    cleartext: true
  }
};

export default config;
