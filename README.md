# 📦 Inventory Management System

Proje bazlı, çok siteli envanter takip sistemi. Full-stack TypeScript ile geliştirilmiş, production-ready bir uygulama.

## 📸 Ekran Görüntüleri

### Giriş Sayfası

!\[Login](docs/screenshots/login.png)

### Dashboard

!\[Dashboard](docs/screenshots/dashboard.png)

### Projeler

!\[Projects](docs/screenshots/projects.png)

### Siteler

!\[Sites](docs/screenshots/sites.png)

### Envanter Yönetimi

!\[Inventory](docs/screenshots/inventory.png)

## ✨ Özellikler

* **Kimlik Doğrulama** — JWT access + refresh token, bcrypt şifreleme, otomatik token yenileme
* **Dashboard** — Genel istatistikler, proje bazlı dağılım grafiği, hızlı erişim
* **Proje Yönetimi** — Proje oluşturma, düzenleme, silme (cascade)
* **Site Yönetimi** — Proje altında çoklu site, unique site kodları
* **Envanter Takibi** — CRUD, arama, server-side pagination
* **Excel İçe Aktarma** — .xlsx dosyasından toplu envanter yükleme
* **API Dokümantasyonu** — Swagger UI (`/api/docs`)
* **Güvenlik** — Helmet, CORS, rate limiting, input validation (Zod)
* **Hata Yönetimi** — Error boundary, global error handler
* **CI/CD** — GitHub Actions (lint, type check, test, build)
* **Containerization** — Docker \& Docker Compose

## 🛠 Tech Stack

### Backend

|Teknoloji|Kullanım|
|-|-|
|Node.js + Express|REST API sunucusu|
|TypeScript|Tip güvenliği|
|MongoDB + Mongoose|Veritabanı ve ODM|
|JWT (jsonwebtoken)|Authentication|
|bcrypt|Şifre hashleme|
|Zod|Input validation|
|Helmet|HTTP güvenlik başlıkları|
|express-rate-limit|Rate limiting|
|Vitest|Unit test framework|

### Frontend

|Teknoloji|Kullanım|
|-|-|
|React 18|UI framework|
|TypeScript|Tip güvenliği|
|Vite|Build tool|
|Tailwind CSS|Styling|
|React Router v6|Client-side routing|
|Axios|HTTP client + interceptors|
|react-hot-toast|Bildirimler|

### DevOps

|Teknoloji|Kullanım|
|-|-|
|Docker|Containerization|
|Docker Compose|Multi-service orchestration|
|Nginx|Reverse proxy \& static serving|
|GitHub Actions|CI/CD pipeline|

## 📁 Proje Yapısı

```
├── server/                    # Express API
│   ├── src/
│   │   ├── config/            # Veritabanı bağlantısı
│   │   ├── controllers/       # İş mantığı (auth, project, site, inventory)
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Mongoose şemaları (User, Project, Site, InventoryItem)
│   │   ├── routes/            # API route tanımları + Swagger
│   │   ├── utils/             # JWT token yardımcıları
│   │   ├── validators/        # Zod doğrulama şemaları
│   │   └── \\\_\\\_tests\\\_\\\_/         # Unit testler
│   └── Dockerfile
├── client/                    # React SPA
│   ├── src/
│   │   ├── components/        # ErrorBoundary, layout (Navbar, AppLayout)
│   │   ├── context/           # AuthContext (login, register, logout, auto-refresh)
│   │   ├── pages/             # Dashboard, Projects, Sites, Inventory, Login, Register, 404
│   │   ├── services/          # Axios instance + interceptors
│   │   └── types/             # TypeScript tip tanımları
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/ci.yml   # GitHub Actions CI pipeline
├── docker-compose.yml
└── README.md
```

## 🚀 Kurulum

### Gereksinimler

* Node.js 18+
* MongoDB 6+

### Yerel Geliştirme

```bash
# Repo'yu klonla
git clone https://github.com/KULLANICI/inventory-app.git
cd inventory-app

# Backend
cd server
cp .env.example .env       # Ortam değişkenlerini düzenle
npm install
npm run dev                 # http://localhost:5000

# Frontend (yeni terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

### Docker ile Çalıştırma

```bash
cp server/.env.example server/.env
# .env içinde MONGODB\\\_URI=mongodb://mongodb:27017/inventory-app olarak güncelle

docker compose up --build   # http://localhost
```

### Testleri Çalıştırma

```bash
cd server
npm test
```

## 📡 API Endpoints

Swagger UI: `http://localhost:5000/api/docs`

|Method|Endpoint|Açıklama|Auth|
|-|-|-|-|
|POST|`/api/auth/register`|Yeni kullanıcı kaydı|✗|
|POST|`/api/auth/login`|Kullanıcı girişi|✗|
|POST|`/api/auth/refresh`|Token yenileme|✗|
|GET|`/api/auth/me`|Kullanıcı bilgisi|✓|
|GET|`/api/projects`|Projeleri listele|✓|
|POST|`/api/projects`|Proje oluştur|✓|
|PUT|`/api/projects/:id`|Proje güncelle|✓|
|DELETE|`/api/projects/:id`|Proje sil (cascade)|✓|
|GET|`/api/projects/:pid/sites`|Siteleri listele|✓|
|POST|`/api/projects/:pid/sites`|Site oluştur|✓|
|PUT|`/api/projects/:pid/sites/:id`|Site güncelle|✓|
|DELETE|`/api/projects/:pid/sites/:id`|Site sil (cascade)|✓|
|GET|`/api/projects/:pid/sites/:sid/items`|Envanter listele|✓|
|POST|`/api/projects/:pid/sites/:sid/items`|Kayıt ekle|✓|
|POST|`/api/projects/:pid/sites/:sid/items/bulk`|Toplu import|✓|
|PUT|`/api/projects/:pid/sites/:sid/items/:id`|Kayıt güncelle|✓|
|DELETE|`/api/projects/:pid/sites/:sid/items/:id`|Kayıt sil|✓|

## 🔒 Güvenlik

* Şifreler **bcrypt** ile hash'lenerek saklanır (salt rounds: 12)
* JWT access token (15dk) + refresh token (7 gün) ile oturum yönetimi
* Axios interceptor ile otomatik token yenileme
* **Helmet** ile HTTP güvenlik başlıkları
* **express-rate-limit** ile brute-force koruması (15dk / 100 istek)
* **Zod** ile server-side input validation
* **CORS** ile izinli origin kontrolü
* Ortam değişkenleri `.env` dosyasında, versiyon kontrolüne dahil edilmez

## 📄 Lisans

MIT



