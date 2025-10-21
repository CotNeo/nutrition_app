# 🔥 Dinamik Kalori Hesaplama Sistemi

## 📋 İçindekiler
1. [Sorun Neydi?](#sorun-neydi)
2. [Çözüm](#çözüm)
3. [Nasıl Çalışır?](#nasıl-çalışır)
4. [Test Senaryoları](#test-senaryoları)
5. [Teknik Detaylar](#teknik-detaylar)

---

## ❌ Sorun Neydi?

### Problem 1: Gramaj Değişmiyor
```
❌ ÖNCEDEN:
1. Nutella barkod okut → 400g, 2120 kcal
2. Manuel değiştir → 20g
3. Kalori hala 2120 kcal 😞
```

### Problem 2: Yanlış Birim Kullanımı
```
❌ ÖNCEDEN:
1. Coca Cola (sıvı) → gram ile ölçüldü
2. Nutella (katı) → ml ile ölçüldü
3. Yanlış hesaplamalar 😞
```

---

## ✅ Çözüm

### Özellik 1: Gerçek Zamanlı Hesaplama
```
✅ SONRADAN:
1. Nutella barkod okut → 400g, 2120 kcal
2. Manuel değiştir → 20g
3. Kalori otomatik → 106 kcal 🎉
```

### Özellik 2: Akıllı Birim Kontrolü
```
✅ SONRADAN:
1. Coca Cola (sıvı) → gram seçince ⚠️ Uyarı
2. Nutella (katı) → ml seçince ⚠️ Uyarı
3. Doğru birim kullanımı 🎉
```

---

## 🔄 Nasıl Çalışır?

### Adım 1: Barkod Okutma
```typescript
// OpenFoodFacts API'den veri
{
  "product": {
    "nutriments": {
      "energy-kcal_100g": 530,  // 100g için
      "proteins_100g": 6,
      "carbohydrates_100g": 57,
      "fat_100g": 30
    },
    "serving_quantity": 400,
    "serving_quantity_unit": "g"
  }
}

// Sistem kaydeder:
baseCalories = 530  // per 100g
servingSize = 400
servingUnit = "gram"
isLiquid = false

// Hesaplar:
multiplier = 400 / 100 = 4
calories = 530 * 4 = 2120 kcal ✅
```

### Adım 2: Manuel Değiştirme
```typescript
// Kullanıcı miktarı değiştirdi: 20g

onChangeText={(value) => {
  setServingSize(value);  // "20"
  
  if (selectedFood) {
    const newSize = 20;
    const nutrition = calculateNutrition(selectedFood, newSize);
    // nutrition = {
    //   calories: 530 * (20/100) = 106
    //   protein: 6 * (20/100) = 1.2 → 1
    //   carbs: 57 * (20/100) = 11.4 → 11
    //   fat: 30 * (20/100) = 6
    // }
    
    setCalories("106");  // Otomatik güncelleme ✅
  }
}}
```

### Adım 3: Birim Kontrolü
```typescript
// Kullanıcı ml seçti ama ürün katı

onPress={() => {
  if (selectedFood.isLiquid === false && unit.id === 'ml') {
    Alert.alert(
      '⚠️ Uyarı',
      'Nutella katı bir üründür. ml yerine gram kullanmanız önerilir.',
      [
        { text: 'İptal' },  // ml seçilmez
        { text: 'Yine de Kullan' }  // ml seçilir (kullanıcı isterse)
      ]
    );
  }
}}
```

---

## 🧪 Test Senaryoları

### Test 1: Coca Cola (Sıvı)
```
1. Öğün Ekle → Barkod Okut
2. Coca Cola 330ml barkodunu okut

✅ Beklenen:
- İsim: Coca-Cola
- Miktar: 330
- Birim: ml (otomatik)
- Kalori: ~139 kcal (OpenFoodFacts'e göre)
- isLiquid: true

3. Manuel değiştir: 250ml

✅ Beklenen:
- Miktar: 250
- Kalori: 139 * (250/330) ≈ 105 kcal (otomatik güncellendi)

4. Birim: gram seç

✅ Beklenen:
- Alert: "Coca-Cola sıvı bir üründür..."
- İptal → ml kalır
- Yine de Kullan → gram seçilir
```

### Test 2: Nutella (Katı)
```
1. Öğün Ekle → Barkod Okut
2. Nutella barkodunu okut

✅ Beklenen:
- İsim: Nutella
- Miktar: 400 (veya paket boyutuna göre)
- Birim: gram (otomatik)
- Kalori: ~530 * (400/100) = 2120 kcal
- isLiquid: false

3. Manuel değiştir: 20g (1 kaşık)

✅ Beklenen:
- Miktar: 20
- Kalori: 530 * (20/100) = 106 kcal (otomatik güncellendi)
- Protein: 6 * 0.2 = 1g
- Carbs: 57 * 0.2 = 11g
- Fat: 30 * 0.2 = 6g

4. Birim: ml seç

✅ Beklenen:
- Alert: "Nutella katı bir üründür..."
- İptal → gram kalır
- Yine de Kullan → ml seçilir
```

### Test 3: Veritabanından Süt
```
1. Öğün Ekle → Veritabanı
2. "Süt" ara ve seç
3. Porsiyon: 1x (200ml)

✅ Beklenen:
- İsim: Süt
- Miktar: 200
- Birim: ml
- Kalori: 122 kcal

4. Manuel değiştir: 100ml

⚠️ DİKKAT: Veritabanındaki süt için base values yok!
- Ratio hesaplama: 100/200 = 0.5
- Kalori: 122 * 0.5 = 61 kcal ✅
```

---

## 🔧 Teknik Detaylar

### Food Type Güncellemesi
```typescript
export interface Food {
  // ... mevcut alanlar ...
  
  // Yeni alanlar:
  baseCalories?: number;   // per 100g/100ml
  baseProtein?: number;    // per 100g/100ml
  baseCarbs?: number;      // per 100g/100ml
  baseFat?: number;        // per 100g/100ml
  isLiquid?: boolean;      // true = ml, false = gram
}
```

### calculateNutrition() Fonksiyonu
```typescript
const calculateNutrition = (
  food: Food, 
  newServingSize: number
): { calories, protein, carbs, fat } => {
  
  // Yöntem 1: Base values varsa (barkod scanner)
  if (food.baseCalories !== undefined) {
    const multiplier = newServingSize / 100;
    return {
      calories: Math.round(food.baseCalories * multiplier),
      protein: Math.round(food.baseProtein * multiplier),
      carbs: Math.round(food.baseCarbs * multiplier),
      fat: Math.round(food.baseFat * multiplier),
    };
  }
  
  // Yöntem 2: Base values yoksa (veritabanı)
  const ratio = newServingSize / food.servingSize;
  return {
    calories: Math.round(food.calories * ratio),
    protein: Math.round(food.protein * ratio),
    carbs: Math.round(food.carbs * ratio),
    fat: Math.round(food.fat * ratio),
  };
};
```

### Serving Size Input Handler
```typescript
<TextInput
  value={servingSize}
  onChangeText={(value) => {
    setServingSize(value);
    
    // Otomatik hesaplama
    if (selectedFood && value) {
      const newSize = parseFloat(value);
      if (!isNaN(newSize) && newSize > 0) {
        const nutrition = calculateNutrition(selectedFood, newSize);
        setCalories(nutrition.calories.toString());
        setProtein(nutrition.protein.toString());
        setCarbs(nutrition.carbs.toString());
        setFat(nutrition.fat.toString());
      }
    }
  }}
  keyboardType="numeric"
/>
```

### Birim Kontrolü
```typescript
<TouchableOpacity
  onPress={() => {
    if (selectedFood && selectedFood.isLiquid !== undefined) {
      const foodIsLiquid = selectedFood.isLiquid;
      
      // Sıvı ürün + gram seçimi
      if (foodIsLiquid && unit.id === 'gram') {
        Alert.alert(
          '⚠️ Uyarı',
          `${selectedFood.name} sıvı bir üründür. ` +
          `Gram yerine ml kullanmanız önerilir.`,
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Yine de Kullan', 
              onPress: () => setServingUnit(unit.id)
            }
          ]
        );
        return;
      }
      
      // Katı ürün + ml seçimi
      if (!foodIsLiquid && unit.id === 'ml') {
        Alert.alert(
          '⚠️ Uyarı',
          `${selectedFood.name} katı bir üründür. ` +
          `ml yerine gram kullanmanız önerilir.`,
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Yine de Kullan', 
              onPress: () => setServingUnit(unit.id)
            }
          ]
        );
        return;
      }
    }
    
    setServingUnit(unit.id);
  }}
>
```

---

## 📊 Hesaplama Formülleri

### Barkod Scanner (Base Values Mevcut)
```
Multiplier = NewServingSize / 100

Calories = BaseCalories × Multiplier
Protein  = BaseProtein  × Multiplier
Carbs    = BaseCarbs    × Multiplier
Fat      = BaseFat      × Multiplier
```

**Örnek: Nutella 20g**
```
BaseCalories = 530 kcal (per 100g)
NewServingSize = 20g
Multiplier = 20 / 100 = 0.2

Calories = 530 × 0.2 = 106 kcal ✅
Protein  = 6   × 0.2 = 1.2 → 1g
Carbs    = 57  × 0.2 = 11.4 → 11g
Fat      = 30  × 0.2 = 6g
```

### Veritabanı (Base Values Yok)
```
Ratio = NewServingSize / OriginalServingSize

Calories = OriginalCalories × Ratio
Protein  = OriginalProtein  × Ratio
Carbs    = OriginalCarbs    × Ratio
Fat      = OriginalFat      × Ratio
```

**Örnek: Süt 100ml (orijinal 200ml)**
```
OriginalServingSize = 200ml
OriginalCalories = 122 kcal
NewServingSize = 100ml
Ratio = 100 / 200 = 0.5

Calories = 122 × 0.5 = 61 kcal ✅
```

---

## 🎯 Avantajlar

### 1. Hassas Hesaplama
```
✅ Her miktar için doğru kalori
✅ Küçük porsiyonlar da desteklenir (20g, 50ml)
✅ Büyük porsiyonlar da desteklenir (500g, 1000ml)
```

### 2. Kullanıcı Dostu
```
✅ Otomatik güncelleme (manuel hesaplama gerekmez)
✅ Gerçek zamanlı feedback
✅ Görsel uyarılar (yanlış birim seçimi)
```

### 3. Tip Güvenliği
```
✅ TypeScript ile tip kontrolü
✅ NaN kontrolleri
✅ isLiquid flag ile sıvı/katı ayrımı
```

### 4. Performans
```
✅ Anında hesaplama (< 1ms)
✅ Minimal re-render
✅ Efficient state management
```

---

## 🐛 Bilinen Sınırlamalar

### 1. Veritabanı Ürünleri
```
⚠️ Veritabanındaki ürünler için base values yok
→ Ratio ile hesaplama yapılır (daha az hassas)
→ Gelecekte base values eklenebilir
```

### 2. Adet/Porsiyon Birimleri
```
⚠️ "Adet", "porsiyon" gibi birimler için dinamik hesaplama yapılmaz
→ Bu birimler ürüne özel olduğu için mantıklı değil
→ Sadece gram/ml için otomatik hesaplama
```

### 3. Birim Dönüşümü
```
⚠️ Birim değiştirince miktar dönüşümü yapılmaz
→ Örnek: 250ml → gram'a çevirince 250g olur (hatalı!)
→ Gelecekte birim dönüşüm tablosu eklenebilir
```

---

## 🚀 Gelecek İyileştirmeler

### 1. Veritabanı Güncellemesi
```
TODO: Tüm veritabanı besinlerine base values ekle
- Hesaplama scriptü yaz
- 100g/100ml bazına dönüştür
- isLiquid flag'i ayarla
```

### 2. Birim Dönüşümü
```
TODO: Akıllı birim dönüşüm sistemi
- ml → gram (yoğunluğa göre)
- bardak → ml (250ml)
- kaşık → ml (15ml)
```

### 3. Favoriler
```
TODO: Sık kullanılan porsiyonları kaydet
- "250ml süt" → Favori ekle
- Hızlı erişim
```

---

## 📚 Kaynaklar

### OpenFoodFacts API
- [Nutriments Documentation](https://wiki.openfoodfacts.org/API/Read/Product#Nutriments)
- [Serving Size Fields](https://wiki.openfoodfacts.org/Global_serving_sizes)

### React Native
- [TextInput onChangeText](https://reactnative.dev/docs/textinput#onchangetext)
- [Alert.alert](https://reactnative.dev/docs/alert)

---

## ✅ Özet

**Nutrition App v1.7.1** ile:
- ✅ Gramaj değişince kalori otomatik güncellenir
- ✅ Sıvı/katı ürünler için doğru birim zorlaması
- ✅ 100g/100ml bazlı hassas hesaplama
- ✅ Gerçek zamanlı kullanıcı geri bildirimi

**Test edin ve harika sonuçlar alın!** 🎉

