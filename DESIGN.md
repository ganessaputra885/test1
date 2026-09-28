# Design Direction: Industrial Workshop Utility

Dashboard inventaris sparepart untuk operasional bengkel dan gudang mekanik.

## Dials
Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

- **ENERGY 2**: Kontras tinggi, tegas, berkarakter utiliter bengkel, bukan generic template.
- **RHYTHM 2**: Hirarki visual berjenjang antara metrik cepat, formulir input, dan tabel data master.
- **MOTION 1**: Transisi status subtil, tanpa animasi dekoratif lambat yang mengganggu kecepatan input operator.

## Palette & Hierarchy
- **Neutral Base**: Zinc-950, Zinc-900, Zinc-800 untuk teks dan tombol primer; Zinc-100 dan Zinc-50 untuk bidang kerja bersih.
- **Safety Accent**: Amber-500 / Amber-600 untuk penanda stok kritis dan peringatan restock segera.
- **Health Accent**: Emerald-600 / Emerald-700 untuk verifikasi stok aman.
- **Surface**: Border terdefinisi tegas (zinc-200/zinc-300), eliminasi bayangan melayang (fuzzy shadow slop).

## Typography
- Antarmuka utama: Sans-serif sistem berbobot tegas (medium/semibold).
- Data teknis & angka: Tabular figures dan font monospace untuk SKU, kode rak, kuantitas stok, dan nominal harga.

## Keputusan Desain (R-31)
- Warna: Netral industrial + aksen amber darurat agar mekanik langsung melihat sparepart yang habis.
- Layout: Header ringkas -> Kartu metrik operasional -> Form entri terstruktur -> Tabel data berdensitas tinggi dengan aksi cepat.
- Radius: `rounded-lg` dan `rounded-xl` presisi, menolak gaya pill bulat seragam.
- Aksesibilitas: Target sentuh >= 44px di mobile, cincin fokus keyboard jelas, kontras teks memenuhi WCAG AA.
