# 🤝 Katkıda Bulunma Rehberi

Nutrition App projesine katkıda bulunmak istediğiniz için teşekkürler!

## 📋 İçindekiler

- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Katkı Süreci](#katkı-süreci)
- [Kod Standartları](#kod-standartları)
- [Commit Mesajları](#commit-mesajları)
- [Pull Request](#pull-request)

## 🛠️ Geliştirme Ortamı

### Gereksinimler

```bash
Node.js 16+
npm veya yarn
Expo CLI
Git
```

### Kurulum

```bash
# Repository'yi fork edin
# Fork'unuzu klonlayın
git clone https://github.com/YOUR_USERNAME/nutrition_app.git
cd nutrition_app

# Upstream'i ekleyin
git remote add upstream https://github.com/CotNeo/nutrition_app.git

# Bağımlılıkları yükleyin
npm install --legacy-peer-deps

# Geliştirme ortamını başlatın
npm start
```

## 🔄 Katkı Süreci

### 1. Issue Kontrol

Önce [Issues](https://github.com/CotNeo/nutrition_app/issues) bölümünü kontrol edin:
- Çalışmak istediğiniz bir issue var mı?
- Yoksa yeni bir issue açın

### 2. Branch Oluştur

```bash
git checkout -b feature/your-feature-name
# veya
git checkout -b fix/bug-description
```

### 3. Değişiklikleri Yap

- Kod standartlarına uyun
- JSDoc yorumları ekleyin
- Logger kullanın
- TypeScript tiplerini belirtin

### 4. Test Et

```bash
# Lint kontrolü
npm run lint

# TypeScript kontrolü
npx tsc --noEmit

# Uygulamayı test edin
npm start
```

### 5. Commit

```bash
git add .
git commit -m "feat: Add amazing feature"
```

### 6. Push

```bash
git push origin feature/your-feature-name
```

### 7. Pull Request

GitHub'da Pull Request açın:
- Açıklayıcı başlık
- Detaylı açıklama
- Ekran görüntüleri (UI değişiklikleri için)
- Related issues (#123)

## 📝 Kod Standartları

### SOLID Principles

```typescript
// ✅ İyi: Single Responsibility
class UserService {
  createUser() { }
  updateUser() { }
}

class AuthService {
  login() { }
  logout() { }
}

// ❌ Kötü: Çok sorumluluk
class UserAuthService {
  createUser() { }
  login() { }
  sendEmail() { }
}
```

### JSDoc Comments

```typescript
/**
 * Calculates user's daily calorie needs
 * @param weight Weight in kg
 * @param height Height in cm
 * @param age Age in years
 * @param gender User's gender
 * @returns BMR in calories
 */
function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  // Implementation
}
```

### Logging

```typescript
import { Logger } from '@utils/logger';

// ✅ İyi
Logger.log('ComponentName', 'Action started', { data });
Logger.error('ComponentName', 'Error occurred', error);

// ❌ Kötü
console.log('something happened');
```

### TypeScript

```typescript
// ✅ İyi: Explicit types
interface UserProps {
  name: string;
  age: number;
}

const MyComponent: React.FC<UserProps> = ({ name, age }) => {
  return <Text>{name}</Text>;
};

// ❌ Kötü: Any types
const MyComponent = (props: any) => {
  return <Text>{props.name}</Text>;
};
```

### File Structure

```typescript
// Component dosya yapısı
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 1. Interfaces/Types
interface Props {
  title: string;
}

// 2. Component
const MyComponent: React.FC<Props> = ({ title }) => {
  // a. State
  const [value, setValue] = useState('');

  // b. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // c. Handlers
  const handlePress = () => {
    Logger.log('MyComponent', 'Button pressed');
  };

  // d. Render
  return <View />;
};

// 3. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// 4. Export
export default MyComponent;
```

## 💬 Commit Mesajları

### Format

```
type(scope): Subject

Body (optional)

Footer (optional)
```

### Types

- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `docs`: Dokümantasyon
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance iyileştirme
- `test`: Test ekleme/düzenleme
- `chore`: Diğer değişiklikler

### Örnekler

```bash
feat(auth): Add Google Sign In
fix(dashboard): Fix streak calculation bug
docs(readme): Update installation steps
style(button): Improve button shadows
refactor(services): Simplify nutrition service
perf(calendar): Optimize date calculations
```

## 🔍 Pull Request

### PR Template

```markdown
## Açıklama
Kısa açıklama

## Değişiklikler
- Değişiklik 1
- Değişiklik 2

## Test Edildi Mi?
- [ ] iOS
- [ ] Android
- [ ] Web

## Ekran Görüntüleri
(Varsa)

## Related Issues
Closes #123
```

### PR Checklist

- [ ] Kod standartlarına uygun
- [ ] JSDoc yorumları eklendi
- [ ] TypeScript hataları yok
- [ ] ESLint hataları yok
- [ ] Test edildi
- [ ] Dokümantasyon güncellendi
- [ ] CHANGELOG.md güncellendi

## 🎯 Öncelikli Alanlar

### High Priority
1. Öğün ekleme sistemi
2. Besin veritabanı
3. Geçmiş görüntüleme
4. Grafik ve raporlar

### Medium Priority
1. Profil fotoğrafı
2. Dark mode
3. Notifications
4. Settings ekranı

### Low Priority
1. Social features
2. Cloud sync
3. Barcode scanner
4. Export data

## ❓ Sorular

Sorularınız için:
- [GitHub Discussions](https://github.com/CotNeo/nutrition_app/discussions)
- [Issues](https://github.com/CotNeo/nutrition_app/issues)

## 🎉 Teşekkürler!

Katkılarınız için teşekkür ederiz! 🙏

---

**Happy Coding! 🚀**

Geliştirici: **CotNeo**  
Repository: https://github.com/CotNeo/nutrition_app.git

