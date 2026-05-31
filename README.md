# 🚀 Simple REST API — Node.js + Express + MySQL

REST API sederhana dengan autentikasi JWT, CRUD produk, dan manajemen user.  
Siap di-deploy ke **Railway**.

---

## 📁 Struktur Folder

```
simple-api/
├── index.js                    ← Entry point server
├── package.json
├── .env.example                ← Template environment variable
├── .gitignore
├── database/
│   └── schema.sql              ← Script buat tabel & seed data
└── src/
    ├── app.js                  ← Konfigurasi Express & routes
    ├── config/
    │   └── database.js         ← Koneksi MySQL (connection pool)
    ├── middleware/
    │   └── auth.middleware.js  ← Verifikasi JWT
    ├── controllers/
    │   ├── auth.controller.js  ← Register, Login, Profile
    │   ├── product.controller.js ← CRUD Produk
    │   └── user.controller.js  ← Manajemen User
    └── routes/
        ├── auth.routes.js
        ├── product.routes.js
        └── user.routes.js
```

---

## ⚙️ Instalasi Lokal

```bash
# 1. Clone / download project
cd simple-api

# 2. Install dependencies
npm install

# 3. Buat file .env dari template
cp .env.example .env
# Edit .env sesuai konfigurasi database lokal kamu

# 4. Jalankan schema.sql di MySQL
mysql -u root -p < database/schema.sql

# 5. Jalankan server
npm run dev     # development (auto-restart)
npm start       # production
```

Server berjalan di `http://localhost:3000`

---

## 🗄️ Desain Database

```
users
  id, name, email, password, role(admin|user), created_at, updated_at

products
  id, name, description, price, stock, created_by(FK→users), created_at, updated_at
```

---

## 📡 Endpoint API

### Base URL
- Lokal: `http://localhost:3000`
- Railway: `https://<nama-project>.up.railway.app`

---

### 🔐 Auth

| Method | Endpoint             | Auth | Deskripsi         |
|--------|----------------------|------|-------------------|
| POST   | /api/auth/register   | ✗    | Daftar akun baru  |
| POST   | /api/auth/login      | ✗    | Login & dapat token |
| GET    | /api/auth/profile    | ✓    | Lihat profil sendiri |

**Register** `POST /api/auth/register`
```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "rahasia123"
}
```

**Login** `POST /api/auth/login`
```json
{
  "email": "budi@example.com",
  "password": "rahasia123"
}
```
Response login menyertakan `token` — gunakan sebagai:
```
Authorization: Bearer <token>
```

---

### 📦 Products

| Method | Endpoint           | Auth | Deskripsi                        |
|--------|--------------------|------|----------------------------------|
| GET    | /api/products      | ✗    | List semua produk (search, page) |
| GET    | /api/products/:id  | ✗    | Detail satu produk               |
| POST   | /api/products      | ✓    | Tambah produk baru               |
| PUT    | /api/products/:id  | ✓    | Update produk (admin/pemilik)    |
| DELETE | /api/products/:id  | ✓    | Hapus produk (admin/pemilik)     |

**Query Params GET /api/products**
```
?search=kopi&page=1&limit=10
```

**Body POST/PUT** `/api/products`
```json
{
  "name": "Kopi Arabica",
  "description": "Kopi premium dari Aceh",
  "price": 75000,
  "stock": 50
}
```

---

### 👤 Users

| Method | Endpoint         | Auth        | Deskripsi              |
|--------|------------------|-------------|------------------------|
| GET    | /api/users       | Admin only  | List semua user        |
| GET    | /api/users/:id   | ✓           | Detail user            |
| PUT    | /api/users/:id   | ✓           | Update user (admin/self)|
| DELETE | /api/users/:id   | Admin only  | Hapus user             |

---

### 📝 Format Response

**Sukses:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Pesan error"
}
```

---

## 🚂 Deploy ke Railway

### Langkah 1 — Push ke GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### Langkah 2 — Buat Project di Railway
1. Buka [railway.app](https://railway.app) → **New Project**
2. Pilih **Deploy from GitHub repo** → pilih repo kamu
3. Railway otomatis mendeteksi Node.js

### Langkah 3 — Tambah MySQL Database
1. Di dalam project Railway, klik **+ New** → **Database** → **MySQL**
2. Railway otomatis membuat database dan mengisi variabel:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

### Langkah 4 — Set Environment Variables
Di tab **Variables** project Node.js kamu, tambahkan:

| Key          | Value                                |
|--------------|--------------------------------------|
| DB_HOST      | `${{MySQL.MYSQLHOST}}`              |
| DB_PORT      | `${{MySQL.MYSQLPORT}}`              |
| DB_USER      | `${{MySQL.MYSQLUSER}}`              |
| DB_PASSWORD  | `${{MySQL.MYSQLPASSWORD}}`          |
| DB_NAME      | `${{MySQL.MYSQLDATABASE}}`          |
| JWT_SECRET   | *(string acak panjang, buat sendiri)*|
| JWT_EXPIRES  | `1d`                                 |

> Gunakan **Railway Variable References** (`${{...}}`) agar otomatis tersambung.

### Langkah 5 — Jalankan Schema SQL
1. Klik service MySQL di Railway
2. Buka tab **Data** → **Query**
3. Copy-paste isi file `database/schema.sql` → **Run**

### Langkah 6 — Deploy
Railway akan otomatis build & deploy setiap kali kamu push ke GitHub.  
Klik **Deploy** jika perlu trigger manual.

Setelah deploy, kamu dapat URL seperti:
```
https://simple-api-production-xxxx.up.railway.app
```

---

## 🔑 Akun Admin Default
```
Email    : admin@example.com
Password : Admin123!
```
> Ganti password setelah pertama login!

---

## 📦 Dependencies

| Package       | Kegunaan                    |
|---------------|-----------------------------|
| express       | Web framework               |
| mysql2        | Driver MySQL + Promise API  |
| dotenv        | Load environment variables  |
| cors          | Handle CORS header          |
| bcryptjs      | Hash password               |
| jsonwebtoken  | Generate & verify JWT token |
