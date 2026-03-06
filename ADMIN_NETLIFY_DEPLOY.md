# Admin Portal Netlify Deploy – https://ulikmeadmin.netlify.app

## Netlify Dashboard ayarları

Admin portal’ın doğru deploy olması için **Base directory** zorunludur.

1. **Netlify** → https://app.netlify.com
2. **ulikmeadmin** (veya ilgili) site’ı seçin
3. **Site configuration** → **Build & deploy** → **Build settings** → **Edit settings**

### Build settings

| Ayar | Değer |
|------|--------|
| **Base directory** | `admin-portal` |
| **Build command** | `npm install --legacy-peer-deps && npm run build` |
| **Publish directory** | `dist` |
| **Production branch** | `main` |

- **Base directory** mutlaka `admin-portal` olmalı; yoksa build root’tan çalışır ve admin portal deploy olmaz.
- Build command ve Publish directory, `admin-portal` klasörüne göre çalışır (Build command `admin-portal` içinde, Publish directory `admin-portal/dist`).

### Deploy’u tetikleme

1. **Deploys** sekmesi
2. **Trigger deploy** → **Clear cache and deploy site**
3. Branch: **main**
4. Deploy bitene kadar bekleyin

### Repo bağlantısı

- **Site configuration** → **General** → **Site details**
- **Repository:** Projenin GitHub repo’su (örn. `44technology/ulikmerealworld`)
- **Production branch:** `main`

---

**Özet:** Base directory = `admin-portal`, sonra **Clear cache and deploy site** ile yeniden deploy edin.
