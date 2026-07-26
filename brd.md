1. Executive Summary (Ringkasan Eksekutif)
Bagian ini menjelaskan latar belakang dan tujuan utama aplikasi secara singkat.

Masalah saat ini (As-Is): Proses penilaian kematangan TI masih manual, berbasis kertas/Excel, menyulitkan rekapitulasi, dan rentan salah hitung.

Solusi yang ditawarkan (To-Be): Sebuah sistem informasi berbasis web yang mendigitalisasi kuesioner COBIT 2019, melakukan kalkulasi otomatis, dan menghasilkan laporan visual.

2. Project Scope (Ruang Lingkup Proyek)
Mengingat kerangka kerja COBIT 2019 sangat masif, bagian ini adalah yang paling penting agar batas waktu pengerjaan proyek penelitian atau tugas akhir Anda tetap terukur dan tidak melebar tak terkendali.

In-Scope: Pembuatan aplikasi mencakup manajemen pengguna, pengisian kuesioner, dan kalkulasi level kematangan khusus untuk domain tertentu (misalnya, hanya membatasi pada domain operasional seperti DSS).

Out-of-Scope: Aplikasi tidak mencakup integrasi API langsung ke sistem monitoring server perusahaan atau audit keuangan.

3. User Roles (Peran Pengguna)
Definisikan siapa saja yang akan berinteraksi dengan sistem dan apa hak akses mereka:

Admin/Super User: Mengelola master data (menambah/menghapus domain, objektif, dan butir pertanyaan COBIT 2019).

Assessor/Auditor: Mengelola jadwal assessment, mengirimkan kuesioner, dan melihat laporan hasil akhir.

Auditee (Responden): Menerima akses untuk menjawab kuesioner berdasarkan bukti nyata operasional mereka.

4. High-Level Business Requirements (Kebutuhan Fungsional Utama)
Ini adalah inti dari aplikasi Anda. Jabarkan fitur-fitur wajib yang harus ada:

Modul Manajemen Kuesioner: Sistem harus mampu menampung struktur hierarki COBIT 2019 (Domain -> Objective -> Practice -> Activity).

Modul Skoring & Penilaian: Sistem harus menyediakan pilihan jawaban berbasis COBIT Performance Management (biasanya skala N-P-L-F: Not, Partially, Largely, Fully Achieved) dan mengkalkulasinya menjadi Capability Level (0-5).

Modul Pelaporan (Report): Sistem harus bisa menampilkan hasil kalkulasi akhir secara komprehensif.

5. Reporting & Deliverables (Kebutuhan Laporan Akhir)
Bagian ini merinci bentuk output yang akan dihasilkan oleh aplikasi setelah assessment selesai:

Visualisasi Data: Laporan harus mencakup grafik Radar Chart (jaring laba-laba) untuk memudahkan perbandingan antara level kematangan saat ini (As-Is) dengan level target (To-Be).

Gap Analysis: Sistem menampilkan selisih nilai dan rekomendasi perbaikan untuk mencapai target.

Dokumen Ekspor: Kemampuan untuk mengunduh hasil audit ke dalam format PDF untuk keperluan presentasi ke manajemen.

6. Acceptance Criteria (Kriteria Penerimaan)
Bagian ini menentukan parameter kapan sebuah fitur dianggap "selesai dan berhasil". Karena aplikasi ini berfungsi sebagai alat ukur, tahap validasi kelayakan sistem (User Acceptance Testing) sangat krusial di sini. Kriteria penerimaan memastikan bahwa alur penilaian, pengisian form, dan—yang paling penting—akurasi rumus kalkulasi skoring COBIT 2019, tervalidasi dengan sempurna oleh pengguna akhir sebelum aplikasi benar-benar dirilis.
