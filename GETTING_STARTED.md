# Başlangıç Rehberi (Getting Started Guide)

## 🚀 Hızlı Başlangıç

### 1. Projeyi Çalıştırma

```bash
# Development server'ı başlat
npm start
```

Bu komut Expo DevTools'u açacaktır. Şu seçeneklerden birini kullanabilirsiniz:

- **Android**: `a` tuşuna basın veya Android emulator'da çalıştırın
- **iOS**: `i` tuşuna basın veya iOS simulator'da çalıştırın  
- **Web**: `w` tuşuna basın
- **Fiziksel Cihaz**: Expo Go uygulamasıyla QR kodu tarayın

### 2. Fiziksel Cihazda Test

1. App Store (iOS) veya Play Store (Android)'dan **Expo Go** uygulamasını indirin
2. Bilgisayarınız ve telefonunuz aynı WiFi ağında olmalı
3. `npm start` komutunu çalıştırın
4. Expo Go ile QR kodu tarayın

### 3. Proje Yapısını Anlamak

```
src/
├── components/      # Yeniden kullanılabilir UI bileşenleri
│   └── Button.tsx   # Örnek buton bileşeni
├── screens/         # Ekran bileşenleri
│   └── HomeScreen.tsx
├── services/        # İş mantığı ve veri yönetimi
│   └── nutritionService.ts
├── utils/           # Yardımcı fonksiyonlar
│   ├── logger.ts    # Log yönetimi
│   └── storage.ts   # Veri saklama
├── hooks/           # Custom React hooks
├── types/           # TypeScript tip tanımlamaları
└── assets/          # Görseller, fontlar vb.
```

## 📝 Önemli Dosyalar

- **App.tsx**: Uygulamanın giriş noktası
- **app.json**: Expo yapılandırması
- **tsconfig.json**: TypeScript yapılandırması
- **babel.config.js**: Babel yapılandırması (path aliasları)
- **.eslintrc.js**: Kod kalitesi kuralları

## 🎨 Yeni Ekran Ekleme

1. `src/screens/` klasöründe yeni bir dosya oluşturun:

```typescript
// src/screens/MealsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MealsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>My Meals</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MealsScreen;
```

2. `App.tsx` dosyasına navigation ekleyin:

```typescript
import MealsScreen from './src/screens/MealsScreen';

// Stack.Navigator içine ekleyin
<Stack.Screen 
  name="Meals" 
  component={MealsScreen}
  options={{ title: 'Öğünlerim' }}
/>
```

## 🔧 Path Aliases Kullanımı

Proje path alias'ları destekliyor:

```typescript
// ❌ Kötü
import { Logger } from '../../utils/logger';

// ✅ İyi
import { Logger } from '@utils/logger';

// Kullanılabilir alias'lar:
// @components, @services, @utils, @hooks, @types, @screens
```

## 💾 Veri Saklama

```typescript
import { StorageService, STORAGE_KEYS } from '@utils/storage';

// Veri kaydetme
await StorageService.setItem(STORAGE_KEYS.USER, userData);

// Veri okuma
const user = await StorageService.getItem(STORAGE_KEYS.USER);

// Veri silme
await StorageService.removeItem(STORAGE_KEYS.USER);
```

## 🪵 Logging

```typescript
import { Logger } from '@utils/logger';

// Bilgi logu
Logger.log('ComponentName', 'Action happened', { data });

// Hata logu
Logger.error('ComponentName', 'Error occurred', error);

// Grup logu
Logger.group('Debug Info', {
  userId: user.id,
  email: user.email,
});
```

## 🧪 Debug Modunda Çalıştırma

```bash
# React DevTools ile
npm start

# Metro bundler'ı temizle
npm start -- --clear

# Port değiştir
npm start -- --port 8081
```

## 🛠️ Sık Karşılaşılan Sorunlar

### Metro bundler hatası
```bash
npm start -- --clear
```

### Node modules hatası
```bash
rm -rf node_modules
npm install
```

### Cache temizleme
```bash
expo start -c
```

### TypeScript hatası
```bash
npm run lint
```

## 📚 Öğrenme Kaynakları

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript](https://www.typescriptlang.org/)

## 🎯 Sonraki Adımlar

1. ✅ Proje yapısını inceleyin
2. ✅ HomeScreen'i çalıştırıp test edin
3. 🔄 Yeni ekranlar ekleyin (Meals, Goals, Profile)
4. 🔄 API entegrasyonu yapın
5. 🔄 Veritabanı bağlantısı kurun

## 💡 İpuçları

- Hot reload aktif, değişiklikler otomatik yansır
- Console.log yerine Logger kullanın
- Her component için TypeScript interface tanımlayın
- SOLID prensiplerine uyun (bkz. rules.md)

---

**Kolay gelsin! 🎉**

