# 📱 APK Oluşturma Rehberi

Bu rehber, Nutrition App için debug/test amaçlı APK dosyası oluşturmanıza yardımcı olacaktır.

## 🚀 Hızlı Başlangıç

### Önkoşullar
- Node.js ve npm kurulu olmalı
- Expo hesabı (ücretsiz) - [expo.dev](https://expo.dev) adresinden oluşturabilirsiniz

---

## 📦 Yöntem 1: EAS Build ile APK (Önerilen - En Kolay)

### Adım 1: NPM Cache Sorununu Çözme (Gerekirse)
Eğer NPM izin hatası alıyorsanız:
```bash
sudo chown -R 501:20 "/Users/furkanakar/.npm"
```

### Adım 2: EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

veya npx ile kullanabilirsiniz (kurulum gerektirmez):
```bash
npx eas-cli --version
```

### Adım 3: Expo Hesabına Giriş
```bash
npx eas login
```

Expo hesap bilgilerinizi girin (hesabınız yoksa expo.dev'de oluşturun).

### Adım 4: Proje Yapılandırması
Projeyi EAS ile ilişkilendirin:
```bash
npx eas build:configure
```

Bu komut, `app.json` içindeki `projectId` alanını otomatik dolduracaktır.

### Adım 5: APK Oluşturma 🎯
```bash
npx eas build --profile preview --platform android
```

**Ne olacak?**
- EAS sunucuları APK'yı bulutta oluşturacak
- Build tamamlandığında size bir link verecek
- O linkten APK dosyasını indirebilirsiniz
- APK'yı herhangi bir Android cihaza kurabilirsiniz

**Süre:** İlk build ~5-10 dakika sürebilir.

**Ücretsiz Plan:** Ayda 30 build hakkınız vardır.

---

## 📦 Yöntem 2: Yerel Build (Android Studio Gerekli)

### Önkoşullar
- Android Studio kurulu olmalı
- Android SDK ve NDK yapılandırılmış olmalı
- Java JDK 17+ kurulu olmalı

### Adım 1: Android Klasörü Oluşturma
```bash
npx expo prebuild --platform android
```

### Adım 2: APK Oluşturma
```bash
cd android
./gradlew assembleRelease
```

APK konumu:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Not:** Bu yöntem daha karmaşıktır ve Android geliştirme ortamı gerektirir.

---

## 📦 Yöntem 3: Expo Go ile Test (APK Değil)

APK dosyası istemiyorsanız, sadece test için:

1. **Expo Go uygulamasını** Play Store'dan indirin
2. Projeyi başlatın:
   ```bash
   npm start
   ```
3. QR kodunu Expo Go ile tarayın
4. Uygulama telefonunuzda çalışacak

**Dezavantaj:** APK dosyası oluşturmaz, internet bağlantısı gerektirir.

---

## ✅ Önerilen Yöntem

**EAS Build (Yöntem 1)** en kolay ve en güvenilir yöntemdir çünkü:
- ✅ Android Studio kurulumu gerektirmez
- ✅ Karmaşık yapılandırma yok
- ✅ Bulut tabanlı, her ortamda çalışır
- ✅ APK direkt indirilir
- ✅ Ücretsiz plan yeterli

---

## 🔥 Hızlı Komutlar (EAS Build)

```bash
# 1. Login
npx eas login

# 2. Proje yapılandır (sadece ilk sefer)
npx eas build:configure

# 3. APK oluştur
npx eas build --profile preview --platform android

# 4. Build durumunu kontrol et
npx eas build:list
```

---

## 📥 APK Kurulumu

APK dosyasını indirdikten sonra:

1. APK'yı Android cihaza kopyalayın (USB, email, cloud vb.)
2. Cihazda **Ayarlar > Güvenlik > Bilinmeyen Kaynaklar** seçeneğini açın
3. APK dosyasına dokunun
4. "Kur" butonuna basın
5. Uygulama yüklenecektir!

---

## ❓ Sık Sorulan Sorular

### APK boyutu ne kadar olacak?
Yaklaşık 40-60 MB arası.

### Build süresi ne kadar?
İlk build: 5-10 dakika
Sonraki buildler: 3-5 dakika

### Ücretsiz mi?
Evet! Ayda 30 build ücretsiz.

### Play Store'a koyabilir miyim?
Bu APK debug/test içindir. Play Store için `production` profili kullanmalısınız:
```bash
npx eas build --profile production --platform android
```

---

## 🆘 Yardım

Sorun yaşarsanız:
- [EAS Build Dokümantasyonu](https://docs.expo.dev/build/introduction/)
- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow - expo tag](https://stackoverflow.com/questions/tagged/expo)

---

## 📝 Build Profilleri

`eas.json` dosyasında üç profil var:

- **development**: Geliştirme için (development client gerekir)
- **preview**: Test/Debug APK için (bu profili kullanın!)
- **production**: Play Store için AAB dosyası

---

**Başarılar! 🎉**

