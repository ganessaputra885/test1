# Inventory Sparepart

Aplikasi inventaris sparepart berbasis frontend yang dibuat dengan HTML, JavaScript, dan Tailwind CSS. Data awal diambil dari file JSON, lalu disimpan ke `localStorage` agar data tetap tersimpan di browser.

## Fitur utama

- Tambah sparepart baru
- Edit data sparepart
- Hapus sparepart
- Cari berdasarkan nama atau SKU
- Filter berdasarkan kategori
- Sorting data
- Tambah kategori baru dari modal
- Update stok naik/turun
- Statistik inventory (total item, stok rendah, total stok, nilai inventory)
- Upload gambar barang dan preview gambar
- Data disimpan dalam format JSON

## Struktur file

- `index.html` = tampilan utama aplikasi
- `app.js` = logika aplikasi, rendering data, storage, filter, dan upload gambar
- `data.json` = data awal sparepart dalam format JSON
- `tailwind.config.js` = konfigurasi Tailwind
- `images/` = folder asset gambar pendukung

## Cara menjalankan

1. Buka folder project.
2. Jalankan server lokal:

```bash
cd c:\test\test1
python -m http.server 8000
```

3. Buka browser ke:

```text
http://localhost:8000
```

## Catatan

- Aplikasi ini menggunakan Tailwind CDN untuk styling.
- Data awal pertama kali dimuat dari `data.json` lalu disimpan ke `localStorage`.
- Hasil penyimpanan data berbentuk JSON sehingga mudah diolah kembali.
- Gambar barang disimpan dalam format data URL agar bisa disimpan bersama item inventory.
