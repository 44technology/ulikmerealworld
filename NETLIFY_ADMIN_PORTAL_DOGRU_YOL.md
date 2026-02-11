# Netlify Admin Portal Deployment - Doğru Yol

## GitHub Repository Yapısı

Admin portal GitHub'da şu yolda bulunuyor:
```
main/Downloads/meetupapp/vibe-connect-main/admin-portal
```

URL: https://github.com/44technology/vibe-connect/tree/main/Downloads/meetupapp/vibe-connect-main/admin-portal

## Netlify Dashboard Ayarları

Netlify Dashboard'da (Site settings → Build & deploy → Build settings) şu ayarları yapın:

### Base directory
```
Downloads/meetupapp/vibe-connect-main/admin-portal
```

### Build command
```
npm install --legacy-peer-deps && npm run build
```

### Publish directory
```
dist
```

## Önemli Notlar

1. **Base directory** tam yol olmalı: `Downloads/meetupapp/vibe-connect-main/admin-portal`
2. **Build command** içinde `cd` kullanmayın, çünkü Netlify zaten base directory'ye gidiyor
3. **Publish directory** sadece `dist` olmalı (Netlify otomatik olarak base directory'yi ekler)

## Kontrol Listesi

- [ ] Base directory: `Downloads/meetupapp/vibe-connect-main/admin-portal`
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Publish directory: `dist`
- [ ] GitHub repository URL doğru: `https://github.com/44technology/vibe-connect`
- [ ] Branch: `main`

## Test

Deploy ettikten sonra build loglarını kontrol edin:
- `npm install` başarılı olmalı
- `npm run build` başarılı olmalı
- `dist` klasörü oluşmalı
- Site deploy olmalı
