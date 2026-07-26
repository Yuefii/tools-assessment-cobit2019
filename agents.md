# Aktor & Peran Sistem (Agents / System Actors)

Dokumen ini mendefinisikan agen (aktor) yang akan berinteraksi dengan Sistem Assessment COBIT 2019, beserta izin (permissions), tanggung jawab, dan alur kerja (workflow) masing-masing.

Sistem menggunakan **Role-Based Access Control (RBAC)**, yang berarti apa yang dilihat dan dapat dilakukan oleh seorang pengguna sangat bergantung pada *Role* (peran) mereka di sistem.

---

## 1. Admin (Super User)
**Deskripsi:** Administrator sistem yang memiliki kontrol penuh atas infrastruktur aplikasi, terutama dalam hal pengelolaan *Master Data* COBIT 2019 dan akun pengguna.

**Hak Akses (Permissions):**
*   **CRUD Master Data COBIT:** Mengelola seluruh hierarki kerangka kerja COBIT 2019 yang akan digunakan di aplikasi.
    *   Membuat/Mengedit *Domain* (contoh: EDM, APO, BAI, DSS, MEA).
    *   Membuat/Mengedit *Objective* di dalam domain.
    *   Membuat/Mengedit *Practice* & *Activity* (Butir pertanyaan).
*   **User Management:** Menambahkan, mengedit, menghapus, atau mereset kata sandi pengguna lain (Assessor dan Auditee).
*   **System Settings:** (Opsional) Mengonfigurasi parameter sistem, skala penilaian default, atau pengaturan *environment*.

**Tampilan Utama (UI):**
*   Dashboard Master Data.
*   Tabel Manajemen Pengguna.

---

## 2. Assessor (Auditor / Penilai Utama)
**Deskripsi:** Profesional TI atau Auditor internal/eksternal yang bertanggung jawab untuk merencanakan audit, mendistribusikan kuesioner, dan menganalisis hasil akhirnya. Assessor bertindak sebagai "manajer proyek" untuk setiap siklus assessment.

**Hak Akses (Permissions):**
*   **Manajemen Assessment:** Membuat sesi/jadwal *assessment* baru.
*   **Assigning Kuesioner:** Memilih domain COBIT mana yang masuk ruang lingkup (in-scope), dan menugaskannya kepada Auditee (Responden) tertentu.
*   **Monitoring Progress:** Melihat status pengisian kuesioner oleh Auditee (Misal: *Pending*, *In Progress*, *Completed*).
*   **Review & Validation:** (Opsional) Meninjau bukti operasional yang dilampirkan oleh Auditee sebelum sistem mengesahkan skor.
*   **Reporting & Analytics:**
    *   Melihat kalkulasi akhir (*Capability Level*).
    *   Melihat *Radar Chart* (As-Is vs To-Be).
    *   Melihat hasil *Gap Analysis*.
    *   Mengekspor laporan ke format PDF/Excel.

**Tampilan Utama (UI):**
*   Dashboard Assessment.
*   Monitoring Status Responden.
*   Halaman Laporan & Analitik Interaktif.

---

## 3. Auditee (Responden / Pihak yang Diaudit)
**Deskripsi:** Karyawan, manajer divisi TI, atau operator yang menjalankan proses TI sehari-hari. Mereka adalah sumber data primer yang mengetahui kondisi riil di lapangan.

**Hak Akses (Permissions):**
*   **Akses Kuesioner:** Hanya dapat melihat kuesioner/assessment yang ditugaskan kepada mereka.
*   **Input Data:** 
    *   Mengisi kuesioner dengan memberikan rating kesesuaian berdasarkan skala COBIT Performance Management (N - Not Achieved, P - Partially Achieved, L - Largely Achieved, F - Fully Achieved).
    *   (Opsional) Mengunggah atau menautkan dokumen bukti (evidence) untuk mendukung jawaban mereka.
*   **Submit Assessment:** Mengirimkan jawaban yang sudah final ke sistem untuk diolah oleh backend.
*   **View Own Results:** (Tergantung kebijakan perusahaan) Auditee mungkin diberikan hak untuk melihat skor pada proses yang mereka ampu saja.

**Tampilan Utama (UI):**
*   Daftar Tugas (To-Do List Kuesioner).
*   Formulir Pengisian Kuesioner yang intuitif (Wizard/Step-by-step).

---

## Alur Interaksi Antar Agen (Workflow)

1.  **Persiapan (Admin):** Admin masuk ke sistem dan memastikan semua data standar COBIT 2019 (pertanyaan kuesioner) sudah dimasukkan ke dalam sistem. Admin juga membuat akun untuk Assessor dan Auditee.
2.  **Inisiasi (Assessor):** Assessor membuat *Project Assessment* baru, memilih Domain target (misal: DSS), menetapkan target *Capability Level* (To-Be), dan menugaskan kuesioner tersebut kepada Auditee A.
3.  **Eksekusi (Auditee):** Auditee A mendapat notifikasi, *login* ke sistem, dan menjawab kuesioner (As-Is) sesuai kondisi riil. Setelah selesai, Auditee menekan tombol "Submit".
4.  **Kalkulasi (Sistem/Backend):** Mesin Golang secara otomatis mengonversi jawaban N-P-L-F Auditee menjadi skor *Capability Level*.
5.  **Analisis (Assessor):** Assessor *login* kembali, melihat laporan akhir berupa *Radar Chart*, menganalisis jarak kesenjangan (*Gap*), merumuskan rekomendasi, dan mengekspor dokumen final untuk dipresentasikan ke manajemen eksekutif.
