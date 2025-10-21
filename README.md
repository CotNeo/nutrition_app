# 🥗 Nutrition App

Modern React Native uygulaması ile günlük beslenmenizi takip edin, hedeflerinize ulaşın!

[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0.0-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)

## 📱 Ekran Görüntüleri

```
🔐 Auth Screen        📊 Dashboard           🎯 Goal Setup        🍽️ Meal Add
┌──────────────┐     ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ Google ile   │     │ 🔥 7 Gün     │      │ Hedeflerini  │     │ Besin Ara    │
│ Apple ile    │     │ Takvim       │      │ Belirle      │     │ Porsiyon     │
│ Email ile    │     │ Progress     │      │ BMR & TDEE   │     │ Favoriler    │
└──────────────┘     └──────────────┘      └──────────────┘     └──────────────┘
```

## ✨ Özellikler

### 🔐 Authentication
- ✅ **Google ile giriş** (Official brand guideline)
- ✅ **Apple ile giriş** (Official HIG)
- ✅ **Email/Şifre ile giriş**
- ✅ **Kayıt sistemi**
- ✅ **Session yönetimi**

### 📊 Dashboard
- ✅ **Haftalık takvim** - Swipe ve select
- ✅ **Streak sistemi** - Günlük seri takibi
- ✅ **Animasyonlu progress bar'lar**
- ✅ **Kişiselleştirilmiş hedefler**
- ✅ **Pull-to-refresh**
- ✅ **Gerçek zamanlı güncellemeler**

### 🍽️ Öğün Yönetimi
- ✅ **Öğün ekleme** - Manuel veya veritabanından
- ✅ **60+ Türk mutfağı besini** - Gerçekçi porsiyonlarla
- ✅ **Akıllı arama** - İsme göre anlık filtreleme
- ✅ **Kategori filtreleme** - 9 farklı kategori
- ✅ **Porsiyon ayarlama** - 0.5x - 3x arası seçim
- ✅ **Son kullanılanlar** - Hızlı erişim
- ✅ **Favori besinler** - Sık kullanılan besinleri kaydet
- ✅ **Öğün geçmişi** - Tarihe göre gruplama ve silme

### 🎯 Kalori Hesaplama
- ✅ **BMR** hesaplama (Mifflin-St Jeor)
- ✅ **TDEE** hesaplama
- ✅ **4 farklı hedef**:
  - 🔻 Kilo Vermek (-500 kcal/gün)
  - ⚖️ Kilomu Korumak
  - 🔺 Kilo Almak (+300 kcal/gün)
  - 💪 Kas Kazanmak (+500 kcal/gün)
- ✅ **Makro besin dağılımı** (Protein, Karb, Yağ)

### 🎨 Modern UI/UX
- ✅ **Tailwind-inspired color palette**
- ✅ **Smooth animations**
- ✅ **Official brand buttons**
- ✅ **Professional typography**
- ✅ **Responsive design**

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 16+
- npm veya yarn
- Expo CLI
- iOS Simulator / Android Emulator veya Expo Go app

### Kurulum

```bash
# Projeyi klonla
git clone https://github.com/CotNeo/nutrition_app.git
cd nutrition_app

# Bağımlılıkları yükle
npm install --legacy-peer-deps

# Uygulamayı başlat
npx expo start
```

### Platform Seçenekleri

```bash
# Android
npm run android

# iOS  
npm run ios

# Web
npm run web

# Development
npm start
```

## 📁 Proje Yapısı

```
nutrition_app/
├── src/
│   ├── components/       # UI bileşenleri
│   │   ├── Button.tsx
│   │   ├── SocialButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── StreakCard.tsx
│   │   ├── WeeklyCalendar.tsx
│   │   └── FoodSearchModal.tsx
│   ├── screens/          # Ekranlar
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── GoalSetupScreen.tsx
│   │   ├── MealAddScreen.tsx
│   │   └── MealHistoryScreen.tsx
│   ├── services/         # İş mantığı
│   │   ├── authService.ts
│   │   ├── nutritionService.ts
│   │   ├── calorieCalculator.ts
│   │   ├── streakService.ts
│   │   ├── foodDatabase.ts
│   │   └── foodHistoryService.ts
│   ├── contexts/         # React Context
│   │   └── AuthContext.tsx
│   ├── utils/            # Yardımcı araçlar
│   │   ├── logger.ts
│   │   └── storage.ts
│   ├── styles/           # Stil sistemi
│   │   └── colors.ts
│   ├── types/            # TypeScript tipleri
│   │   └── index.ts
│   └── hooks/            # Custom hooks
│       └── index.ts
├── App.tsx               # Ana uygulama
├── app.json             # Expo config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies
```

## 🎯 Teknoloji Stack'i

| Kategori | Teknoloji |
|----------|-----------|
| Framework | React Native 0.74.5 |
| Platform | Expo SDK 51.0.0 |
| Language | TypeScript 5.9.2 |
| Navigation | React Navigation 6.x |
| Storage | AsyncStorage 1.23.1 |
| State | React Context API |
| Styling | StyleSheet + Custom System |

## 🎨 Design System

### Renk Paleti

```typescript
Primary:   #10B981  // Emerald Green
Secondary: #3B82F6  // Blue
Orange:    #F59E0B  // Amber
Purple:    #8B5CF6  // Violet
Error:     #EF4444  // Red
```

### Typography

```
Headings:   font-weight: 800, letter-spacing: -1px
Body:       font-weight: 600-700
Buttons:    font-weight: 700-800
```

## 📖 Dokümantasyon

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Başlangıç rehberi
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Proje mimarisi
- **[AUTH_SYSTEM_GUIDE.md](AUTH_SYSTEM_GUIDE.md)** - Auth sistemi
- **[KURULUM_TAMAMLANDI.md](KURULUM_TAMAMLANDI.md)** - Kurulum özeti

## 🧪 Test

```bash
# ESLint
npm run lint

# TypeScript check
npx tsc --noEmit
```

## 📊 Özellik Roadmap

### ✅ Tamamlandı (v1.5)
- [x] Authentication sistemi
- [x] Modern dashboard
- [x] Kalori hesaplama
- [x] Streak sistemi
- [x] Haftalık takvim
- [x] Progress tracking
- [x] **Öğün ekleme ekranı** 🆕
- [x] **Besin veritabanı (60+ besin)** 🆕
- [x] **Besin arama ve filtreleme** 🆕
- [x] **Porsiyon ayarlama** 🆕
- [x] **Son kullanılanlar & Favoriler** 🆕
- [x] **Öğün geçmişi** 🆕

### 🔄 Devam Eden
- [ ] Grafik ve raporlar
- [ ] İstatistikler sayfası
- [ ] Haftalık/Aylık özet

### 🚀 Gelecek
- [ ] Barcode scanner
- [ ] Cloud sync
- [ ] Kullanıcının kendi besinlerini eklemesi
- [ ] API entegrasyonu (Edamam, USDA)
- [ ] Social sharing
- [ ] Dark mode
- [ ] Multi-language

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

### Coding Standards

- SOLID principles
- JSDoc comments
- Logger kullanımı
- TypeScript strict mode
- Detaylar için `rules.md` dosyasına bakın

## 👨‍💻 Geliştirici

**CotNeo**
- GitHub: [@CotNeo](https://github.com/CotNeo)
- Repository: [nutrition_app](https://github.com/CotNeo/nutrition_app.git)

## 📄 Lisans

ISC License - Detaylar için LICENSE dosyasına bakın.

## 🙏 Teşekkürler

- React Native Community
- Expo Team
- TypeScript Team
- Tüm open source katkıda bulunanlara

## 📞 İletişim

Sorularınız için:
- Issue açın: [GitHub Issues](https://github.com/CotNeo/nutrition_app/issues)
- Discussions: [GitHub Discussions](https://github.com/CotNeo/nutrition_app/discussions)

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

**Made with ❤️ by CotNeo**
