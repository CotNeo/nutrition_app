# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

## [1.0.0] - 2025-10-20

### 🎉 İlk Sürüm

#### ✅ Eklenenler

##### Authentication
- Google ile giriş (Official brand guideline)
- Apple ile giriş (Official Apple HIG)
- Email/şifre ile giriş ve kayıt
- Session yönetimi
- Auth Context ve global state

##### Dashboard & UI
- Modern, responsive dashboard
- Haftalık takvim (swipe & select)
- Dinamik streak sistemi
- Animasyonlu progress bar'lar
- Pull-to-refresh
- Fade-in animasyonlar
- Stat cards

##### Kalori & Hedef Sistemi
- BMR hesaplama (Mifflin-St Jeor)
- TDEE hesaplama
- 4 farklı hedef tipi:
  - Kilo verme
  - Kilo alma
  - Koruma
  - Kas kazanma
- Kişiselleştirilmiş makro hesaplama
- Profil ve hedef ayarlama ekranı

##### Services
- AuthService - Kullanıcı yönetimi
- NutritionService - Beslenme verileri
- CalorieCalculator - Kalori hesaplamaları
- StreakService - Seri takibi
- StorageService - Local storage wrapper
- Logger - Debug ve loglama

##### Components
- Button (3 variant)
- SocialButton (Google & Apple)
- ProgressBar (Animated)
- StatCard
- StreakCard (Animated)
- WeeklyCalendar

##### Design System
- Tailwind-inspired color palette
- Modern typography system
- Consistent spacing
- Professional shadows
- Colors.ts - Central color management

#### 🎨 Tasarım
- Modern emerald green (#10B981) primary color
- Professional typography (800 weight, tight spacing)
- Smooth animations
- Official brand guidelines for social buttons
- Responsive layout

#### 🏗️ Mimari
- SOLID principles
- Modular architecture
- TypeScript strict mode
- Clean code standards
- Comprehensive JSDoc comments
- Centralized logging

#### 📚 Dokümantasyon
- README.md - Ana dokümantasyon
- GETTING_STARTED.md - Başlangıç rehberi
- PROJECT_STRUCTURE.md - Mimari dokümantasyon
- AUTH_SYSTEM_GUIDE.md - Auth sistemi rehberi
- KURULUM_TAMAMLANDI.md - Kurulum özeti
- CHANGELOG.md - Değişiklik geçmişi

---

## [Yakında]

### 🔄 Planlanıyor (v1.1)
- Öğün ekleme ekranı
- Besin veritabanı
- Öğün geçmişi görüntüleme
- Grafik ve raporlar

### 🚀 Gelecek (v2.0)
- Barcode scanner
- Cloud synchronization
- Social features
- Dark mode
- Multi-language support
- Push notifications

---

**Geliştirici:** CotNeo  
**Repository:** https://github.com/CotNeo/nutrition_app.git  
**İlk Yayın:** 20 Ekim 2025

