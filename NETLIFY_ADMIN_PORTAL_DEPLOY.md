# Netlify Admin Portal Deployment Guide

## Sorun: Base directory does not exist: /opt/build/repo/admin-portal

Bu hata, Netlify'ın admin-portal klasörünü bulamadığında oluşur.

## Çözüm: Netlify Dashboard Ayarları

### Seçenek 1: Admin Portal için Ayrı Netlify Site (Önerilen)

1. **Netlify Dashboard'a gidin:**
   - https://app.netlify.com
   - Yeni bir site oluşturun veya mevcut admin portal site'ını seçin

2. **Site Settings → Build & deploy → Build settings:**

   **Base directory:** `admin-portal`
   
   **Build command:** (otomatik olarak netlify.toml'dan alınır)
   ```
   npm install --legacy-peer-deps && npm run build
   ```
   
   **Publish directory:** `dist`

3. **Environment Variables (gerekirse):**
   - `NODE_VERSION` = `18`
   - `NPM_VERSION` = `9`

4. **Deploy:**
   - Deploys sekmesine gidin
   - Trigger deploy → Deploy site

### Seçenek 2: Admin Portal'ı Root'tan Deploy Etme

Eğer admin-portal'ı root'tan deploy ediyorsanız:

1. **Base directory:** `admin-portal` (Netlify Dashboard'da)

2. **Build command:**
   ```
   cd admin-portal && npm install --legacy-peer-deps && npm run build
   ```

3. **Publish directory:** `admin-portal/dist`

### Seçenek 3: Monorepo Context Kullanma

Netlify'da monorepo desteği için:

1. **netlify.toml** dosyasını root'ta oluşturun:

```toml
# Main app
[build]
  base = "."
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"

# Admin portal (context-based)
[context.admin-portal]
  base = "admin-portal"
  command = "cd admin-portal && npm install --legacy-peer-deps && npm run build"
  publish = "admin-portal/dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

2. **Netlify Dashboard'da:**
   - Base directory: **BOŞ** bırakın (netlify.toml context kullanacak)
   - Build command: Context'e göre otomatik seçilir

## Kontrol Listesi

- [ ] GitHub repo'da `admin-portal` klasörü var mı?
- [ ] `admin-portal/package.json` dosyası var mı?
- [ ] `admin-portal/netlify.toml` dosyası var mı?
- [ ] Netlify Dashboard'da Base directory doğru ayarlanmış mı?
- [ ] Build command doğru mu?
- [ ] Publish directory doğru mu?

## Hızlı Test

1. GitHub'da repo'nuzu açın
2. `admin-portal` klasörünün var olduğunu kontrol edin
3. `admin-portal/package.json` dosyasının var olduğunu kontrol edin
4. Netlify Dashboard'da Base directory'yi `admin-portal` olarak ayarlayın
5. Deploy edin

## Yaygın Hatalar ve Çözümleri

### Hata: "Base directory does not exist"
**Çözüm:** Netlify Dashboard'da Base directory'yi `admin-portal` olarak ayarlayın

### Hata: "Could not read package.json"
**Çözüm:** Base directory doğru mu kontrol edin. `admin-portal/package.json` dosyası var mı?

### Hata: "Build command failed"
**Çözüm:** Build command'da `cd admin-portal` kullanıyorsanız, Base directory'yi `admin-portal` olarak ayarlayın ve `cd` komutunu kaldırın

## Örnek Netlify Dashboard Ayarları

**Site Name:** ulikme-admin-portal

**Base directory:** `admin-portal`

**Build command:** (netlify.toml'dan otomatik)

**Publish directory:** `dist`

**Node version:** 18

**NPM version:** 9
