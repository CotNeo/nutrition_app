# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

## [1.7.1] - 2025-10-21

### 🔥 Kritik Özellik: Dinamik Kalori Hesaplama

#### ✅ Gramaja Göre Otomatik Hesaplama
- **Gerçek Zamanlı Güncelleme** - Porsiyon miktarını değiştirdiğinizde kalori ve makrolar anında güncellenir
- **100g/100ml Bazlı Hesaplama** - Tüm hesaplamalar standart 100 birim üzerinden yapılır
- **Akıllı Çarpan Sistemi** - `newSize / 100 * baseValue` formülü ile hassas hesaplama

#### ✅ Sıvı/Katı Uyumluluk Kontrolü
- **Sıvı Ürünler için ml Zorlaması** - Coca Cola gibi sıvı ürünler için gram seçerseniz uyarı
- **Katı Ürünler için gram Zorlaması** - Nutella gibi katı ürünler için ml seçerseniz uyarı
- **Akıllı Alert Sistemi** - "İptal" veya "Yine de Kullan" seçenekleri
- **isLiquid Flag** - Her ürün sıvı/katı olarak işaretlenir

#### ✅ Gelişmiş Food Type Sistemi
- **Base Nutrition Values** - Her ürün için 100g/100ml bazında değerler
  - `baseCalories` - 100 birim başına kalori
  - `baseProtein` - 100 birim başına protein
  - `baseCarbs` - 100 birim başına karbonhidrat
  - `baseFat` - 100 birim başına yağ
- **isLiquid Flag** - Sıvı/katı ayrımı için boolean
- **Dinamik Hesaplama** - Serving size değiştiğinde otomatik yeniden hesaplama

#### 🔧 Teknik Detaylar
- **calculateNutrition()** Fonksiyonu:
  ```typescript
  // Base values varsa (barkod scanner):
  multiplier = newServingSize / 100
  calories = baseCalories * multiplier
  
  // Base values yoksa (veritabanı):
  ratio = newServingSize / originalServingSize
  calories = calories * ratio
  ```
- **Real-time Recalculation** - TextInput onChange'de anında hesaplama
- **Console Logging** - Her hesaplama adımı loglanır

#### 📊 Örnek Senaryolar

**Senaryo 1: Barkod ile Coca Cola (330ml)**
```
1. Barkod okut: Coca Cola 330ml
2. Sistem hesaplar:
   - Base: 139 kcal / 100ml = 1.39 kcal/ml
   - 330ml: 139 * (330/100) = 458 kcal ✅
3. Manuel değiştir: 250ml
4. Otomatik güncellenir:
   - 250ml: 139 * (250/100) = 347 kcal ✅
```

**Senaryo 2: Barkod ile Nutella (400g)**
```
1. Barkod okut: Nutella 400g
2. Sistem hesaplar:
   - Base: 530 kcal / 100g = 5.3 kcal/g
   - 400g: 530 * (400/100) = 2120 kcal ✅
3. Manuel değiştir: 20g (1 kaşık)
4. Otomatik güncellenir:
   - 20g: 530 * (20/100) = 106 kcal ✅
```

**Senaryo 3: Yanlış Birim Seçimi**
```
1. Coca Cola seç (sıvı)
2. Birim: gram seç
3. Alert:
   ⚠️ "Coca-Cola sıvı bir üründür. 
      Gram yerine ml kullanmanız önerilir."
   [İptal] [Yine de Kullan]
```

#### 🎯 Çözülen Sorunlar
- ✅ Gramaj değiştirdiğimde kalori değişmiyordu → Düzeltildi
- ✅ Sıvı ürünler için gram parametresi kullanılıyordu → Engellendiş
- ✅ Katı ürünler için ml parametresi kullanılıyordu → Engellendi
- ✅ Manuel ekleme sırasında birim uyumsuzluğu → Kontrol eklendi

## [1.7.0] - 2025-10-21

### 📏 Akıllı Porsiyon Bilgisi

#### ✅ Otomatik Birim Algılama (Barkod Scanner)
- **Sıvı Ürünler** - Otomatik olarak ml/litre birimi algılanır
- **Katı Ürünler** - Gram/kg birimleri otomatik atanır
- **OpenFoodFacts Entegrasyonu** - serving_quantity ve serving_quantity_unit bilgileri alınır
- **Akıllı Parsing**:
  - `serving_size: "330 ml"` → 330 ml
  - `quantity: "1.5 l"` → 1.5 litre
  - Kategori bazlı sıvı tespiti (beverage, drink, juice, vs.)
  
#### ✅ Manuel Porsiyon Seçimi
- **6 Farklı Birim Seçeneği**:
  - ⚖️ Gram (g) - Ağırlık ölçüsü
  - 💧 Mililitre (ml) - Sıvı ölçüsü
  - 🔢 Adet - Sayısal ölçü
  - 🍽️ Porsiyon - Servis ölçüsü
  - 🥤 Bardak - Hacim ölçüsü
  - 🥄 Kaşık - Hacim ölçüsü
- **Görsel Birim Gösterimi** - Her birim için emoji ve açıklama
- **Anlık Önizleme** - Seçilen miktar ve birim canlı gösterilir

#### ✅ Gelişmiş Form UI
- **Porsiyon Bilgisi Bölümü** - Öğün Adı sonrasında eklendi
- **Miktar Girişi** - Numerik keyboard ile hızlı giriş
- **Birim Seçicisi** - 6 adet buton ile kolay seçim
- **Mevcut Porsiyon Göstergesi** - Seçilen miktar ve birim özeti

#### ✅ FoodSearchModal Geliştirmeleri
- **Birim Tipi Gösterimi** - 💧 Sıvı, ⚖️ Ağırlık, 🔢 Adet ipuçları
- **Akıllı Hint Sistemi** - Seçilen birime göre dinamik açıklamalar
- **Görsel İyileştirme** - Daha belirgin ve anlaşılır UI

#### 🔧 Teknik İyileştirmeler
- **BarcodeService**:
  - `normalizeServingUnit()` - Birim normalizasyonu (20+ birim desteği)
  - `isLiquidProduct()` - Kategori ve birim bazlı sıvı tespiti
  - Çoklu API field'ı kontrolü (serving_quantity, serving_size, quantity)
  - Gelişmiş console logging
- **MealAddScreen**:
  - `servingSize` ve `servingUnit` state'leri eklendi
  - `handleFoodSelect()` - Porsiyon bilgisi aktarımı
  - `handleReset()` - Porsiyon bilgisi reset'i
  - Yeni UI bölümleri ve stiller
- **Type Safety**:
  - Tüm birim dönüşümleri tip güvenli
  - Fallback değerler her aşamada mevcut

#### 📊 Desteklenen Birim Dönüşümleri
```
Sıvı: ml, l, litre, cl, milliliter, centiliter
Ağırlık: g, gram, gr, kg, kilogram, oz
Sayı: adet, piece, pcs, unit, portion, serving, porsiyon
Hacim: bardak, cup, kase, bowl, kaşık, tablespoon, tbsp
```

## [1.6.0] - 2025-10-21

### 🎯 Kullanıcı Deneyimi İyileştirmeleri

#### ✅ Akıllı Hedef Kilo Planlama
- **Hedef Kilo Girişi** - Kilo verme/alma hedefleri için zorunlu
- **4 Farklı Plan Seçeneği** - 3, 6, 9, 12 aylık planlar
- **Otomatik Sağlık Kontrolü** - Haftalık 0.25-1kg değişim sağlıklı kabul edilir
- **Plan Karşılaştırma**:
  - ✅ Sağlıklı planlar yeşil border ile vurgulanır
  - ⚠️ Çok hızlı planlar sarı border ile uyarılır
  - 🐢 Çok yavaş planlar işaretlenir
- **Detaylı Planlama**:
  - Haftalık kilo değişimi
  - Günlük kalori hedefi
  - Kalori farkı (açık/fazla)
  - Makro besin dağılımı (P/K/Y)
  - Tahmini bitiş tarihi
- **Akıllı Seçim** - Otomatik olarak en sağlıklı plan önerilir
- **Özel Kalori Hesaplama** - Seçilen plana göre kalori ayarlanır

#### ✅ Zorunlu Onboarding Akışı
- **Login Sonrası Hedef Belirleme** - İlk giriş yapan kullanıcılar zorunlu olarak hedef belirlemeli
- **3 Aşamalı Giriş Sistemi**:
  1. Authentication (Giriş/Kayıt)
  2. Hedef Belirleme (İsim, yaş, kilo, boy, cinsiyet, aktivite, hedef)
  3. Ana Uygulama (Öğün ekleme, takip, vb.)
- **Geri Dönüş Engelleme** - Hedef belirleme tamamlanmadan ana uygulamaya geçiş yok
- **Çıkış Seçeneği** - İlk kurulum sırasında çıkış yapma imkanı
- **Akıllı Yönlendirme** - Profil tamamsa direkt ana ekran, değilse hedef belirleme
- **Farklı Mesajlar** - İlk kurulum ve güncelleme için özel mesajlar
- **İsim Güncelleme** - Hedef belirleme ekranında isim de güncellenebilir

#### 🎯 Hassas Porsiyon Kontrolü

#### ✅ Eklenenler
- **Manuel Porsiyon Girişi** - TextInput ile hassas porsiyon değeri girişi
- **+/- Butonlar** - 0.1 hassasiyetinde artırma/azaltma
- **Genişletilmiş Hızlı Seçim** - 10 farklı seçenek (0.25x, 0.5x, 0.75x, 1x, 1.5x, 2x, 2.5x, 3x, 4x, 5x)
- **Türkçe Virgül Desteği** - Hem nokta (.) hem virgül (,) kullanımı
- **Akıllı Formatlama** - Gereksiz ondalık sıfırlar gösterilmiyor
- **ScrollView** - Tüm içerik kaydırılabilir, buton her zaman erişilebilir

#### 🎨 UI İyileştirmeleri
- Modern manuel giriş paneli (yeşil border ile vurgulu)
- Yuvarlak + / - butonlar
- Ortalanmış büyük sayı gösterimi
- "x porsiyon" etiketi
- "Hızlı Seçim" başlığı
- Responsive buton layout (10 buton düzgünce sığıyor)

#### 🔧 Teknik İyileştirmeler
- 0.1 hassasiyetinde hesaplama (Math.round ile)
- 0.1 - 10x arası porsiyon limiti
- Hata yakalama ve güvenli giriş
- Loading state yönetimi

#### 📊 Grafik & Raporlar Sistemi
- **StatsScreen** - Kapsamlı istatistik ve rapor ekranı
- **StatsService** - Haftalık/Aylık analiz servisi
- **WeightTrackingService** - Kilo geçmişi yönetimi
- **4 Farklı Grafik Türü**:
  - ⚖️ **Weight Line Chart** - Kilo değişim grafiği (zaman içinde ağırlık takibi)
  - 📈 **Calorie Line Chart** - Kalori trend grafiği (artış/azalış/stabil)
  - 📊 **Bar Chart** - Günlük kalori karşılaştırması (son 7 gün)
  - 🥗 **Pie Chart** - Makro besin dağılımı (P/K/Y yüzdeleri)
- **Haftalık & Aylık Raporlar**:
  - Toplam ve ortalama kalori
  - Toplam makro besinler
  - Takip edilen gün sayısı
  - Toplam öğün sayısı
- **Öğün Dağılımı** - Kahvaltı/Öğle/Akşam/Atıştırma analizi
- **Trend Analizi** - Kalori alımı artış/azalış tespiti
- **Zaman Periyodu Seçimi** - 7 gün veya 30 gün görünümü
- **Pull-to-Refresh** - Grafikleri yenileme
- **Empty State** - Veri yoksa yönlendirme
- **Kilo Takip Sistemi**:
  - **Otomatik İlk Kilo Kaydı** - Hedef belirlerken girilen kilo otomatik kaydedilir
  - Kilo girişi modal'ı
  - Kilo değişim grafiği (Line Chart)
  - Mevcut/Başlangıç/Hedef kilo gösterimi
  - Toplam kilo değişimi (+/- kg)
  - Otomatik profil güncelleme
  - Tarih bazlı kilo geçmişi
  - Akıllı placeholder (başlangıç kilosu otomatik gösterilir)

#### 📷 Barcode Scanner Sistemi
- **BarcodeScanner Component** - Kamera ile barkod okuma
- **BarcodeService** - OpenFoodFacts API entegrasyonu
- **Kamera İzni Yönetimi** - Otomatik izin talebi ve hata yönetimi
- **Canlı Barkod Okuma**:
  - EAN-13, EAN-8, UPC-A, UPC-E, Code128, Code39 desteği
  - Gerçek zamanlı barkod algılama
  - Görsel tarama çerçevesi
  - Otomatik ürün bilgisi çekme
- **OpenFoodFacts API Entegrasyonu**:
  - 2M+ ürün veritabanı
  - Türkçe ürün isimleri
  - Otomatik kategori tespiti
  - Besin değerleri (100g bazlı)
- **MealAddScreen Entegrasyonu**:
  - Hızlı ekleme bölümü (2 kart)
  - Barkod Okut & Veritabanı yan yana
  - Ürün bulundu → Otomatik form doldurma
  - Ürün bulunamadı → Manuel ekleme seçeneği
- **Akıllı İş Akışı**:
  - Barkod okut → Ürün ara → Form doldur → Kaydet
  - Hata durumunda kullanıcıyı yönlendir

#### 📚 Yeni Kütüphaneler
- `react-native-chart-kit` - Grafik çizimi
- `react-native-svg` - SVG desteği (chart-kit dependency)
- `expo-camera` - Kamera ve barkod okuma (Expo SDK 54 uyumlu)

---

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

