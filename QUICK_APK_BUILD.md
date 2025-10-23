# 🚀 Hızlı APK Oluşturma - 3 Adım!

## ⚡ En Hızlı Yöntem (Önerilen)

### Adım 1️⃣: Expo Hesabı Oluştur
[expo.dev](https://expo.dev) adresinden ücretsiz hesap oluşturun.

### Adım 2️⃣: Terminal Komutları
```bash
# Expo'ya giriş yap
npx eas login

# Projeyi yapılandır (ilk sefer)
npm run build:configure

# APK oluştur! 🎉
npm run build:apk
```

### Adım 3️⃣: APK İndir ve Kur
- Build tamamlanınca terminal'de link görünecek
- Linke tıklayın ve APK'yı indirin
- APK'yı Android cihazınıza yükleyin

**Süre:** İlk build ~5-10 dakika

---

## 📱 APK'yı Cihaza Yükleme

### Yöntem 1: Direkt İndirme
1. APK linkini Android cihazda tarayıcıda açın
2. APK'yı indirin
3. Bildirimlerden APK'ya dokunun
4. "Kur" deyin (Bilinmeyen kaynaklar izni gerekebilir)

### Yöntem 2: USB ile
1. APK'yı bilgisayara indirin
2. USB ile cihazı bağlayın
3. APK'yı cihaza kopyalayın
4. Dosya yöneticisinden APK'ya dokunun
5. "Kur" deyin

### Yöntem 3: Email/Cloud
1. APK'yı kendinize email/WhatsApp/Drive ile gönderin
2. Cihazda açın ve indirin
3. "Kur" deyin

---

## ❓ Sorun mu Yaşıyorsunuz?

### "Unknown sources" hatası
**Çözüm:** Ayarlar > Güvenlik > Bilinmeyen Kaynaklara İzin Ver

### NPM cache hatası
```bash
sudo chown -R 501:20 "/Users/furkanakar/.npm"
```

### "Not logged in" hatası
```bash
npx eas login
```

### Build başarısız oluyor
Detaylı rehberi okuyun: `APK_BUILD_GUIDE.md`

---

## 📊 Build Durumunu Takip

```bash
# Build listesini gör
npm run build:status

# veya web'de
# https://expo.dev
```

---

## 🎯 Özet - Sadece 3 Komut!

```bash
npx eas login
npm run build:configure
npm run build:apk
```

**Hepsi bu kadar! 🎉**

APK linki build tamamlanınca terminalinizde görünecek.

---

## 💡 İpuçları

✅ Build sırasında bilgisayarınızı kapatabilirsiniz (cloud'da yapılıyor)
✅ Ücretsiz planda ayda 30 build hakkınız var
✅ İlk build uzun sürer, sonrakiler daha hızlı
✅ APK dosyası ~40-60 MB civarı
✅ Android 5.0+ tüm cihazlarda çalışır

---

## 🔗 Faydalı Linkler

- [EAS Build Dokümantasyonu](https://docs.expo.dev/build/introduction/)
- [Expo Dashboard](https://expo.dev)
- [Detaylı Rehber](./APK_BUILD_GUIDE.md)
- [Icon Oluşturma](./CREATE_ICONS.md)

---

**Başarılar! Sorularınız için GitHub Issues kullanabilirsiniz.** 🚀

