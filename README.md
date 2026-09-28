# Inventory Sparepart

Dashboard inventaris sparepart untuk operasional bengkel dan gudang mekanik. Aplikasi frontend murni berbasis HTML, JavaScript vanilla, dan Tailwind CSS. Data awal diambil dari `data.json`, kemudian seluruh perubahan dan log aktivitas disimpan ke `localStorage`.

## Fitur Utama

- **Katalog & Stok**: Tambah, perbarui data, hapus, serta mutasi cepat stok (+/-).
- **Indikator Kritis**: Penanda visual khusus ketika kuantitas sparepart berada di bawah batas minimum.
- **Pencarian & Filter**: Pencarian instan nama atau SKU, filter kategori, dan pengurutan (harga, stok, lokasi rak, SKU).
- **Log Riwayat Aktivitas**: Pencatatan otomatis mutasi stok, penambahan item, update, dan penghapusan (maksimal 50 riwayat terkini).
- **Statistik Inventaris**: Perhitungan otomatis total SKU, jumlah item stok rendah, total kuantitas fisik, dan estimasi valuasi aset.
- **Manajemen Kategori**: Tambah kategori sparepart melalui modal dialog yang terintegrasi.
- **Foto Komponen**: Unggah dan pratinjau gambar komponen (disimpan dalam format data URL).

## Struktur Berkas

- `index.html`: Struktur antarmuka pengguna dashboard bengkel.
- `app.js`: Logika manipulasi data, penyimpanan `localStorage`, filter, dan log aktivitas.
- `data.json`: Data awal katalog sparepart.
- `tailwind.config.js`: Konfigurasi token tema Tailwind (shadow dan panel elevasi).
- `DESIGN.md`: Panduan arah desain Industrial Workshop Utility (ENERGY 2 / RHYTHM 2 / MOTION 1).
- `test_logic.js`: Pengujian logika mandiri tanpa dependensi eksternal.
- `images/`: Berkas aset gambar statis pendukung.

## Cara Menjalankan

1. Buka terminal pada folder proyek.
2. Jalankan server lokal:

```bash
python -m http.server 8000
```

3. Buka peramban ke:

```text
http://localhost:8000
```

## Verifikasi & Pengujian Logika

Jalankan pengujian logika inventaris:

```bash
node test_logic.js
```

## Catatan Teknis

- Styling memanfaatkan Tailwind CSS via CDN dengan penyesuaian kelas utilitas.
- Penyimpanan lokal menggunakan kunci `sparepart-inventory-v1`, `sparepart-categories-v1`, dan `sparepart-activity-v1`.
- Seluruh kontrol interaktif memenuhi standar aksesibilitas keyboard dan target sentuh mobile minimal 44px.
