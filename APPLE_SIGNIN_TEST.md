# Apple Sign-In Test Rehberi

## ✅ Tamamlanan İşlemler

### 1. Paket Kurulumu
- `expo-apple-authentication` paketi kuruldu
- `@react-native-async-storage/async-storage` paketi güncellendi

### 2. Servis Implementasyonu
- `AuthService.signInWithApple()` metodu gerçek Apple Sign-In ile implement edildi
- Kullanıcı adı otomatik olarak Apple'dan alınıyor
- Email adresi Apple'dan alınıyor (veya private relay kullanılıyor)
- Platform kontrolü eklendi (sadece iOS'ta çalışır)

### 3. Context Güncellemesi
- `AuthContext` Apple Sign-In ile uyumlu hale getirildi
- Daha iyi hata yönetimi eklendi
- Loglama iyileştirildi

### 4. UI Güncellemesi
- `AuthScreen` Apple Sign-In butonu ile güncellendi
- Daha iyi hata mesajları eklendi
- Loading durumu yönetimi iyileştirildi

### 5. Konfigürasyon
- `app.json` dosyasına `expo-apple-authentication` plugin'i eklendi
- iOS bundle identifier yapılandırıldı

## 🧪 Test Senaryoları

### iOS Cihazında Test
1. iOS simülatör veya gerçek cihazda uygulamayı açın
2. Auth ekranında "Apple ile Giriş Yap" butonuna tıklayın
3. Apple Sign-In popup'ı açılmalı
4. Kullanıcı bilgilerini girin ve onaylayın
5. Kullanıcı adı otomatik olarak alınmalı ve uygulamaya giriş yapılmalı

### Android/Web'de Test
1. Android cihaz veya web'de uygulamayı açın
2. Auth ekranında "Apple ile Giriş Yap" butonuna tıklayın
3. Demo Apple kullanıcısı oluşturulmalı (geliştirme amaçlı)

## 🔧 Apple Developer Console Yapılandırması

Apple Sign-In'in gerçek cihazlarda çalışması için:

1. Apple Developer Console'a giriş yapın
2. App ID'nizi bulun (com.nutritionapp)
3. Sign In with Apple capability'sini etkinleştirin
4. Certificate ve Provisioning Profile'ı güncelleyin

## 📱 Özellikler

### Otomatik Kullanıcı Adı Alma
- Apple Sign-In'den gelen `fullName` objesi kullanılıyor
- `givenName` ve `familyName` birleştiriliyor
- Eğer sadece bir tanesi varsa o kullanılıyor
- Hiçbiri yoksa varsayılan "Apple Kullanıcı" kullanılıyor

### Email Yönetimi
- Apple'dan gelen email kullanılıyor
- Eğer email yoksa private relay email oluşturuluyor
- Format: `{userID}@privaterelay.appleid.com`

### Güvenlik
- Apple'ın benzersiz kullanıcı ID'si kullanılıyor
- Credential bilgileri güvenli şekilde saklanıyor
- Platform kontrolü yapılıyor

## 🐛 Bilinen Sorunlar

1. **iOS Simülatör**: Apple Sign-In simülatörde tam olarak çalışmayabilir
2. **Apple Developer Console**: Gerçek cihazlarda test için Apple Developer hesabı gerekiyor
3. **Bundle Identifier**: Apple Developer Console'da bundle identifier eşleşmeli

## 📋 Sonraki Adımlar

1. iOS gerçek cihazda test edin
2. Apple Developer Console'da yapılandırmayı tamamlayın
3. Production build için certificate'ları hazırlayın
4. Kullanıcı deneyimini iyileştirin

## 🔍 Debug Logları

Apple Sign-In işlemi sırasında detaylı loglar:
- `[AuthService] Apple Sign In started`
- `[AuthService] Apple credential received`
- `[AuthService] Apple Sign In successful`
- `[AuthContext] Apple Sign In successful`

Logları kontrol etmek için:
```bash
npx expo start
# Console'da logları takip edin
```

