# Netlify Repo Kontrol ve Çözüm

## Sorun
Netlify hala `admin-portal` klasörünü bulamıyor, push etmenize rağmen.

## Olası Nedenler

### 1. Netlify Yanlış Branch'i Deploy Ediyor
Netlify Dashboard'da hangi branch'in deploy edildiğini kontrol edin:
- Site settings → Build & deploy → Continuous Deployment
- Production branch: `main` olmalı
- Branch deploys: Hangi branch'ler deploy ediliyor?

### 2. Netlify Yanlış Repo'ya Bağlı
- Site settings → Build & deploy → Continuous Deployment
- Repository: Doğru repo'ya bağlı mı? (`44technology/vibe-connect`)

### 3. GitHub'da admin-portal Klasörü Yok
GitHub'da kontrol edin:
- https://github.com/44technology/vibe-connect
- `admin-portal` klasörü görünüyor mu?
- Son commit'te `admin-portal` var mı?

## Çözüm Adımları

### Adım 1: GitHub'da Kontrol
1. https://github.com/44technology/vibe-connect adresine gidin
2. `admin-portal` klasörünün var olduğunu kontrol edin
3. Son commit'te değişikliklerin olduğunu kontrol edin

### Adım 2: Netlify Site Ayarlarını Kontrol
1. Netlify Dashboard → Site settings
2. **Build & deploy** → **Continuous Deployment**
3. **Production branch:** `main` olmalı
4. **Repository:** Doğru repo olmalı

### Adım 3: Netlify Build Ayarları
1. **Build & deploy** → **Build settings**
2. **Base directory:** BOŞ
3. **Build command:** `cd admin-portal && npm install --legacy-peer-deps && npm run build`
4. **Publish directory:** `admin-portal/dist`

### Adım 4: Netlify Cache'i Temizle
1. **Deploys** sekmesi
2. **Trigger deploy** → **Clear cache and deploy site**

### Adım 5: Manuel Deploy
1. **Deploys** sekmesi
2. **Trigger deploy** → **Deploy site**
3. **Branch:** `main` seçin
4. Deploy edin

## Alternatif: Netlify.toml ile Context Kullanma

Eğer hala çalışmıyorsa, root'ta bir `netlify.toml` oluşturun:

```toml
# Admin Portal Context
[context.admin-portal]
  base = "admin-portal"
  command = "cd admin-portal && npm install --legacy-peer-deps && npm run build"
  publish = "admin-portal/dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

Sonra Netlify Dashboard'da:
- Base directory: BOŞ
- Build command: (netlify.toml'dan otomatik)
- Publish directory: (netlify.toml'dan otomatik)

## Debug: Build Logs'u Kontrol

Build logs'da şunları kontrol edin:
1. Hangi commit çekiliyor?
2. Hangi branch'ten çekiliyor?
3. Repo'da hangi dosyalar var?

## En Son Çare: Netlify Site'ı Yeniden Bağla

1. Site settings → **General** → **Site details**
2. **Delete site** (dikkatli!)
3. Yeni site oluştur
4. GitHub repo'yu bağla
5. Ayarları tekrar yap
