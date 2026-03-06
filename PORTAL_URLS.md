# Portal URL'leri

Admin portal ve venue portal **farklı linklerde** çalışır.

## Mevcut / Önerilen adresler

| Portal        | Örnek URL                          | Açıklama                    |
|---------------|-------------------------------------|-----------------------------|
| **Admin**     | https://ulikmeadmin.netlify.app     | Netlify – ayrı site         |
| **Venue**     | Ayrı Netlify site veya subdomain   | Örn. ulikmevenue.netlify.app veya venue.ulikme.com |

## Lokal geliştirme

| Portal   | Komut              | Adres                |
|----------|--------------------|----------------------|
| Admin    | `cd admin-portal && npm run dev`   | http://localhost:3001 |
| Venue    | `cd venue-portal && npm run dev`   | http://localhost:3002 |

## Production seçenekleri (WEB_PORTAL_ARCHITECTURE.md)

- **Path:** `ulikme.com/admin`, `ulikme.com/venue`
- **Subdomain:** `admin.ulikme.com`, `venue.ulikme.com`
- **Ayrı Netlify siteleri:** `ulikmeadmin.netlify.app`, `ulikmevenue.netlify.app` (şu an admin böyle)

Özet: Venue portal linki admin portaldan farklıdır; her biri kendi domain/subdomain veya path’inde yayınlanır.
