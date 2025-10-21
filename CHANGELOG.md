# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

## [1.5.0] - 2025-10-21

### 🎉 Öğün Yönetimi Sistemi

#### ✅ Eklenenler

##### Öğün Ekleme
- **MealAddScreen** - Modern öğün ekleme ekranı
- Manuel besin girişi (isim, kalori, makrolar)
- Öğün tipi seçimi (Kahvaltı, Öğle, Akşam, Atıştırmalık)
- Form validasyonu ve error handling
- Tarih seçimi desteği

##### Besin Veritabanı
- **FoodDatabase** - 60+ Türk mutfağı besini
- Gerçekçi porsiyon miktarları (adet, dilim, bardak, kase, porsiyon)
- 9 farklı kategori:
  - Yemekler (Kuru fasulye, Mercimek çorbası, Kebaplar)
  - Protein (Tavuk, Balık, Yumurta)
  - Karbonhidratlar (Pilav, Ekmek, Makarna)
  - Meyveler (Elma, Muz, Portakal)
  - Sebzeler (Domates, Salatalık, Brokoli)
  - Atıştırmalıklar (Kuruyemişler)
  - İçecekler (Süt, Ayran, Çay)
  - Süt Ürünleri (Peynir, Yoğurt)
  - Tatlılar (Baklava, Sütlaç)

##### Besin Arama & Filtreleme
- **FoodSearchModal** - Full-screen modal arama ekranı
- Gerçek zamanlı arama (as-you-type)
- Kategori filtreleme (9 chip ile)
- Emoji desteği
- Detaylı besin bilgileri (Kalori + Makrolar)

##### Porsiyon Ayarlama
- 0.5x - 3x arası porsiyon seçimi
- Hızlı seçim butonları (0.5x, 1x, 1.5x, 2x, 2.5x, 3x)
- Canlı besin değeri hesaplama
- Görsel porsiyon önizleme
- Konfirmasyonlu ekleme

##### Son Kullanılanlar & Favoriler
- **FoodHistoryService** - Besin geçmişi yönetimi
- Son 20 kullanılan besin takibi
- Favori besinler sistemi
- Hızlı erişim kartları (horizontal scroll)
- Yıldız ile favorilere ekleme/çıkarma

##### Öğün Geçmişi
- **MealHistoryScreen** - Tüm öğünleri görüntüleme
- Tarihe göre gruplama
- Günlük toplam kalori gösterimi
- Swipe/long press ile silme
- Pull-to-refresh desteği
- Öğün detayları (Tüm makrolar)

#### 🎨 UI/UX İyileştirmeleri
- Modern modal tasarımı
- Smooth animasyonlar
- Loading states
- Empty states
- Error handling
- Success feedbacks

#### 🏗️ Teknik İyileştirmeler
- Food interface tanımı
- Tutarlı servingSize sistemi (tüm birimler = 1)
- Logger entegrasyonu
- Storage key yönetimi
- TypeScript strict typing

#### 📚 Dokümantasyon
- README.md güncellendi
- Yeni özellikler eklendi
- Proje yapısı güncellendi

---

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

### 🔄 Planlanıyor (v1.6)
- Grafik ve raporlar
- İstatistikler sayfası
- Haftalık/Aylık özet
- Besin detay sayfası

### 🚀 Gelecek (v2.0)
- Barcode scanner
- Kullanıcının kendi besinlerini eklemesi
- API entegrasyonu (Edamam, USDA)
- Cloud synchronization
- Social features
- Dark mode
- Multi-language support
- Push notifications

---

**Geliştirici:** CotNeo  
**Repository:** https://github.com/CotNeo/nutrition_app.git  
**İlk Yayın:** 20 Ekim 2025  
**Son Güncelleme:** 21 Ekim 2025

