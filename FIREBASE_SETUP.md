# 🔥 Firebase Setup Rehberi - React Native Firebase (@react-native-firebase)

Bu proje artık **@react-native-firebase** native modüllerini kullanıyor. Bu, Firebase JS SDK'sına göre daha stabil ve performanslı bir çözüm.

## ✅ Neler Değişti?

### Önceki Durum (Firebase JS SDK)
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
```
❌ **Problem:** WebChannel connection hataları, React Native uyumsuzlukları

### Yeni Durum (@react-native-firebase)
```typescript
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
```
✅ **Çözüm:** Native Firebase SDK'ları, daha stabil bağlantı

---

## ⚙️ Sistem Gereksinimleri

### iOS Gereksinimleri (resmi dokümantasyondan)
- **Minimum Xcode:** 16.2
- **Minimum macOS:** 14.5 (macOS Sequoia)
- **firebase-ios-sdk:** 12.6.0+

### Android Gereksinimleri
- **Minimum SDK:** 23
- **Target SDK:** 33+
- **Compile SDK:** 34

> **Uyarı:** [React Native Firebase](https://rnfirebase.io/) **Expo Go ile ÇALIŞMAZ**. Native kod içerdiği için development build gerektirir.

---

## 📋 Kurulum Adımları

### 1️⃣ Firebase Console'dan Config Dosyalarını İndir

#### Android için:
1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. ⚙️ Project Settings → Your apps → Android app
3. `google-services.json` dosyasını indirin
4. **Proje root'una** (package.json'un olduğu yere) yerleştirin

#### iOS için:
1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. ⚙️ Project Settings → Your apps → iOS app
3. `GoogleService-Info.plist` dosyasını indirin
4. **Proje root'una** (package.json'un olduğu yere) yerleştirin

### 2️⃣ Bağımlılıkları Yükle

**Önce eski firebase paketini kaldırın:**
```bash
npm uninstall firebase
```

**Sonra @react-native-firebase modüllerini Expo installer ile yükleyin:**
```bash
npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage expo-build-properties
```

> 💡 **Neden `npx expo install`?** Expo SDK 54 ile uyumlu versiyonları otomatik seçer. `npm install` kullanırsanız versiyon uyumsuzlukları olabilir.

### 3️⃣ Native Proje Dosyalarını Oluştur (Prebuild)

```bash
npx expo prebuild --clean
```

⚠️ **Önemli:** Bu komut Android ve iOS native klasörlerini oluşturur/günceller.

### 4️⃣ Uygulamayı Çalıştır

#### Android:
```bash
npx expo run:android
```

#### iOS:
```bash
cd ios
pod install --repo-update
cd ..
npx expo run:ios
```

> **Not:** İlk çalıştırmada pod install uzun sürebilir (Firebase SDK'ları indiriliyor)

---

## 🔍 Firebase Servislerini Test Et

```typescript
import { db, storage, auth, isFirebaseAvailable } from '@/shared/config/firebase';

// Firebase hazır mı kontrol et
if (isFirebaseAvailable) {
  console.log('Firebase kullanıma hazır! ✅');
  
  // Firestore test
  const users = await db.collection('users').get();
  
  // Auth test
  const currentUser = auth.currentUser;
  
  // Storage test
  const ref = storage.ref('images/test.jpg');
} else {
  console.warn('Firebase yapılandırılmamış ⚠️');
}
```

---

## 🛠 Yaygın Sorunlar ve Çözümler

### Problem 1: "google-services.json not found"
**Çözüm:** 
- Dosyanın **proje root'unda** olduğundan emin olun (package.json ile aynı klasör)
- Dosya adının **tam olarak** `google-services.json` olduğunu kontrol edin

### Problem 2: "GoogleService-Info.plist not found"
**Çözüm:** 
- iOS için aynı şekilde proje root'unda olmalı
- Dosya adı: `GoogleService-Info.plist` (büyük/küçük harf önemli)

### Problem 3: Build hataları
**Çözüm:** 
```bash
# Cache temizle ve yeniden prebuild
rm -rf node_modules ios android
npm install
npx expo prebuild --clean
```

### Problem 4: "Module not found: @react-native-firebase"
**Çözüm:** 
```bash
npm install
npx expo prebuild --clean
```

### Problem 5: Expo Dev Client ile Crashlytics Çalışmıyor
**Açıklama:** [Resmi dokümantasyona göre](https://rnfirebase.io/), `expo-dev-client` native crash'leri yakalar ve Firebase'e göndermez.

**Çözüm:** 
- Development sırasında normal (expo-dev-client ile çalışır)
- Crashlytics test için `expo-dev-client`'ı kaldırın veya release build kullanın

### Problem 6: Flipper ile Uyumsuzluk
**Açıklama:** `use_frameworks!` Flipper ile uyumlu değil.

**Çözüm:** 
- Flipper deprecated - desteklenmiyor
- Podfile'da Flipper satırlarını comment out edin (Expo zaten yapmaz)
- React Native Firebase ve Flipper **asla birlikte çalışmaz** (iOS'ta)

---

## 📱 API Değişiklikleri

### Firestore

#### Önceki (Firebase JS SDK):
```typescript
import { collection, getDocs } from 'firebase/firestore';

const querySnapshot = await getDocs(collection(db, 'users'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

#### Yeni (@react-native-firebase):
```typescript
import firestore from '@react-native-firebase/firestore';

const snapshot = await firestore().collection('users').get();
snapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

### Auth

#### Önceki:
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';

await signInWithEmailAndPassword(auth, email, password);
```

#### Yeni:
```typescript
import auth from '@react-native-firebase/auth';

await auth().signInWithEmailAndPassword(email, password);
```

### Storage

#### Önceki:
```typescript
import { ref, uploadBytes } from 'firebase/storage';

await uploadBytes(ref(storage, 'path/to/file'), file);
```

#### Yeni:
```typescript
import storage from '@react-native-firebase/storage';

await storage().ref('path/to/file').putFile(filePath);
```

---

## 📚 Daha Fazla Bilgi

- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firestore Usage](https://rnfirebase.io/firestore/usage)
- [Authentication](https://rnfirebase.io/auth/usage)
- [Storage](https://rnfirebase.io/storage/usage)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)

---

## ✅ Checklist

- [ ] `google-services.json` proje root'una eklendi
- [ ] `GoogleService-Info.plist` proje root'una eklendi
- [ ] `npm install` çalıştırıldı
- [ ] `npx expo prebuild --clean` çalıştırıldı
- [ ] Android/iOS native build başarılı
- [ ] Firebase bağlantısı test edildi

---

## 🎯 Neden @react-native-firebase?

| Özellik | Firebase JS SDK | @react-native-firebase |
|---------|----------------|------------------------|
| **Performans** | ⚠️ Orta | ✅ Yüksek (Native) |
| **Offline Support** | ⚠️ Sınırlı | ✅ Tam |
| **Bundle Size** | ⚠️ Büyük | ✅ Küçük |
| **React Native Uyum** | ❌ Sorunlu | ✅ Mükemmel |
| **WebChannel Hataları** | ❌ Var | ✅ Yok |
| **Network Stability** | ⚠️ Orta | ✅ Yüksek |

---

**Hazırlayan:** AI Assistant  
**Tarih:** 1 Aralık 2025  
**Proje:** Miniature Weather

