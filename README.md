# WebTowers

## Deskripsi Proyek
WebTowers adalah proyek yang bertujuan untuk [deskripsi singkat tentang tujuan proyek Anda, misalnya: "membangun aplikasi web untuk manajemen data tower."].

## Struktur Branch

### Branch `master`
- Branch utama yang berisi versi stabil dari aplikasi.
- Hanya perubahan yang telah diuji dan siap untuk produksi yang akan digabungkan ke branch ini.

### Branch `dev`
- Branch ini digunakan untuk pengembangan fitur baru dan perbaikan bug.
- Semua pengembangan dilakukan di branch ini sebelum digabungkan ke branch `master`.
- Tim diharapkan untuk membuat pull request dari `dev` ke `master` setelah melakukan pengujian.

### Branch `prod`
- Branch ini berisi versi yang sudah siap untuk diproduksi.
- Hanya perubahan yang telah diuji dan disetujui yang akan digabungkan ke branch ini.
- Branch ini harus dilindungi untuk mencegah perubahan langsung tanpa review.

## Cara Berkontribusi
1. **Fork Repository**: Buat salinan repository ini ke akun GitHub Anda.
2. **Buat Branch Baru**: Buat branch baru untuk fitur atau perbaikan yang ingin Anda kerjakan.
   ```bash
   git checkout -b nama-branch-baru
   ```
3. **Lakukan Perubahan**: Lakukan perubahan yang diperlukan dan commit.
   ```bash
   git add .
   git commit -m "Deskripsi perubahan"
   ```
4. **Dorong Perubahan**: Dorong branch baru Anda ke GitHub.
   ```bash
   git push origin nama-branch-baru
   ```
5. **Buat Pull Request**: Kunjungi repository asli dan buat pull request untuk menggabungkan perubahan Anda.

## Lisensi
[Tambahkan informasi lisensi di sini, jika ada.]

## Kontak
Jika Anda memiliki pertanyaan atau saran, silakan hubungi [nama Anda] di [email Anda].
