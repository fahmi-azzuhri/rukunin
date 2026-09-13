# Rukunin

Rukunin adalah aplikasi manajemen lingkungan RT/RW. Aplikasi ini membantu pengurus dan warga mengelola data administrasi, komunikasi, keuangan, janji temu, serta catatan rapat dalam satu sistem.

Rukunin tersedia dalam dua bentuk:

- Web app yang berjalan di browser.
- Aplikasi Android (APK) berbasis Capacitor yang menggunakan frontend yang sama dan tetap terhubung ke API Rukunin.

## Tech Stack

### Backend

- Go
- Chi Router
- GORM
- MySQL 8
- JWT untuk autentikasi
- CORS middleware
- Docker

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- ESLint

### Android

- Capacitor
- Capacitor Android
- Gradle
- Android SDK

## Fitur

### Autentikasi dan akun

- Login pengguna dengan username dan password.
- Aktivasi akun melalui undangan.
- Onboarding data warga untuk Ketua RT.
- Autentikasi berbasis JWT.
- Pengaturan akses berdasarkan role pengguna.

### Manajemen RT/RW

- Pengelolaan data RW dan RT.
- Pembuatan dan pengelolaan area RT.
- Dukungan role Superadmin, Ketua RW, Ketua RT, Bendahara, Sekretaris, Wakil, dan Warga.
- Pengelolaan data rumah dan warga.

### Administrasi lingkungan

- Pengumuman untuk warga.
- Pengajuan dan pengelolaan janji temu.
- Catatan dan persetujuan hasil rapat.
- Profil pengguna dan data warga.

### Keuangan

- Pencatatan iuran warga.
- Pencatatan pengeluaran lingkungan.
- Ringkasan keuangan untuk pengurus.

### Aplikasi Android

- Frontend web dikemas menjadi APK menggunakan Capacitor.
- APK tetap menggunakan API production:
  `https://api.rukunin.efkode.my.id`
- Dapat dibuild dari terminal tanpa membuka Android Studio.

## Struktur Project

```text
rukunin/
├── backend/                 # REST API dan business logic Go
├── frontend/                # React web app dan source APK Android
│   ├── android/              # Project native Android Capacitor
│   ├── src/                  # Source code React
│   ├── capacitor.config.ts  # Konfigurasi Capacitor
│   └── .env                 # Konfigurasi API frontend
├── docker-compose.yml        # Konfigurasi database, backend, dan frontend
└── README.md
```

## Menjalankan dengan Docker

Dari folder root project:

```bash
docker compose up --build
```

Service yang tersedia:

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`
- Database: MySQL pada service `db`

## Menjalankan Backend secara Lokal

Prasyarat:

- Go
- MySQL 8

Masuk ke folder backend, siapkan file `.env`, lalu jalankan:

```bash
cd backend
go mod download
go run main.go
```

## Menjalankan Frontend secara Lokal

```bash
cd frontend
npm install
npm run dev
```

Frontend menggunakan konfigurasi `VITE_API_URL` pada file `.env`.

## Build APK Android

Prasyarat:

- Node.js dan npm
- JDK 21
- Android SDK command-line tools
- Android platform-tools dan build-tools

Dari folder frontend:

```bash
cd frontend
npm install
npm run cap:sync
```

Build APK debug tanpa Android Studio:

```bash
cd android
./gradlew assembleDebug
```

Pada Windows PowerShell:

```powershell
cd frontend\android
.\gradlew.bat assembleDebug
```

File APK yang dihasilkan:

```text
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

APK debug dapat dikirim ke perangkat Android dan di-install dengan mengizinkan instalasi dari sumber yang tidak dikenal.

## Konfigurasi API

Frontend production saat ini diarahkan ke:

```env
VITE_API_URL=https://api.rukunin.efkode.my.id
```

Pastikan backend production mengizinkan origin aplikasi Capacitor Android (`https://localhost`) melalui konfigurasi CORS agar login dan request API dari APK dapat berjalan.
