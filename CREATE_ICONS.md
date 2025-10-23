# 🎨 Icon ve Splash Screen Oluşturma

APK oluşturmak için ikon ve splash screen dosyaları gerekiyor.

## Hızlı Çözüm 1: Online Araçlar

### 1. Icon Oluşturma
**Önerilen Boyutlar:**
- `icon.png`: 1024x1024 px
- `adaptive-icon.png`: 1024x1024 px
- `splash.png`: 1242x2436 px

**Ücretsiz Araçlar:**
- [IconKitchen](https://icon.kitchen/) - En kolay, otomatik oluşturur
- [AppIcon.co](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)

### 2. IconKitchen Kullanımı (Önerilen)
1. [icon.kitchen](https://icon.kitchen/) adresine gidin
2. Logo/ikon yükleyin veya metin girin
3. "Download" butonuna basın
4. Expo seçeneğini seçin
5. İnen dosyaları `assets/` klasörüne kopyalayın

---

## Hızlı Çözüm 2: Basit Renkli Icon (Geçici)

Eğer hızlıca test APK'sı oluşturmak istiyorsanız:

### Canva veya Photoshop ile:
1. 1024x1024 boyutunda yeşil (#4CAF50) arka plan
2. Ortaya beyaz "N" harfi ekleyin
3. `icon.png` olarak kaydedin
4. Aynı dosyayı `adaptive-icon.png` olarak da kaydedin

### Splash Screen:
1. 1242x2436 boyutunda yeşil (#4CAF50) arka plan
2. Ortaya uygulamanın adını yazın
3. `splash.png` olarak kaydedin

---

## Dosyaları Nereye Koymalı?

```
nutrition_app/
  └── assets/
      ├── icon.png          (1024x1024)
      ├── adaptive-icon.png (1024x1024)
      └── splash.png        (1242x2436)
```

---

## 🚀 Icon Olmadan Build Alabilir miyim?

**EVET!** Geçici olarak `app.json`'dan icon referanslarını kaldırabilirsiniz:

```json
{
  "expo": {
    "name": "Nutrition App",
    "slug": "nutrition-app",
    "version": "1.7.1",
    // icon ve splash satırlarını silin
    ...
  }
}
```

Expo default iconları kullanacaktır. Test için yeterlidir!

---

## En Hızlı Yöntem 🏃

1. `app.json` dosyasından şu satırları **geçici olarak silin**:
   ```json
   "icon": "./assets/icon.png",
   ```
   ve splash kısmındaki:
   ```json
   "image": "./assets/splash.png",
   ```

2. Build alın:
   ```bash
   npm run build:apk
   ```

3. Daha sonra icon eklersiniz!

---

**Not:** Test APK'sı için icon şart değildir. Production'a geçerken profesyonel iconlar ekleyin.

