# Hedef Kilo Alanı Görünürlük Sorunu Çözümü

## 🐛 **Tespit Edilen Sorun**

Hedef ekranında hedef kilo alanı görünmüyor. Bu alan sadece `lose_weight` veya `gain_weight` hedefleri seçildiğinde görünüyordu.

## 🔍 **Sorunun Nedeni**

GoalSetupScreen'de hedef kilo alanı şu koşulla görünüyordu:
```typescript
{(goal === 'lose_weight' || goal === 'gain_weight') && (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Hedef Kilo (kg) *</Text>
    // ... hedef kilo input alanı
  </View>
)}
```

Bu nedenle:
- `lose_weight` hedefi seçildiğinde → Hedef kilo alanı görünür
- `gain_weight` hedefi seçildiğinde → Hedef kilo alanı görünür
- `maintain` hedefi seçildiğinde → Hedef kilo alanı görünmez ❌
- `gain_muscle` hedefi seçildiğinde → Hedef kilo alanı görünmez ❌

## ✅ **Uygulanan Çözüm**

### **1. Hedef Kilo Alanı Her Zaman Görünür Hale Getirildi**

```typescript
<View style={styles.inputContainer}>
  <Text style={styles.label}>Hedef Kilo (kg) *</Text>
  <TextInput
    style={styles.input}
    placeholder={goal === 'maintain' ? "Mevcut kilonuz" : "65"}
    value={targetWeight}
    onChangeText={(text) => {
      setTargetWeight(text);
      setShowPlans(false);
    }}
    keyboardType="decimal-pad"
    editable={!loading}
  />
  // ... yardımcı metinler ve butonlar
</View>
```

### **2. Goal-Specific Placeholder Eklendi**

```typescript
placeholder={goal === 'maintain' ? "Hedef kilonuz" : "65"}
```

### **3. Yardımcı Metin Eklendi**

```typescript
{goal === 'maintain' && (
  <Text style={styles.helpText}>
    💡 Kilo korumak için hedef kilonuz mevcut kilonuzla aynı olmalı
  </Text>
)}
```

### **4. Otomatik Hedef Kilo Doldurma**

`maintain` hedefi seçildiğinde hedef kilo alanı mevcut kilo ile otomatik dolduruluyor:

```typescript
useEffect(() => {
  if (goal === 'maintain' && weight && !targetWeight) {
    setTargetWeight(weight);
  }
}, [goal, weight, targetWeight]);
```

### **5. Validation Güncellendi**

Hedef kilo alanı artık her zaman görünür olduğu için validation da güncellendi:

```typescript
// Önceki validation
if ((goal === 'lose_weight' || goal === 'gain_weight') && !targetWeight) {
  Alert.alert('Hata', 'Lütfen hedef kilonuzu girin');
  return;
}

// Yeni validation
if (!targetWeight) {
  Alert.alert('Hata', 'Lütfen hedef kilonuzu girin');
  return;
}
```

### **6. Plan Hesaplama Butonu Koşullu Hale Getirildi**

Plan hesaplama butonu sadece `lose_weight` veya `gain_weight` hedefleri seçildiğinde görünüyor:

```typescript
{targetWeight && weight && (goal === 'lose_weight' || goal === 'gain_weight') && (
  <TouchableOpacity
    style={styles.calculateButton}
    onPress={calculatePlans}
    disabled={!age || !height || !gender}
  >
    <Text style={styles.calculateButtonText}>
      📊 Planları Hesapla
    </Text>
  </TouchableOpacity>
)}
```

## 🔄 **Yeni Çalışma Akışı**

### **Tüm Hedefler İçin**
1. Hedef kilo alanı her zaman görünür
2. Kullanıcı hedef kilosunu girebilir
3. Validation her zaman çalışır

### **Maintain Hedefi İçin**
1. Hedef kilo alanı görünür
2. Placeholder: "Hedef kilonuz"
3. Yardımcı metin: "💡 Kilo korumak için hedef kilonuz mevcut kilonuzla aynı olmalı"
4. Otomatik doldurma: Mevcut kilo ile doldurulur
5. Plan hesaplama butonu görünmez

### **Lose Weight / Gain Weight Hedefleri İçin**
1. Hedef kilo alanı görünür
2. Placeholder: "65"
3. Plan hesaplama butonu görünür
4. Hedef kilo planları hesaplanabilir

## 📱 **Test Senaryoları**

### **✅ Test 1: Maintain Hedefi**
1. "⚖️ Kilomu Korumak" hedefini seçin
2. Hedef kilo alanı görünmeli
3. Placeholder: "Hedef kilonuz"
4. Yardımcı metin görünmeli
5. Mevcut kilo ile otomatik doldurulmalı

### **✅ Test 2: Lose Weight Hedefi**
1. "🔻 Kilo Vermek" hedefini seçin
2. Hedef kilo alanı görünmeli
3. Placeholder: "65"
4. Plan hesaplama butonu görünmeli

### **✅ Test 3: Gain Weight Hedefi**
1. "🔺 Kilo Almak" hedefini seçin
2. Hedef kilo alanı görünmeli
3. Placeholder: "65"
4. Plan hesaplama butonu görünmeli

### **✅ Test 4: Gain Muscle Hedefi**
1. "💪 Kas Kazanmak" hedefini seçin
2. Hedef kilo alanı görünmeli
3. Placeholder: "65"
4. Plan hesaplama butonu görünmeli

## 🎯 **Sonuç**

Hedef kilo alanı görünürlük sorunu çözüldü:

- ✅ **Her zaman görünür** - Tüm hedefler için hedef kilo alanı görünür
- ✅ **Goal-specific placeholder** - Her hedef için uygun placeholder
- ✅ **Yardımcı metinler** - Kullanıcı ne yapması gerektiğini anlar
- ✅ **Otomatik doldurma** - Maintain hedefi için mevcut kilo ile doldurulur
- ✅ **Koşullu butonlar** - Plan hesaplama butonu sadece gerekli hedeflerde görünür
- ✅ **Validation** - Her hedef için uygun validation

Artık tüm hedeflerde hedef kilo alanı görünecek ve kullanıcılar hedef kilosunu girebilecek! 🎉
