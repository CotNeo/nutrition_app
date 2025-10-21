# 📏 Akıllı Porsiyon Bilgisi Rehberi

## 🎯 Özellik Özeti

Nutrition App artık **akıllı porsiyon birimi** sistemi ile daha doğru ve kullanıcı dostu besin takibi sunuyor!

---

## ✨ Yeni Özellikler

### 1️⃣ **Otomatik Birim Algılama (Barkod Scanner)**

Barkod okuttuğunuzda sistem otomatik olarak doğru birimi seçer:

```
📷 Coca Cola 330ml okuttunuz
   ↓
✅ Otomatik olarak: 330 ml olarak kaydedilir

📷 Nutella 400g okuttunuz
   ↓
✅ Otomatik olarak: 400 gram olarak kaydedilir
```

**Nasıl Çalışır?**
- OpenFoodFacts API'den `serving_quantity` ve `serving_quantity_unit` bilgileri alınır
- Ürün kategorisi kontrol edilir (beverage → sıvı)
- Birim otomatik normalize edilir (g → gram, ml → ml)

---

### 2️⃣ **6 Farklı Birim Seçeneği**

Manuel ekleme yaparken 6 farklı birim arasından seçim yapabilirsiniz:

| Emoji | Birim | Açıklama | Örnek Kullanım |
|-------|-------|----------|----------------|
| ⚖️ | Gram (g) | Ağırlık ölçüsü | Tavuk göğsü: 150 gram |
| 💧 | Mililitre (ml) | Sıvı ölçüsü | Su: 250 ml |
| 🔢 | Adet | Sayısal ölçü | Yumurta: 2 adet |
| 🍽️ | Porsiyon | Servis ölçüsü | Pilav: 1 porsiyon |
| 🥤 | Bardak | Hacim ölçüsü | Süt: 1 bardak |
| 🥄 | Kaşık | Hacim ölçüsü | Zeytinyağı: 2 kaşık |

---

### 3️⃣ **Görsel ve Anlaşılır UI**

#### Porsiyon Bilgisi Bölümü
```
┌─────────────────────────────────────┐
│ 📏 Porsiyon Bilgisi                 │
│ Tükettiğiniz miktarı belirtin       │
│                                     │
│ Miktar: [_330_]                     │
│                                     │
│ Birim:                              │
│ [⚖️ gram]  [💧 ml]  [🔢 adet]       │
│ [🍽️ porsiyon]  [🥤 bardak]  [🥄 kaşık]│
│                                     │
│ ┌───────────────────────────────┐  │
│ │     330 ml                     │  │
│ │     💧 Mililitre (ml)          │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### FoodSearchModal'da Birim Gösterimi
```
┌─────────────────────────────────────┐
│ Seçilen Miktar                      │
│                                     │
│      330.0 ml                       │
│      💧 Sıvı ölçüsü                 │
└─────────────────────────────────────┘
```

---

## 🔧 Teknik Detaylar

### BarcodeService Güncellemeleri

#### 1. `normalizeServingUnit(unit: string)`
20+ farklı birim formatını standart birime dönüştürür:

```typescript
'ml', 'milliliter', 'millilitre' → 'ml'
'g', 'gram', 'gramme', 'gr' → 'gram'
'l', 'liter', 'litre' → 'litre'
'piece', 'pcs', 'unit' → 'adet'
'cup' → 'bardak'
'tablespoon', 'tbsp' → 'kaşık'
```

#### 2. `isLiquidProduct(product, unit)`
Kategori ve birim kontrolü ile sıvı ürün tespiti:

```typescript
Kategori kontrolü:
- beverage, drink, juice, soda, water, milk, beer, wine

Birim kontrolü:
- ml, l, litre, cl
```

#### 3. Çoklu API Field Kontrolü
```typescript
1. serving_quantity + serving_quantity_unit
2. serving_size (örn: "330 ml")
3. quantity (örn: "1.5 l")
4. Fallback: 100 gram
```

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Barkod ile Ekleme (Sıvı)
```
1. 📷 Coca Cola kutu barkodunu okutun
2. ✅ Sistem otomatik algılar:
   - İsim: Coca-Cola
   - Miktar: 330 ml
   - Kalori: 139 kcal
3. ✅ Form otomatik doldurulur
4. 💾 Kaydedin
```

### Senaryo 2: Barkod ile Ekleme (Katı)
```
1. 📷 Nutella barkodunu okutun
2. ✅ Sistem otomatik algılar:
   - İsim: Nutella
   - Miktar: 400 gram
   - Kalori: 2120 kcal (400g için)
3. 🔧 İsterseniz miktarı değiştirin: 20 gram
4. 💾 Kaydedin
```

### Senaryo 3: Manuel Ekleme
```
1. ✏️ "Manuel Gir" seçin
2. 📝 Öğün Adı: Zeytinyağı
3. 📏 Porsiyon Bilgisi:
   - Miktar: 2
   - Birim: 🥄 Kaşık
4. 🔥 Kalori: 180 kcal (2 kaşık için)
5. 💾 Kaydedin
```

### Senaryo 4: Veritabanından Ekleme
```
1. 🔍 "Veritabanı" seçin
2. 🍚 "Pilav" arayın ve seçin
3. 📏 Porsiyon: 1.5x seçin
4. ✅ Sistem hesaplar:
   - 1 porsiyon: 200 gram, 250 kcal
   - 1.5 porsiyon: 300 gram, 375 kcal
5. 💾 Kaydedin
```

---

## 📊 Desteklenen Birim Dönüşümleri

### Sıvı Birimleri
```
ml, milliliter, millilitre → ml
l, liter, litre → litre
cl, centiliter → cl
```

### Ağırlık Birimleri
```
g, gram, gramme, gr → gram
kg, kilogram → kg
oz → oz
```

### Sayısal Birimler
```
adet, piece, pcs, unit → adet
portion, serving, servis, porsiyon → porsiyon
```

### Hacim Birimleri
```
bardak, cup → bardak
kase, bowl → kase
kaşık, tablespoon, tbsp → kaşık
```

---

## 🧪 Test Önerileri

### Test 1: Coca Cola (Sıvı)
```
Beklenen:
- Miktar: 330
- Birim: ml
- Kategori: beverage
```

### Test 2: Nutella (Katı)
```
Beklenen:
- Miktar: 400
- Birim: gram
- Kategori: dessert
```

### Test 3: Manuel Süt Ekleme
```
Adımlar:
1. Manuel ekle
2. İsim: Süt
3. Miktar: 1
4. Birim: 🥤 Bardak
5. Kalori: 150 kcal
```

### Test 4: Veritabanından Yumurta
```
Adımlar:
1. Veritabanı > Yumurta
2. Porsiyon: 2x
3. Birim otomatik: adet
4. 2 yumurta = 140 kcal
```

---

## 🎨 UI/UX İyileştirmeleri

### Görsel Hiyerarşi
```
1. Section Title: "📏 Porsiyon Bilgisi"
2. Subtitle: "Tükettiğiniz miktarı belirtin"
3. Input: Numeric keyboard
4. Buttons: 6 birim seçeneği (emoji + label)
5. Display: Seçilen miktar özeti
```

### Renk Kodları
```
Active Unit: Primary green (#4CAF50)
Inactive Unit: Gray (#E5E7EB)
Display Background: Light blue (#EFF6FF)
Display Text: Dark blue (#1E40AF)
```

### Animasyonlar
```
✅ Birim seçimi: Border renk değişimi
✅ Display: Anlık güncelleme
✅ Keyboard: Numeric only (sayısal giriş)
```

---

## 🚀 Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] Birim dönüşümü (ml ↔ bardak, gram ↔ kaşık)
- [ ] Özel birim tanımlama (kullanıcı tanımlı)
- [ ] Birim geçmişi (en çok kullanılan birimler)
- [ ] Birim önerileri (ürün tipine göre)

### API İyileştirmeleri
- [ ] Türk ürünleri için özel veritabanı
- [ ] Off-line mod için lokal cache
- [ ] Birim dönüşüm tablosu

---

## 💡 İpuçları

### Sıvı Ürünler İçin
```
✅ ml kullanın (standart)
✅ Bardak kullanın (1 bardak ≈ 250 ml)
❌ Gram kullanmayın (yanlış birim)
```

### Katı Ürünler İçin
```
✅ Gram kullanın (standart)
✅ Porsiyon kullanın (tanımlıysa)
❌ ml kullanmayın (yanlış birim)
```

### Genel Öneriler
```
✅ Barkod okutmada otomatik birime güvenin
✅ Manuel eklemede ürüne uygun birim seçin
✅ Porsiyon miktarını kontrol edin
✅ Besin değerlerini doğrulayın
```

---

## 📚 Referanslar

### OpenFoodFacts API
- [API Documentation](https://world.openfoodfacts.org/data)
- [Product Fields](https://world.openfoodfacts.org/data/data-fields.txt)

### Standart Birimler
- 1 bardak = 250 ml
- 1 kaşık (yemek kaşığı) = 15 ml
- 1 porsiyon = Ürüne göre değişir

---

## 🎉 Özet

**Nutrition App v1.7.0** ile:
- ✅ Barkod okutma daha akıllı
- ✅ Birim seçimi daha kolay
- ✅ UI daha görsel ve anlaşılır
- ✅ Takip daha doğru

**Test edin ve geri bildirim verin!** 🚀

