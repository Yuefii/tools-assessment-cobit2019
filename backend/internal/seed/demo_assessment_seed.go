package seed

// =============================================================================
// DEMO ASSESSMENT SEED — PT. NUSANTARA DIGITAL TBK
// =============================================================================
// Skenario: Perusahaan perbankan digital Indonesia yang sedang dalam proses
// assessment COBIT 2019 oleh tim audit internal.
//
// CARA PAKAI (sekali pakai):
//   Tambahkan seed.SeedDemoAssessment(DB) di dalam initDatabase() pada main.go
//   setelah baris seed.SeedCobitDataFull(DB).
//   Hapus atau komentari pemanggilan ini setelah data berhasil diseed.
//
// SKENARIO BISNIS:
//   PT. Nusantara Digital Tbk adalah bank digital yang sedang menghadapi audit
//   tata kelola TI oleh OJK (Otoritas Jasa Keuangan). Mereka diminta untuk
//   mengevaluasi kematangan proses TI dan menargetkan minimal Level 3 (Defined)
//   sesuai ketentuan regulasi perbankan digital Indonesia.
// =============================================================================

import (
	"log"
	"math/rand"

	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedDemoAssessment creates a realistic one-time demo assessment for
// PT. Nusantara Digital Tbk. Safe to call multiple times (idempotent via title check).
func SeedDemoAssessment(db *gorm.DB) {
	// Idempotency guard — skip if demo assessment already exists
	var count int64
	db.Model(&model.Assessment{}).Where("title LIKE ?", "%PT. Nusantara Digital%").Count(&count)
	if count > 0 {
		log.Println("[Demo Seed] Assessment PT. Nusantara Digital sudah ada, skip.")
		return
	}

	log.Println("[Demo Seed] Membuat demo assessment PT. Nusantara Digital Tbk...")

	// ── 1. Pastikan roles tersedia ─────────────────────────────────────────────
	var assessorRole, auditeeRole model.Role
	db.FirstOrCreate(&assessorRole, model.Role{Name: "Assessor"})
	db.FirstOrCreate(&auditeeRole, model.Role{Name: "Auditee"})

	// ── 2. Buat user Assessor (Tim Audit Internal) ────────────────────────────
	hash := func(pw string) string {
		b, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		return string(b)
	}

	assessor := model.User{
		Name:     "Drs. Budi Santoso, CISA",
		Email:    "budi.santoso@nusantaradigital.co.id",
		Password: hash("Assessor@2025"),
		RoleID:   assessorRole.ID,
	}
	db.FirstOrCreate(&assessor, model.User{Email: assessor.Email})

	// ── 3. Buat user Auditee (Kepala Divisi TI) ───────────────────────────────
	auditee := model.User{
		Name:     "Ir. Siti Rahayu, M.T.",
		Email:    "siti.rahayu@nusantaradigital.co.id",
		Password: hash("Auditee@2025"),
		RoleID:   auditeeRole.ID,
	}
	db.FirstOrCreate(&auditee, model.User{Email: auditee.Email})

	// ── 4. Ambil objectives yang akan diases ─────────────────────────────────
	// Fokus penilaian: EDM + APO + DSS (scope audit regulasi OJK)
	targetObjectiveCodes := []string{
		// EDM — Tata Kelola
		"EDM01", "EDM02", "EDM03",
		// APO — Perencanaan & Pengorganisasian
		"APO01", "APO02", "APO03", "APO07", "APO12", "APO13",
		// DSS — Layanan & Dukungan
		"DSS01", "DSS02", "DSS05", "DSS06",
	}

	var objectives []model.CobitObjective
	db.Preload("Practices.Activities").
		Where("code IN ?", targetObjectiveCodes).
		Find(&objectives)

	if len(objectives) == 0 {
		log.Println("[Demo Seed] ⚠ Tidak ada objective COBIT ditemukan. Pastikan SeedCobitDataFull() sudah dijalankan terlebih dahulu.")
		return
	}

	// ── 5. Buat Assessment ────────────────────────────────────────────────────
	assessment := model.Assessment{
		Title:       "Penilaian Kapabilitas Tata Kelola TI — PT. Nusantara Digital Tbk (Q2 2025)",
		TargetLevel: 3, // Target Level 3 (Defined) sesuai regulasi OJK
		Status:      "completed",
		AssessorID:  assessor.ID,
		AuditeeID:   auditee.ID,
		ScopeNote: "Penilaian mencakup domain EDM (Evaluate, Direct and Monitor), " +
			"APO (Align, Plan and Organise), dan DSS (Deliver, Service and Support). " +
			"Dilaksanakan dalam rangka pemenuhan kewajiban audit tata kelola TI " +
			"sesuai POJK No. 11/POJK.03/2022 tentang Penyelenggaraan Teknologi Informasi " +
			"bagi Bank Umum. Periode penilaian: April–Juni 2025.",
	}
	if err := db.Create(&assessment).Error; err != nil {
		log.Printf("[Demo Seed] Gagal membuat assessment: %v", err)
		return
	}

	// ── 6. Daftarkan objectives ke assessment ─────────────────────────────────
	for _, obj := range objectives {
		ao := model.AssessmentObjective{
			AssessmentID: assessment.ID,
			ObjectiveID:  obj.ID,
		}
		db.Create(&ao)
	}

	// ── 7. Buat jawaban realistis per activity ────────────────────────────────
	//
	// Profil kematangan PT. Nusantara Digital Tbk (realistic scenario):
	// - EDM: Sudah cukup baik (governance framework ada, tapi belum optimal) → L2-L3
	// - APO: Campuran — strategi bagus, tapi resource & risk mgmt lemah → L1-L3
	// - DSS: Operasional baik karena sudah live banking, security masih L2 → L2-L3
	//
	// Distribusi skor per objective (N=Not/7.5%, P=Partial/32.5%, L=Largely/67.5%, F=Fully/92.5%)
	// Skor ini dikalibrasi agar menghasilkan level 1.8–3.2 (realitis bank digital mid-size)

	objectiveScoreProfile := map[string][]string{
		// EDM Domain — Governance cukup mapan (bank sudah IPO)
		"EDM01": {"L", "L", "F", "L", "L", "P", "L", "F", "L", "L", "L"},  // ~Level 2.8
		"EDM02": {"L", "P", "L", "L", "P", "L", "P", "L"},                  // ~Level 2.3
		"EDM03": {"P", "L", "P", "P", "L", "L", "P", "L", "P"},             // ~Level 2.0

		// APO Domain — Campuran
		"APO01": {"L", "L", "F", "L", "L", "L", "P", "L", "L", "F", "L"},  // ~Level 2.9 (framework sudah ada)
		"APO02": {"L", "L", "P", "L", "P", "L", "L", "P"},                  // ~Level 2.4 (strategic plan ada tapi parsial)
		"APO03": {"P", "P", "L", "P", "L", "P", "P"},                       // ~Level 1.8 (EA belum mature)
		"APO07": {"L", "L", "L", "F", "L", "L", "P", "L", "L"},             // ~Level 2.7 (HR mgmt lumayan)
		"APO12": {"P", "N", "P", "L", "P", "P", "N", "L", "P"},             // ~Level 1.5 (risk mgmt lemah)
		"APO13": {"P", "L", "P", "P", "L", "P", "L", "P"},                  // ~Level 1.9 (security mgmt parsial)

		// DSS Domain — Operasional live banking
		"DSS01": {"L", "F", "L", "L", "F", "L", "L", "L", "F"},             // ~Level 3.1 (ops sudah terkelola)
		"DSS02": {"L", "L", "L", "F", "L", "L", "L", "F", "L"},             // ~Level 3.0 (incident mgmt baik)
		"DSS05": {"P", "L", "P", "L", "P", "L", "L", "P", "L", "P"},       // ~Level 2.1 (security ops parsial)
		"DSS06": {"L", "L", "P", "L", "L", "P", "L"},                       // ~Level 2.5 (business process ctrl)
	}

	// Seed jawaban
	answersCreated := 0
	for _, obj := range objectives {
		profile, hasProfile := objectiveScoreProfile[obj.Code]
		actIdx := 0

		for _, practice := range obj.Practices {
			for _, activity := range practice.Activities {
				var score string
				if hasProfile && actIdx < len(profile) {
					score = profile[actIdx]
				} else {
					// Fallback: random dengan bias menengah (P atau L)
					choices := []string{"P", "L", "L", "P", "L", "F", "P"}
					score = choices[rand.Intn(len(choices))]
				}
				actIdx++

				answer := model.Answer{
					AssessmentID: assessment.ID,
					ActivityID:   activity.ID,
					ScoreValue:   score,
					EvidenceURL:  evidenceURL(obj.Code, score),
				}
				if err := db.Create(&answer).Error; err != nil {
					log.Printf("[Demo Seed] Gagal menyimpan jawaban activity %d: %v", activity.ID, err)
				} else {
					answersCreated++
				}
			}
		}
	}

	log.Printf("[Demo Seed] ✅ Demo assessment berhasil dibuat!")
	log.Printf("[Demo Seed]    Assessment ID : %d", assessment.ID)
	log.Printf("[Demo Seed]    Perusahaan    : PT. Nusantara Digital Tbk")
	log.Printf("[Demo Seed]    Assessor      : %s (%s)", assessor.Name, assessor.Email)
	log.Printf("[Demo Seed]    Auditee       : %s (%s)", auditee.Name, auditee.Email)
	log.Printf("[Demo Seed]    Objectives    : %d dipilih", len(objectives))
	log.Printf("[Demo Seed]    Jawaban       : %d activities dijawab", answersCreated)
	log.Printf("[Demo Seed]    Target Level  : 3 (Defined)")
	log.Printf("[Demo Seed]    Status        : completed")
	log.Printf("[Demo Seed]")
	log.Printf("[Demo Seed]  ⚠ Hapus/komentari pemanggilan SeedDemoAssessment() di main.go setelah ini.")
}

// evidenceURL generates a realistic-looking evidence document URL based on
// the objective code and score level.
func evidenceURL(objectiveCode, score string) string {
	base := "https://docs.nusantaradigital.co.id/cobit2025/"
	docMap := map[string]string{
		"EDM01": "governance/SK-DIR-2024-001_Kebijakan_Tata_Kelola_TI.pdf",
		"EDM02": "governance/INVEST-2024-RPT_Laporan_Realisasi_Investasi_TI.pdf",
		"EDM03": "governance/RISK-2024-BOARD_Laporan_Risiko_TI_Dewan.pdf",
		"APO01": "framework/SOP-APO01_Kerangka_Manajemen_TI.pdf",
		"APO02": "strategy/RSTRAT-2025_Rencana_Strategis_TI_2025-2027.pdf",
		"APO03": "architecture/EA-2024_Enterprise_Architecture_Blueprint.pdf",
		"APO07": "hr/SDM-TI-2024_Kebijakan_SDM_Teknologi_Informasi.pdf",
		"APO12": "risk/RISKREGISTER-2025-Q1_Risk_Register_TI.pdf",
		"APO13": "security/ISMS-2024_Information_Security_Management_System.pdf",
		"DSS01": "operations/SOP-OPS-001_Prosedur_Operasional_Infrastruktur.pdf",
		"DSS02": "operations/SOP-INCIDENT-002_Manajemen_Insiden_TI.pdf",
		"DSS05": "security/SOC-REPORT-2025Q1_Laporan_Security_Operations.pdf",
		"DSS06": "control/BPC-2024_Business_Process_Control_Framework.pdf",
	}

	if doc, ok := docMap[objectiveCode]; ok {
		if score == "F" || score == "L" {
			return base + doc
		}
		// Partial/Not evidence: dokumen draft atau parsial
		if score == "P" {
			return base + "draft/" + doc
		}
		return "" // N = tidak ada bukti
	}
	return ""
}
