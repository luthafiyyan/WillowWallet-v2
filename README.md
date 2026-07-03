# WillowWallet v2 - Modern Mobile Banking Wallet Tracker

WillowWallet v2 adalah perombakan total dari WillowWallet asli. Aplikasi ini dibangun kembali dengan arsitektur modern full-stack menggunakan **React 19**, **Vite**, **TypeScript**, **Recharts**, dan **Lucide Icons** dengan kepatuhan 100% terhadap struktur data Firebase Authentication & Realtime Database lama Anda.

---

## 🌟 Fitur Utama

- **Premium Mobile Banking UI/UX**: Terinspirasi oleh pola desain intuitif Bank Jago, Monzo, dan Revolut. Memiliki sudut membulat yang lebar, spasi yang lega, dan responsif maksimal.
- **Kepatuhan Struktur Database**: Beroperasi 100% di atas struktur node database Firebase Anda tanpa mengubah path, nama field, ataupun lokasi data.
- **Dual-Mode Engine (Sandbox vs Live)**:
  - **Sandbox Mode**: Aktif secara otomatis jika kredensial Firebase tidak terdeteksi. Menyediakan simulasi data offline di dalam browser menggunakan `localStorage`.
  - **Firebase Mode**: Terkoneksi secara live ke database Realtime Anda ketika kredensial disediakan.
- **Analisis & Anggaran Cerdas (Planning)**:
  - Grafik visual arus kas bulanan interaktif.
  - Grafik proporsi pengeluaran kategori.
  - Laju Menabung (% Saving Rate) & Rata-rata Pengeluaran Harian yang dihitung secara otomatis.
  - Notifikasi dan wawasan (insights) keuangan otomatis berbahasa Indonesia.
- **Sistem Pengaturan Anggaran**: Pengaturan limit per kategori pengeluaran lengkap dengan progress-bar responsif (Hijau/Kuning/Merah).
- **Dark Mode Premium**: Tema gelap malam mewah yang ramah di mata.
- **Ekspor & Backup Mandiri**:
  - Ekspor riwayat transaksi ke format spreadsheet CSV.
  - Pencadangan penuh database ke file JSON offline.

---

## 🗄️ Kepatuhan Struktur Database

Sistem membaca dan menulis data persis mengikuti skema di bawah ini:

```text
users
│
└── {uid}
    │
    ├── transactions
    │   └── {transactionId}
    │       ├── type (income / expense)
    │       ├── amount (number)
    │       ├── date (string: YYYY-MM-DD)
    │       ├── category (string)
    │       ├── description (string)
    │       ├── createdAt (timestamp)
    │       └── updatedAt (timestamp)
    │
    ├── budgets
    │   └── {budgetId}
    │       ├── category (string)
    │       └── limit (number)
    │
    └── settings
        └── categories
            └── list (array string)
```

---

## ⚙️ Cara Menghubungkan Firebase Anda

Untuk beralih dari **Sandbox Offline** ke **Database Live Firebase**:

1. Masuk ke aplikasi.
2. Klik link **"Hubungkan ke Firebase Sendiri"** di bagian bawah halaman masuk (atau di tab **Profil**).
3. Tempelkan (paste) objek konfigurasi Web SDK Anda dari Firebase Console, pastikan menyertakan parameter `databaseURL`:
   ```json
   {
     "apiKey": "AIzaSy...",
     "authDomain": "willowwallet.firebaseapp.com",
     "databaseURL": "https://willowwallet.firebaseio.com",
     "projectId": "willowwallet",
     "storageBucket": "willowwallet.appspot.com",
     "messagingSenderId": "...",
     "appId": "..."
   }
   ```
4. Klik **Terapkan & Hubungkan**. Aplikasi akan otomatis memuat ulang dan menyinkronkan data Anda dengan cloud!

---

## 🚀 Jalankan Aplikasi Secara Lokal

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
3. Buka browser di alamat `http://localhost:3000`.
