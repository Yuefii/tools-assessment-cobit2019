package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/upii/me-tools-cobit2019/backend/internal/handler"
	"github.com/upii/me-tools-cobit2019/backend/internal/middleware"
	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"github.com/upii/me-tools-cobit2019/backend/internal/repository"
	"github.com/upii/me-tools-cobit2019/backend/internal/seed"
	"github.com/upii/me-tools-cobit2019/backend/internal/service"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func seedRoles(db *gorm.DB) {
	roles := []string{"Admin", "Assessor", "Auditee"}
	for _, name := range roles {
		db.FirstOrCreate(&model.Role{}, model.Role{Name: name})
	}
}

func unused_seedCobitData(db *gorm.DB) {
	// Check if data already exists
	var count int64
	db.Model(&model.CobitDomain{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding COBIT 2019 Framework data...")

	domains := []model.CobitDomain{
		{
			Code:        "EDM",
			Name:        "Evaluate, Direct and Monitor",
			Description: "Memastikan bahwa tata kelola TI dilakukan secara efektif untuk mendukung tujuan bisnis perusahaan.",
			Objectives: []model.CobitObjective{
				{
					Code:        "EDM01",
					Name:        "Ensured Governance Framework Setting and Maintenance",
					Description: "Memastikan kerangka kerja tata kelola TI ditetapkan dan dipelihara secara konsisten.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM01.01",
							Name:        "Evaluate the governance system",
							Description: "Evaluasi secara berkelanjutan lingkungan, aset TI dan kemampuan yang diperlukan.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi dan analisa persyaratan tata kelola TI yang diperlukan perusahaan."},
								{Description: "Tentukan dan jaga efektivitas proses tata kelola, melibatkan pemangku kepentingan kunci."},
							},
						},
						{
							Code:        "EDM01.02",
							Name:        "Direct the governance system",
							Description: "Informasikan kepemimpinan dan dapatkan dukungan serta komitmen mereka.",
							Activities: []model.CobitActivity{
								{Description: "Pastikan bahwa kerangka tata kelola dan manajemen TI selaras dengan lingkungan operasional."},
								{Description: "Komunikasikan prinsip-prinsip tata kelola TI kepada seluruh pemangku kepentingan."},
							},
						},
					},
				},
				{
					Code:        "EDM02",
					Name:        "Ensured Benefits Delivery",
					Description: "Mengoptimalkan kontribusi nilai TI terhadap bisnis.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM02.01",
							Name:        "Evaluate value optimization",
							Description: "Evaluasi terus-menerus portofolio investasi, layanan dan aset TI untuk menentukan kemungkinan nilai bisnis yang optimal.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi investasi TI dan bandingkan dengan hasil bisnis yang diharapkan."},
								{Description: "Tinjau portofolio investasi TI secara berkala terhadap tujuan bisnis strategis."},
							},
						},
					},
				},
			},
		},
		{
			Code:        "APO",
			Name:        "Align, Plan and Organise",
			Description: "Mengelola strategi TI secara keseluruhan dan mengorganisasikan sumber daya TI secara optimal.",
			Objectives: []model.CobitObjective{
				{
					Code:        "APO01",
					Name:        "Managed I&T Management Framework",
					Description: "Memperjelas dan menjaga misi dan visi TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO01.01",
							Name:        "Define the organizational structure",
							Description: "Tetapkan struktur organisasi TI yang tepat dan selaraskan dengan model operasi bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan dan dokumentasikan struktur organisasi TI termasuk komite pengarah dan peran tanggung jawab."},
								{Description: "Pastikan struktur organisasi TI mendukung strategi bisnis dan TI."},
							},
						},
						{
							Code:        "APO01.02",
							Name:        "Establish roles and responsibilities",
							Description: "Tetapkan, setujui dan komunikasikan peran dan tanggung jawab personil TI.",
							Activities: []model.CobitActivity{
								{Description: "Identifikasi dan dokumentasikan semua peran dan tanggung jawab yang diperlukan untuk mengelola TI."},
								{Description: "Komunikasikan dengan jelas peran dan tanggung jawab TI kepada semua pemangku kepentingan."},
							},
						},
					},
				},
				{
					Code:        "APO02",
					Name:        "Managed Strategy",
					Description: "Memberikan pandangan yang holistik tentang bisnis saat ini dan lingkungan TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO02.01",
							Name:        "Understand enterprise direction",
							Description: "Pertimbangkan lingkungan bisnis saat ini dan proses bisnis perusahaan serta strategi TI.",
							Activities: []model.CobitActivity{
								{Description: "Pahami dan dokumentasikan arah strategis bisnis serta implikasinya bagi TI."},
								{Description: "Tinjau rencana strategis bisnis dan analisis bagaimana TI dapat mendukungnya."},
							},
						},
					},
				},
			},
		},
		{
			Code:        "BAI",
			Name:        "Build, Acquire and Implement",
			Description: "Mendefinisikan, memperoleh, dan mengimplementasikan solusi TI dan mengintegrasikannya ke dalam proses bisnis.",
			Objectives: []model.CobitObjective{
				{
					Code:        "BAI01",
					Name:        "Managed Programs",
					Description: "Mengelola semua program dalam portofolio investasi selaras dengan strategi perusahaan.",
					Practices: []model.CobitPractice{
						{
							Code:        "BAI01.01",
							Name:        "Maintain a standard approach for program and project management",
							Description: "Pertahankan pendekatan standar untuk manajemen program dan proyek.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan, dokumentasikan dan komunikasikan kerangka kerja standar manajemen program dan proyek."},
								{Description: "Terapkan praktik manajemen proyek yang konsisten di seluruh organisasi."},
							},
						},
						{
							Code:        "BAI01.02",
							Name:        "Initiate a program",
							Description: "Inisiasikan program, jadikan misi dan tujuan program jelas, dan minta persetujuan dari sponsor.",
							Activities: []model.CobitActivity{
								{Description: "Kembangkan kasus bisnis program dan dapatkan persetujuan dari sponsor eksekutif."},
								{Description: "Tentukan tujuan, ruang lingkup, manfaat yang diharapkan, dan risiko program."},
							},
						},
					},
				},
				{
					Code:        "BAI06",
					Name:        "Managed IT Changes",
					Description: "Mengelola semua perubahan pada infrastruktur, aplikasi dan solusi teknis dengan cara yang terkontrol.",
					Practices: []model.CobitPractice{
						{
							Code:        "BAI06.01",
							Name:        "Evaluate, prioritize and authorize change requests",
							Description: "Evaluasi semua permintaan perubahan untuk dampak bisnis dan teknis.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan proses formal untuk menerima dan mencatat permintaan perubahan."},
								{Description: "Evaluasi permintaan perubahan untuk dampak bisnis, teknis dan keamanan."},
								{Description: "Prioritaskan perubahan berdasarkan kebutuhan bisnis dan risiko."},
							},
						},
					},
				},
			},
		},
		{
			Code:        "DSS",
			Name:        "Deliver, Service and Support",
			Description: "Memastikan penyampaian layanan TI sesuai dengan prioritas dan standar yang telah ditetapkan.",
			Objectives: []model.CobitObjective{
				{
					Code:        "DSS01",
					Name:        "Managed Operations",
					Description: "Mengelola operasi TI sehari-hari.",
					Practices: []model.CobitPractice{
						{
							Code:        "DSS01.01",
							Name:        "Perform operational procedures",
							Description: "Pertahankan dan lakukan prosedur operasional yang andal dan konsisten.",
							Activities: []model.CobitActivity{
								{Description: "Pertahankan jadwal aktivitas operasional dan lakukan aktivitas tersebut sesuai jadwal."},
								{Description: "Pastikan semua aktivitas operasional dijalankan sesuai prosedur standar yang berlaku."},
								{Description: "Dokumentasikan dan tinjau secara berkala semua prosedur operasional."},
							},
						},
						{
							Code:        "DSS01.02",
							Name:        "Manage outsourced IT services",
							Description: "Kelola pengoperasian layanan TI eksternal dan integrasikan dengan proses manajemen internal.",
							Activities: []model.CobitActivity{
								{Description: "Integrasikan manajemen layanan TI yang dialihdayakan dengan manajemen TI internal."},
								{Description: "Pastikan penyedia layanan memenuhi SLA yang telah disepakati."},
							},
						},
						{
							Code:        "DSS01.03",
							Name:        "Monitor IT infrastructure",
							Description: "Pantau infrastruktur TI dan kejadian terkait. Simpan informasi pemantauan secara kronologis.",
							Activities: []model.CobitActivity{
								{Description: "Log dan pantau semua peristiwa infrastruktur TI dan ambil tindakan yang tepat."},
								{Description: "Terapkan alat pemantauan untuk memastikan ketersediaan layanan sesuai SLA."},
							},
						},
					},
				},
				{
					Code:        "DSS02",
					Name:        "Managed Service Requests and Incidents",
					Description: "Memberikan respons yang tepat waktu dan efektif terhadap permintaan pengguna dan resolusi semua jenis insiden.",
					Practices: []model.CobitPractice{
						{
							Code:        "DSS02.01",
							Name:        "Define incident and service request classification schemes",
							Description: "Tetapkan skema klasifikasi dan prioritisasi insiden dan permintaan layanan.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan dan komunikasikan skema klasifikasi insiden berdasarkan dampak dan urgensi."},
								{Description: "Pastikan semua insiden diklasifikasikan dan diprioritaskan secara konsisten."},
							},
						},
						{
							Code:        "DSS02.02",
							Name:        "Record, classify and prioritize requests and incidents",
							Description: "Identifikasi, catat, dan klasifikasikan permintaan layanan dan insiden.",
							Activities: []model.CobitActivity{
								{Description: "Catat semua insiden dan permintaan layanan dalam sistem manajemen insiden."},
								{Description: "Kategorikan dan prioritaskan insiden dan permintaan layanan sesuai kebijakan."},
							},
						},
					},
				},
				{
					Code:        "DSS03",
					Name:        "Managed Problems",
					Description: "Mengidentifikasi dan mengklasifikasikan masalah serta penyebab utamanya dan memberikan resolusi tepat waktu.",
					Practices: []model.CobitPractice{
						{
							Code:        "DSS03.01",
							Name:        "Identify and classify problems",
							Description: "Tentukan dan implementasikan kriteria dan prosedur untuk melaporkan masalah.",
							Activities: []model.CobitActivity{
								{Description: "Identifikasi masalah melalui analisis insiden berulang dan tren."},
								{Description: "Klasifikasikan dan prioritaskan masalah untuk penyelidikan lebih lanjut."},
							},
						},
					},
				},
				{
					Code:        "DSS04",
					Name:        "Managed Continuity",
					Description: "Membangun dan memelihara rencana untuk memungkinkan bisnis dan TI merespons insiden dan gangguan.",
					Practices: []model.CobitPractice{
						{
							Code:        "DSS04.01",
							Name:        "Define the business continuity policy, objectives and scope",
							Description: "Tentukan kebijakan, tujuan dan ruang lingkup kelangsungan bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan dan dokumentasikan kebijakan kelangsungan bisnis yang mencakup TI."},
								{Description: "Pastikan rencana pemulihan bencana (DRP) telah diuji secara berkala."},
							},
						},
					},
				},
				{
					Code:        "DSS05",
					Name:        "Managed Security Services",
					Description: "Melindungi informasi perusahaan untuk menjaga tingkat risiko keamanan informasi yang dapat diterima.",
					Practices: []model.CobitPractice{
						{
							Code:        "DSS05.01",
							Name:        "Protect against malware",
							Description: "Implementasikan dan pertahankan langkah-langkah pencegahan, detektif dan korektif.",
							Activities: []model.CobitActivity{
								{Description: "Pasang dan aktifkan alat keamanan malware di semua titik akhir."},
								{Description: "Lakukan pemindaian malware secara terjadwal dan respons terhadap ancaman yang terdeteksi."},
							},
						},
						{
							Code:        "DSS05.02",
							Name:        "Manage network and connectivity security",
							Description: "Gunakan langkah-langkah keamanan dan prosedur terkait untuk melindungi informasi melalui semua metode konektivitas.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan dan kelola firewall, IDS/IPS dan kontrol keamanan jaringan lainnya."},
								{Description: "Pantau dan analisis log jaringan untuk mendeteksi anomali dan potensi ancaman."},
							},
						},
					},
				},
			},
		},
		{
			Code:        "MEA",
			Name:        "Monitor, Evaluate and Assess",
			Description: "Memantau semua proses untuk memastikan kepatuhan terhadap arahan dan tujuan yang telah ditetapkan.",
			Objectives: []model.CobitObjective{
				{
					Code:        "MEA01",
					Name:        "Managed Performance and Conformance Monitoring",
					Description: "Kumpulkan, validasi dan evaluasi tujuan dan metrik bisnis serta TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "MEA01.01",
							Name:        "Establish a monitoring approach",
							Description: "Libatkan pemangku kepentingan untuk membuat dan mempertahankan pendekatan pemantauan.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan dan dokumentasikan pendekatan monitoring untuk seluruh proses TI."},
								{Description: "Identifikasi dan setujui KPI serta metrik kinerja TI dengan pemangku kepentingan."},
							},
						},
						{
							Code:        "MEA01.02",
							Name:        "Set performance and conformance targets",
							Description: "Bekerjalah dengan pemangku kepentingan untuk menentukan dan secara berkala meninjau target.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan target kinerja yang terukur untuk setiap proses TI."},
								{Description: "Tinjau dan sesuaikan target kinerja secara berkala sesuai perubahan kebutuhan bisnis."},
							},
						},
					},
				},
				{
					Code:        "MEA02",
					Name:        "Managed System of Internal Control",
					Description: "Dapatkan jaminan berkelanjutan tentang apakah sistem kontrol internal berjalan efektif dan efisien.",
					Practices: []model.CobitPractice{
						{
							Code:        "MEA02.01",
							Name:        "Monitor internal controls",
							Description: "Pantau terus-menerus, bandingkan dengan target dan perbaiki efektivitas kontrol internal.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan proses pemantauan kontrol internal secara berkala dan berkelanjutan."},
								{Description: "Identifikasi dan dokumentasikan kelemahan kontrol internal serta lakukan perbaikan."},
							},
						},
					},
				},
			},
		},
	}

	for _, domain := range domains {
		if err := db.Create(&domain).Error; err != nil {
			log.Printf("Failed to seed domain %s: %v", domain.Code, err)
		}
	}

	log.Println("COBIT 2019 data seeded successfully!")
}

func initDatabase() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Println("DATABASE_URL is not set, skipping DB connection for now.")
		return
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connection established")
	
	// Fase 2: Auto Migrate Database
	err = DB.AutoMigrate(
		&model.Role{},
		&model.User{},
		&model.CobitDomain{},
		&model.CobitObjective{},
		&model.CobitPractice{},
		&model.CobitActivity{},
		&model.Assessment{},
		&model.AssessmentObjective{},
		&model.Answer{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	// Ensure Admin Role exists
	var adminRole model.Role
	if err := DB.FirstOrCreate(&adminRole, model.Role{Name: "Admin"}).Error; err != nil {
		log.Printf("Failed to create admin role: %v", err)
	}

	// Seed Admin User
	var adminCount int64
	DB.Model(&model.User{}).Where("role_id = ?", adminRole.ID).Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		admin := model.User{
			Name:     "Super Admin",
			Email:    "admin@cobit.com",
			Password: string(hashedPassword),
			RoleID:   adminRole.ID,
		}
		DB.Create(&admin)
		log.Println("Seeded default admin user: admin@cobit.com / admin123")
	}

	seedRoles(DB)
	seed.SeedCobitDataFull(DB)
	seed.SeedAllDemoAssessments(DB) // TODO: hapus/komentari setelah data demo berhasil dibuat

	log.Println("Database Migration Completed!")
}

func main() {
	// Load .env file if exists
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on system environment variables.")
	}

	// Initialize Database
	initDatabase()

	// Dependency Injection
	userRepo := repository.NewUserRepository(DB)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	cobitRepo := repository.NewCobitRepository(DB)
	cobitService := service.NewCobitService(cobitRepo)
	cobitHandler := handler.NewCobitHandler(cobitService)

	assessmentRepo := repository.NewAssessmentRepository(DB)
	assessmentService := service.NewAssessmentService(assessmentRepo)
	assessmentHandler := handler.NewAssessmentHandler(assessmentService)

	reportService := service.NewReportService(assessmentRepo)
	reportHandler := handler.NewReportHandler(reportService)

	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	// Initialize Fiber app
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Basic route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to COBIT 2019 Assessment API",
			"status":  "success",
		})
	})

	// Setup API routes group
	api := app.Group("/api")
	
	// v1 group
	v1 := api.Group("/v1")
	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth routes
	auth := v1.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)

	// COBIT routes
	cobit := v1.Group("/cobit", middleware.Protected())
	cobit.Get("/domains", cobitHandler.GetAllDomains)
	cobit.Get("/domains/:id", cobitHandler.GetDomainByID)
	cobit.Get("/objectives", cobitHandler.GetAllObjectives)
	
	// Admin only routes
	cobit.Post("/domains", middleware.CheckRole("Admin"), cobitHandler.CreateDomain)
	cobit.Post("/objectives", middleware.CheckRole("Admin"), cobitHandler.CreateObjective)
	cobit.Post("/practices", middleware.CheckRole("Admin"), cobitHandler.CreatePractice)
	cobit.Post("/activities", middleware.CheckRole("Admin"), cobitHandler.CreateActivity)

	// Assessment routes
	assessments := v1.Group("/assessments", middleware.Protected())
	assessments.Get("/", assessmentHandler.GetMyAssessments)
	assessments.Get("/:id", assessmentHandler.GetAssessmentDetails)
	assessments.Get("/:id/answers", assessmentHandler.GetAssessmentAnswers)
	
	// Assessor/Admin only
	assessments.Post("/", middleware.CheckRole("Admin", "Assessor"), assessmentHandler.CreateAssessment)
	assessments.Put("/:id/status", middleware.CheckRole("Admin", "Assessor"), assessmentHandler.UpdateAssessmentStatus)
	assessments.Delete("/:id", middleware.CheckRole("Admin", "Assessor"), assessmentHandler.DeleteAssessment)
	
	// Auditee only
	assessments.Post("/answers", middleware.CheckRole("Admin", "Assessor", "Auditee"), assessmentHandler.SubmitAnswer)

	// Report routes
	reports := v1.Group("/reports", middleware.Protected())
	reports.Get("/:id", reportHandler.GenerateReport)

	// User routes
	users := v1.Group("/users", middleware.Protected())
	users.Get("/", middleware.CheckRole("Admin", "Assessor"), userHandler.GetAllUsers)
	users.Post("/", middleware.CheckRole("Admin"), userHandler.CreateUser)
	users.Put("/:id", middleware.CheckRole("Admin"), userHandler.UpdateUser)
	users.Put("/:id/reset-password", middleware.CheckRole("Admin"), userHandler.AdminResetPassword)
	users.Delete("/:id", middleware.CheckRole("Admin"), userHandler.DeleteUser)

	// Current user info (any logged in user)
	v1.Get("/me", middleware.Protected(), userHandler.GetMe)
	v1.Put("/me/password", middleware.Protected(), userHandler.UpdateMyPassword)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // Default port for backend
	}
	
	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
