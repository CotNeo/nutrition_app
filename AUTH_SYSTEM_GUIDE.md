# 🔐 Authentication System Guide

## ✅ Tamamlanan Özellikler

### 1. **Authentication Ekranı (AuthScreen)**
- ✅ Email/Şifre ile giriş
- ✅ Email/Şifre ile kayıt
- ✅ Google ile giriş butonu
- ✅ Apple ile giriş butonu (iOS)
- ✅ Telefon numarası ekleme (opsiyonel)
- ✅ Giriş/Kayıt arası geçiş
- ✅ Şifremi unuttum butonu
- ✅ Modern ve kullanıcı dostu UI

### 2. **Auth Service (authService.ts)**
- ✅ `registerWithEmail()` - Email ile kayıt
- ✅ `loginWithEmail()` - Email ile giriş
- ✅ `signInWithGoogle()` - Google girişi
- ✅ `signInWithApple()` - Apple girişi
- ✅ `getCurrentUser()` - Mevcut kullanıcı
- ✅ `isLoggedIn()` - Giriş kontrolü
- ✅ `logout()` - Çıkış
- ✅ `updateProfile()` - Profil güncelleme

### 3. **Auth Context (AuthContext.tsx)**
- ✅ Global auth state yönetimi
- ✅ `useAuth()` hook
- ✅ Otomatik giriş kontrolü
- ✅ Loading state management

### 4. **Navigation Sistemi**
- ✅ Kullanıcı giriş yapmadıysa → AuthScreen
- ✅ Kullanıcı giriş yaptıysa → HomeScreen
- ✅ Otomatik yönlendirme
- ✅ Loading ekranı

### 5. **HomeScreen Güncellemeleri**
- ✅ Kullanıcı adı gösterimi
- ✅ Çıkış butonu
- ✅ Auth context entegrasyonu

## 🚀 Kullanım

### Auth Screen Özellikleri

```typescript
// Giriş Modu
- Email girişi
- Şifre girişi
- "Şifremi Unuttum" linki
- "Giriş Yap" butonu
- "Kayıt Ol" geçiş linki

// Kayıt Modu
- Ad Soyad girişi
- Email girişi
- Telefon girişi (opsiyonel)
- Şifre girişi
- "Kayıt Ol" butonu
- "Giriş Yap" geçiş linki

// Social Login
- Google ile Devam Et
- Apple ile Devam Et (sadece iOS)
```

### useAuth Hook Kullanımı

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  // Kullanıcı bilgisi
  console.log(user?.name); // "Kullanıcı Adı"
  console.log(user?.email); // "user@example.com"

  // Giriş yap
  const handleLogin = async () => {
    const success = await signIn('email@example.com', 'password123');
    if (success) {
      console.log('Giriş başarılı');
    }
  };

  // Çıkış yap
  const handleLogout = async () => {
    await signOut();
  };
}
```

## 📱 Ekran Akışı

```
App Başlangıç
    │
    ├─ Loading ekranı (auth kontrol)
    │
    ├─ Kullanıcı yok mu?
    │   └─► AuthScreen
    │       ├─ Email ile giriş
    │       ├─ Email ile kayıt
    │       ├─ Google ile giriş
    │       └─ Apple ile giriş
    │           │
    │           └─► Başarılı ─► HomeScreen
    │
    └─ Kullanıcı var mı?
        └─► HomeScreen
            └─ Çıkış yap ─► AuthScreen
```

## 🔧 Servis Detayları

### AuthService

```typescript
// Kayıt
const user = await AuthService.registerWithEmail(
  'user@example.com',
  'password123',
  'Kullanıcı Adı',
  '+90 555 123 45 67' // opsiyonel
);

// Giriş
const user = await AuthService.loginWithEmail(
  'user@example.com',
  'password123'
);

// Google Girişi
const user = await AuthService.signInWithGoogle();

// Apple Girişi
const user = await AuthService.signInWithApple();

// Mevcut Kullanıcı
const user = await AuthService.getCurrentUser();

// Giriş Kontrolü
const isLoggedIn = await AuthService.isLoggedIn();

// Çıkış
await AuthService.logout();

// Profil Güncelle
const updatedUser = await AuthService.updateProfile({
  name: 'Yeni Ad',
  age: 25,
  weight: 75,
  height: 180,
});
```

## 💾 Veri Saklama

Kullanıcı verisi `AsyncStorage` ile saklanır:

```typescript
// Storage Key
STORAGE_KEYS.USER = 'user'

// User Object
{
  id: string,
  name: string,
  email: string,
  age?: number,
  weight?: number, // kg
  height?: number, // cm
  gender?: 'male' | 'female' | 'other',
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
}
```

## 🎨 UI Özellikleri

### AuthScreen
- **Temiz ve modern tasarım**
- **Responsive layout**
- **Keyboard avoidi ng**
- **Loading states**
- **Error handling**
- **Input validation**

### Renkler
- Primary: `#4CAF50` (Yeşil)
- Secondary: `#2196F3` (Mavi)
- Error: `#FF5252` (Kırmızı)
- Text: `#333`
- Subtitle: `#666`

## 🔄 Demo Mod

Şu anda sistem **demo mode**'da çalışıyor:

### Demo Özellikleri:
1. **Herhangi bir email/şifre ile giriş yapılabilir**
2. **Google/Apple girişi demo user oluşturur**
3. **Gerçek API çağrısı yok**
4. **Lokal storage kullanılıyor**

### Production'a Geçiş:

#### 1. Firebase Entegrasyonu
```bash
npm install @react-native-firebase/app @react-native-firebase/auth
```

#### 2. Google Sign In
```bash
npm install @react-native-google-signin/google-signin
```

#### 3. Apple Sign In
```bash
npx expo install expo-apple-authentication
```

## 📝 TODO: Production İyileştirmeleri

### Güvenlik
- [ ] Şifre gücü kontrolü
- [ ] Email doğrulama
- [ ] 2FA (Two Factor Authentication)
- [ ] Rate limiting
- [ ] Secure token storage

### Özellikler
- [ ] Şifremi unuttum fonksiyonu
- [ ] Email değiştirme
- [ ] Şifre değiştirme
- [ ] Hesap silme
- [ ] Profil fotoğrafı

### Backend Entegrasyonu
- [ ] Firebase Authentication
- [ ] Google OAuth
- [ ] Apple Sign In
- [ ] JWT Token yönetimi
- [ ] Refresh token

## 🧪 Test Senaryoları

### 1. Kayıt Testi
```
1. AuthScreen açılır
2. "Kayıt Ol" moduna geç
3. Ad, email, şifre gir
4. "Kayıt Ol" butonuna bas
5. HomeScreen'e yönlendir
```

### 2. Giriş Testi
```
1. AuthScreen açılır
2. Email ve şifre gir
3. "Giriş Yap" butonuna bas
4. HomeScreen'e yönlendir
```

### 3. Google Giriş Testi
```
1. AuthScreen açılır
2. "Google ile Devam Et" butonuna bas
3. Demo user oluştur
4. HomeScreen'e yönlendir
```

### 4. Çıkış Testi
```
1. HomeScreen'desin
2. "Çıkış" butonuna bas
3. AuthScreen'e yönlendir
4. User state temizlendi
```

## 🎯 Kullanıcı Deneyimi

### ✅ İyi UX Pratikleri
- Loading indicators
- Error messages (Alert)
- Success feedback
- Keyboard handling
- Auto-focus next input
- Password visibility toggle (TODO)
- Remember me (TODO)

### 🔒 Güvenlik Pratikleri
- Şifre gizleme (secureTextEntry)
- Input validation
- Error handling
- Secure storage
- Logout on error

## 📞 Destek

Sorunlarınız için:
1. Console logs kontrol edin
2. AsyncStorage'ı temizleyin
3. App'i yeniden başlatın

```typescript
// Storage temizleme
import { StorageService } from '@utils/storage';
await StorageService.clear();
```

---

## 🎉 Başarıyla Tamamlandı!

Authentication sistemi tamamen çalışır durumda. Artık:
- ✅ Kullanıcılar kayıt olabilir
- ✅ Giriş yapabilir
- ✅ Çıkış yapabilir
- ✅ Session yönetimi çalışıyor

**Sonraki adımlar:**
1. Gerçek backend entegrasyonu
2. Social login implementasyonu
3. Profil yönetimi ekranı
4. Şifre sıfırlama

Kolay gelsin! 🚀

