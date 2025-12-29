# Android Uygulaması Kurulum ve Çalıştırma Rehberi

Bu proje, mevcut web uygulamanızı Android uygulaması olarak çalıştırmak için **Capacitor** teknolojisini kullanır. Uygulama, bilgisayarınızda çalışan Next.js sunucusuna bağlanarak çalışır.

## Gereksinimler

- Node.js (Zaten kurulu)
- **Java JDK (Java 17 önerilir)** - APK oluşturmak için gereklidir.
- **Android Studio** - Uygulamayı derlemek ve telefona yüklemek için gereklidir.

## Adım Adım Kurulum

### 1. IP Adresinizi Öğrenin
Uygulamanın telefonunuzdan bilgisayarınıza erişebilmesi için yerel IP adresinizi bilmeniz gerekir.
- Komut satırına `ipconfig` yazın.
- `IPv4 Address` (örneğin `192.168.1.35`) değerini not edin.

### 2. Yapılandırmayı Güncelleyin
`capacitor.config.ts` dosyasını açın ve `server` bölümündeki `url` değerini kendi IP adresinizle güncelleyin:

```typescript
server: {
  // ...
  url: 'http://192.168.1.35:3000', // Buraya kendi IP adresinizi yazın
  cleartext: true
}
```

### 3. Sunucuyu Başlatın
Uygulamanın çalışması için web sunucusunun arka planda çalışıyor olması gerekir.
```bash
npm run dev
```

### 4. Android Projesini Senkronize Edin
Eğer config dosyasında değişiklik yaptıysanız, Android projesine aktarmak için:
```bash
npx cap sync
```

### 5. SDK Kurulumu ve APK Üretme (ÇOK ÖNEMLİ)

**Android Studio Kurulumu Tamamlandıktan Sonra:**
1. Başlat menüsünden **Android Studio**'yu açın.
2. Karşınıza çıkan kurulum sihirbazında (Setup Wizard) **Next** diyerek ilerleyin.
3. **Standard** kurulumu seçin ve gerekli dosyaların (Android SDK) inmesini bekleyin.
4. Android Studio açıldığında kapatabilirsiniz.

**APK Üretme:**
Proje ana dizininde sizin için **`build_apk.bat`** dosyasını hazırladım.
1. `build_apk.bat` dosyasına çift tıklayın.
2. İşlem bittiğinde başarılı mesajını göreceksiniz.
3. Oluşan APK dosyası `android/app/build/outputs/apk/debug/app-debug.apk` konumunda olacaktır.

## Önemli Notlar
- Bu Android uygulaması tek başına çalışmaz (Offline mod yoktur). Web sunucusunun (npm run dev) sürekli açık olması gerekir.
- Telefon ve bilgisayar aynı Wi-Fi ağında olmalıdır.
