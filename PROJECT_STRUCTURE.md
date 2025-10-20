# Proje Yapısı ve Mimari

## 📦 Klasör Yapısı

```
Nutrition App/
│
├── assets/                    # Statik dosyalar
│   ├── icon.png              # Uygulama ikonu
│   ├── splash.png            # Açılış ekranı
│   ├── adaptive-icon.png     # Android adaptif ikon
│   └── favicon.png           # Web favicon
│
├── src/                      # Kaynak kodlar
│   ├── components/           # UI Bileşenleri
│   │   └── Button.tsx        # Yeniden kullanılabilir buton
│   │
│   ├── screens/              # Ekran Bileşenleri
│   │   └── HomeScreen.tsx    # Ana ekran
│   │
│   ├── services/             # İş Mantığı
│   │   └── nutritionService.ts  # Beslenme servisi
│   │
│   ├── utils/                # Yardımcı Araçlar
│   │   ├── logger.ts         # Log yönetimi
│   │   └── storage.ts        # AsyncStorage wrapper
│   │
│   ├── hooks/                # Custom React Hooks
│   │   └── index.ts          # Hook exports
│   │
│   └── types/                # TypeScript Tipleri
│       └── index.ts          # Type definitions
│
├── App.tsx                   # Ana uygulama bileşeni
├── app.json                  # Expo yapılandırması
├── babel.config.js           # Babel yapılandırması
├── tsconfig.json             # TypeScript yapılandırması
├── .eslintrc.js              # ESLint kuralları
├── .prettierrc               # Prettier yapılandırması
├── .gitignore                # Git ignore kuralları
├── package.json              # Bağımlılıklar
├── README.md                 # Ana dokümantasyon
├── GETTING_STARTED.md        # Başlangıç rehberi
└── PROJECT_STRUCTURE.md      # Bu dosya
```

## 🏗️ Mimari Prensipler

### 1. SOLID Prensipleri

#### Single Responsibility (Tek Sorumluluk)
- Her class/component tek bir işten sorumlu
- `Logger` sadece loglama yapar
- `StorageService` sadece veri saklama yapar
- `NutritionService` sadece beslenme işlemleri yapar

#### Open/Closed (Açık/Kapalı)
- Bileşenler genişlemeye açık, değişikliğe kapalı
- `Button` component'i variant prop'u ile genişletilebilir
- Yeni özellikler mevcut kodu değiştirmeden eklenir

#### Liskov Substitution (Liskov İkamesi)
- Alt sınıflar üst sınıfların yerine kullanılabilir
- Interface'ler tutarlı davranış garantisi verir

#### Interface Segregation (Arayüz Ayrımı)
- Büyük interface'ler küçük parçalara ayrılır
- Her tip kendi sorumluluğunda

#### Dependency Inversion (Bağımlılık Tersine Çevirme)
- Üst seviye modüller alt seviye modüllere bağlı değil
- Soyutlamalara bağlı (interface'ler kullanılır)

### 2. Katmanlı Mimari

```
┌─────────────────────────────────┐
│        Presentation Layer       │  ← Screens & Components
│  (HomeScreen, Button, etc.)     │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│        Business Logic Layer     │  ← Services
│  (NutritionService)              │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│        Data Layer               │  ← Storage & API
│  (StorageService, API calls)    │
└─────────────────────────────────┘
```

## 🔄 Veri Akışı

### 1. Component → Service → Storage

```typescript
// 1. Component'ten veri kaydetme
const saveUserData = async () => {
  await NutritionService.saveMeal(mealData);
};

// 2. Service iş mantığını işler
static async saveMeal(meal: Meal) {
  const meals = await this.getMeals();
  const updated = [...meals, meal];
  return StorageService.setItem(STORAGE_KEYS.MEALS, updated);
}

// 3. Storage veriye erişir
static async setItem(key: string, value: any) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
```

### 2. Storage → Service → Component

```typescript
// 1. Component veri ister
useEffect(() => {
  loadMeals();
}, []);

// 2. Service veriyi getirir
const loadMeals = async () => {
  const meals = await NutritionService.getMeals();
  setMeals(meals);
};

// 3. Storage veriyi döner
static async getMeals() {
  return await StorageService.getItem(STORAGE_KEYS.MEALS);
}
```

## 📋 Component Yapısı

### Standart Component Formatı

```typescript
/**
 * Component açıklaması
 * @param props Props açıklaması
 */
const ComponentName: React.FC<PropsInterface> = ({ prop1, prop2 }) => {
  // 1. State tanımlamaları
  const [state, setState] = useState(initialValue);

  // 2. Hooks
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 3. Event handlers
  const handleAction = () => {
    Logger.log('ComponentName', 'Action triggered');
    // Logic here
  };

  // 4. Render helpers
  const renderItem = () => {
    return <View />;
  };

  // 5. Return JSX
  return (
    <View style={styles.container}>
      {/* JSX content */}
    </View>
  );
};

// 6. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ComponentName;
```

## 🎨 Stil Yönetimi

### StyleSheet Yapısı

```typescript
const styles = StyleSheet.create({
  // Container styles
  container: { flex: 1 },
  content: { padding: 16 },
  
  // Component styles
  header: { fontSize: 24 },
  text: { color: '#333' },
  
  // State styles
  active: { opacity: 1 },
  disabled: { opacity: 0.5 },
});
```

## 🔐 Güvenlik

### Environment Variables
```typescript
// .env dosyasında
API_KEY=your_secret_key

// Kullanım (expo-constants ile)
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.apiKey;
```

### Storage Security
```typescript
// Hassas veriler için encrypted storage kullanın
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', userToken);
const token = await SecureStore.getItemAsync('token');
```

## 📊 State Yönetimi

### Local State (useState)
```typescript
// Component içi state
const [meals, setMeals] = useState<Meal[]>([]);
```

### Context API (Gelecekte)
```typescript
// Global state için Context API kullanılabilir
const UserContext = createContext<UserContextType>(null);
```

### Redux (İhtiyaç durumunda)
```typescript
// Karmaşık state yönetimi için Redux eklenebilir
```

## 🧪 Testing Stratejisi

### Unit Tests
```typescript
// Services için unit testler
describe('NutritionService', () => {
  it('should save meal correctly', async () => {
    const result = await NutritionService.saveMeal(mockMeal);
    expect(result).toBe(true);
  });
});
```

### Component Tests
```typescript
// React component testleri
import { render } from '@testing-library/react-native';

test('Button renders correctly', () => {
  const { getByText } = render(<Button title="Test" onPress={() => {}} />);
  expect(getByText('Test')).toBeTruthy();
});
```

## 🚀 Performance

### Optimizasyon İpuçları

1. **React.memo** kullanımı
```typescript
export default React.memo(ComponentName);
```

2. **useMemo** for expensive calculations
```typescript
const total = useMemo(() => calculateTotal(meals), [meals]);
```

3. **useCallback** for functions
```typescript
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

4. **FlatList** for long lists
```typescript
<FlatList
  data={meals}
  renderItem={renderMeal}
  keyExtractor={(item) => item.id}
/>
```

## 📱 Navigation Yapısı

```
App
 └── NavigationContainer
      └── Stack.Navigator
           ├── Home (Initial)
           ├── Meals
           ├── Goals
           └── Profile
```

## 🔄 Gelecek Geliştirmeler

### Phase 1 (Temel Özellikler) ✅
- [x] Proje kurulumu
- [x] Temel mimari
- [x] Ana ekran
- [x] Veri saklama sistemi

### Phase 2 (Öğün Yönetimi)
- [ ] Öğün ekleme ekranı
- [ ] Öğün listesi
- [ ] Öğün düzenleme/silme
- [ ] Tarih bazlı filtreleme

### Phase 3 (Hedef Takibi)
- [ ] Hedef belirleme
- [ ] İlerleme grafikleri
- [ ] Günlük özet
- [ ] Haftalık rapor

### Phase 4 (Gelişmiş Özellikler)
- [ ] Kullanıcı profili
- [ ] Besin veritabanı
- [ ] Barcode scanner
- [ ] Cloud sync
- [ ] Bildirimler

## 📚 Referanslar

- [React Native Best Practices](https://reactnative.dev/docs/getting-started)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Son Güncelleme:** 21 Ekim 2025

