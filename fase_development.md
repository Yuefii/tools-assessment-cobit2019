# Roadmap & Fase Pengembangan (Development Phases)

Dokumen ini memecah pengembangan aplikasi COBIT 2019 Assessment Tool menjadi beberapa fase yang terstruktur. Tujuannya adalah agar proses *development* lebih mudah dilacak (tracking), terukur, dan kita bisa fokus pada satu bagian pada satu waktu.

---

## 🟢 Fase 1: Setup & Inisialisasi Proyek (Foundation)
**Fokus:** Menyiapkan kerangka kerja dasar untuk Frontend dan Backend.
*   [x] Inisialisasi repositori Git (opsional tapi disarankan).
*   [x] Scaffolding proyek **Golang** (Go Modules) untuk backend.
*   [x] Scaffolding proyek **React + Vite** untuk frontend.
*   [x] Setup koneksi database PostgreSQL di Golang.
*   [x] Desain skema *database* (ERD) awal (User, Role, Domain COBIT).
*   [x] Konfigurasi *routing* dasar di Frontend (React Router) dan Backend (Gin/Fiber).

## 🟡 Fase 2: Backend Core & Autentikasi (API Layer)
**Fokus:** Membangun fondasi sistem keamanan dan manajemen pengguna.
*   [x] Membuat tabel `users` dan `roles` di database.
*   [x] Implementasi sistem *Register* dan *Login* (JWT Authentication) di Golang.
*   [x] Implementasi *Middleware Role-Based Access Control (RBAC)* di Golang.
*   [x] Membuat REST API (CRUD) untuk manajemen *Master Data* COBIT (Domain, Objective, Practice, Activity).
*   [ ] Testing API menggunakan Postman / cURL.

## 🟠 Fase 3: Frontend Core & Integrasi Master Data (UI Layer)
**Fokus:** Membangun antarmuka untuk Admin.
*   [x] Setup *styling* / *UI Library* (misal: TailwindCSS atau framework CSS pilihan) di React.
*   [x] Membuat Halaman Login & integrasi dengan API Auth.
*   [x] Membuat *Layout Dashboard* (Sidebar, Navbar).
*   [x] Membuat Halaman Manajemen Pengguna (User Management UI).
*   [x] Membuat Halaman Master Data COBIT (Formulir untuk menambah/mengedit hierarki COBIT).

## 🔵 Fase 4: Modul Assessment (Core Business Logic)
**Fokus:** Alur kerja Assessor dan Auditee.
*   [x] **Backend:** Membuat tabel `assessments`, `assignments`, dan `answers`.
*   [x] **Backend:** Membuat API untuk Assessor membuat jadwal audit dan menugaskan kuesioner.
*   [x] **Backend:** Membuat API untuk menyimpan jawaban Auditee (Skala N-P-L-F).
*   [x] **Frontend:** Halaman Assessor untuk membuat dan menugaskan kuesioner.
*   [x] **Frontend:** Halaman Auditee berisi daftar tugas (To-Do).
*   [x] **Frontend:** Halaman Wizard pengisian kuesioner oleh Auditee (Form Dinamis).

## 🟣 Fase 5: Mesin Kalkulasi & Pelaporan (Analytics)
**Fokus:** Logika penghitungan spesifik COBIT 2019 dan visualisasi data.
*   [x] **Backend:** Membuat algoritma untuk mengkonversi nilai (N=15%, P=50%, L=85%, F=100%) menjadi *Capability Level* (0-5).
*   [x] **Backend:** Membuat API *Reporting* (mengembalikan data As-Is dan To-Be).
*   [x] **Frontend:** Mengintegrasikan `Recharts` atau `Chart.js` untuk merender **Radar Chart**.
*   [x] **Frontend:** Halaman Laporan Detail & *Gap Analysis* (Selisih nilai dan rekomendasi).
*   [x] **Frontend:** Fitur *Export* Laporan ke format PDF (menggunakan `html2canvas` + `jsPDF`).

## 🏁 Fase 6: Finalisasi, Testing & Deployment
**Fokus:** Memastikan tidak ada *bug* kritikal dan sistem siap digunakan.
*   [ ] Melakukan *User Acceptance Testing* (UAT) berdasarkan *Acceptance Criteria* di BRD.
*   [ ] *Bug fixing* & optimasi performa UI (mengurangi *re-rendering* di React).
*   [ ] Merapikan UI/UX (menambahkan animasi loading, notifikasi sukses/error).
*   [ ] *Deployment* Backend (misal: ke Railway, Render, atau VPS).
*   [ ] *Deployment* Frontend (misal: ke Vercel, Netlify, atau Cloudflare Pages).
