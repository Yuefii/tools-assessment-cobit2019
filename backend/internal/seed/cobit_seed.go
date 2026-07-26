package seed

import (
	"log"

	"github.com/upii/me-tools-cobit2019/backend/internal/model"
	"gorm.io/gorm"
)

// SeedCobitDataFull seeds the complete COBIT 2019 framework data
// covering all 40 Governance & Management Objectives across 5 domains.
// Based on: COBIT 2019 Framework: Introduction and Methodology (ISACA)
// Practices and Activities are paraphrased for localization (Indonesian).
func SeedCobitDataFull(db *gorm.DB) {
	var count int64
	db.Model(&model.CobitDomain{}).Count(&count)
	if count > 0 {
		log.Println("COBIT data already exists, skipping seed.")
		return
	}

	log.Println("Seeding COMPLETE COBIT 2019 Framework data (40 objectives)...")

	domains := []model.CobitDomain{
		// =====================================================================
		// DOMAIN: EDM — Evaluate, Direct and Monitor (5 Objectives)
		// =====================================================================
		{
			Code:        "EDM",
			Name:        "Evaluate, Direct and Monitor",
			Description: "Mencakup tata kelola yang memungkinkan pemangku kepentingan mengevaluasi kebutuhan, kondisi dan pilihan TI; menetapkan arah melalui pengambilan keputusan; dan memantau kepatuhan, kinerja dan kemajuan terhadap arah yang disepakati.",
			Objectives: []model.CobitObjective{
				{
					Code:        "EDM01",
					Name:        "Ensured Governance Framework Setting and Maintenance",
					Description: "Analisis dan artikulasi persyaratan tata kelola TI perusahaan serta desain, penetapan, dan pemeliharaan sistem tata kelola yang efektif.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM01.01",
							Name:        "Evaluate the governance system",
							Description: "Evaluasi secara berkelanjutan lingkungan, kapabilitas, dan kematangan sistem tata kelola TI perusahaan.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi apakah sistem tata kelola TI saat ini sudah mencerminkan kebutuhan dan prioritas bisnis perusahaan secara keseluruhan."},
								{Description: "Bandingkan pendekatan tata kelola TI perusahaan dengan standar dan praktik terbaik industri yang relevan (mis. COBIT, ISO 38500)."},
								{Description: "Tentukan apakah model pengambilan keputusan TI sudah jelas dan dipahami oleh seluruh pemangku kepentingan."},
								{Description: "Evaluasi efektivitas komite pengarah TI atau badan tata kelola sejenis dalam mengawasi investasi dan risiko TI."},
							},
						},
						{
							Code:        "EDM01.02",
							Name:        "Direct the governance system",
							Description: "Informasikan kepemimpinan dan dapatkan dukungan, komitmen, serta pendanaan untuk implementasi tata kelola TI yang efektif.",
							Activities: []model.CobitActivity{
								{Description: "Pastikan bahwa prinsip-prinsip tata kelola TI telah dikomunikasikan kepada seluruh pemimpin senior dan dewan direksi."},
								{Description: "Tetapkan tanggung jawab, akuntabilitas, dan wewenang yang jelas untuk semua keputusan TI strategis."},
								{Description: "Pastikan tersedianya sumber daya yang memadai untuk melaksanakan program tata kelola TI secara efektif."},
								{Description: "Promosikan budaya akuntabilitas TI di seluruh tingkatan organisasi."},
							},
						},
						{
							Code:        "EDM01.03",
							Name:        "Monitor the governance system",
							Description: "Pantau efektivitas dan kinerja tata kelola TI serta tentukan apakah sistem tata kelola yang ada sudah sesuai tujuan.",
							Activities: []model.CobitActivity{
								{Description: "Pantau secara berkala apakah keputusan tata kelola TI menghasilkan nilai bisnis yang diharapkan."},
								{Description: "Tinjau dan laporkan kepada dewan direksi tentang efektivitas kerangka tata kelola TI secara periodik."},
								{Description: "Identifikasi dan tindaklanjuti deviasi dari sistem tata kelola TI yang telah ditetapkan."},
							},
						},
					},
				},
				{
					Code:        "EDM02",
					Name:        "Ensured Benefits Delivery",
					Description: "Mengoptimalkan kontribusi nilai TI terhadap bisnis dari investasi dan portfolio layanan dan aset TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM02.01",
							Name:        "Evaluate value optimization",
							Description: "Evaluasi terus-menerus portofolio investasi, layanan dan aset TI untuk menentukan kemungkinan nilai bisnis yang optimal.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi apakah investasi TI yang sedang berjalan masih selaras dengan prioritas dan tujuan bisnis saat ini."},
								{Description: "Tinjau apakah portofolio layanan TI memberikan manfaat yang proporsional dengan biaya dan risiko yang ditanggung."},
								{Description: "Bandingkan hasil aktual investasi TI dengan rencana manfaat yang dijanjikan saat investasi disetujui."},
							},
						},
						{
							Code:        "EDM02.02",
							Name:        "Direct value optimization",
							Description: "Arahkan prinsip dan praktik manajemen nilai dan pastikan bahwa konsep nilai TI dipahami dan dipraktikkan.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan standar dan kriteria yang digunakan untuk mengevaluasi nilai investasi TI (mis. ROI, payback period, strategic fit)."},
								{Description: "Pastikan bahwa proses business case digunakan secara konsisten untuk semua investasi TI yang signifikan."},
								{Description: "Dorong budaya akuntabilitas atas manfaat yang dijanjikan dalam setiap proyek TI."},
							},
						},
						{
							Code:        "EDM02.03",
							Name:        "Monitor value optimization",
							Description: "Pantau mekanisme nilai kunci dan metrik terkait nilai dari investasi dan layanan TI.",
							Activities: []model.CobitActivity{
								{Description: "Pantau realisasi manfaat dari investasi TI secara berkala dan laporkan kepada manajemen senior."},
								{Description: "Tinjau apakah proses value management menghasilkan pengambilan keputusan yang lebih baik dan nilai yang optimal."},
							},
						},
					},
				},
				{
					Code:        "EDM03",
					Name:        "Ensured Risk Optimization",
					Description: "Memastikan bahwa risiko TI perusahaan tidak melebihi selera risiko dan toleransi risiko, serta dampak dari risiko TI diidentifikasi dan dikelola.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM03.01",
							Name:        "Evaluate risk management",
							Description: "Evaluasi apakah toleransi risiko perusahaan sudah dipahami dengan baik dan apakah risiko TI yang terjadi berada dalam batas toleransi tersebut.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi apakah risiko TI yang teridentifikasi sudah dipahami oleh pimpinan bisnis dan TI."},
								{Description: "Tinjau apakah proses manajemen risiko TI sudah selaras dengan kerangka manajemen risiko perusahaan secara keseluruhan."},
								{Description: "Tentukan apakah selera risiko (risk appetite) yang ditetapkan mencerminkan realitas bisnis dan kapabilitas TI saat ini."},
							},
						},
						{
							Code:        "EDM03.02",
							Name:        "Direct risk management",
							Description: "Arahkan penetapan praktik manajemen risiko untuk memberikan jaminan yang wajar bahwa risiko TI tidak melebihi selera risiko.",
							Activities: []model.CobitActivity{
								{Description: "Komunikasikan batas toleransi risiko TI yang dapat diterima kepada seluruh fungsi yang relevan dalam organisasi."},
								{Description: "Pastikan bahwa risiko TI yang kritikal dieskalasikan kepada dewan direksi secara tepat waktu."},
								{Description: "Tetapkan kebijakan manajemen risiko TI yang mencerminkan arah strategis perusahaan."},
							},
						},
						{
							Code:        "EDM03.03",
							Name:        "Monitor risk management",
							Description: "Pantau tujuan dan metrik dari proses manajemen risiko TI dan tentukan apakah prosesnya berjalan secara efektif.",
							Activities: []model.CobitActivity{
								{Description: "Tinjau secara berkala efektivitas proses identifikasi, asesmen, dan mitigasi risiko TI."},
								{Description: "Pantau apakah risiko TI yang telah dimitigasi tetap berada dalam batas toleransi yang ditetapkan."},
							},
						},
					},
				},
				{
					Code:        "EDM04",
					Name:        "Ensured Resource Optimisation",
					Description: "Memastikan bahwa kemampuan dan infrastruktur TI yang memadai tersedia untuk mendukung tujuan perusahaan secara efektif dan efisien pada biaya yang optimal.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM04.01",
							Name:        "Evaluate resource management",
							Description: "Evaluasi kebutuhan sumber daya TI saat ini dan masa depan, termasuk orang, proses, dan teknologi.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi apakah sumber daya TI (SDM, infrastruktur, anggaran) sudah dialokasikan secara optimal terhadap prioritas bisnis."},
								{Description: "Tinjau apakah perencanaan kapasitas TI mencerminkan kebutuhan bisnis jangka pendek dan jangka panjang."},
								{Description: "Evaluasi kesesuaian kompetensi SDM TI yang ada dengan kebutuhan strategis organisasi."},
							},
						},
						{
							Code:        "EDM04.02",
							Name:        "Direct resource management",
							Description: "Pastikan prinsip dan praktik pengelolaan sumber daya TI ditetapkan dan diterapkan secara konsisten.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan prinsip dan kebijakan alokasi sumber daya TI yang mendukung tujuan bisnis secara keseluruhan."},
								{Description: "Pastikan ada mekanisme yang efektif untuk menyeimbangkan penggunaan sumber daya TI antara proyek baru dan operasional rutin."},
							},
						},
						{
							Code:        "EDM04.03",
							Name:        "Monitor resource management",
							Description: "Pantau tujuan dan metrik dari proses manajemen sumber daya TI.",
							Activities: []model.CobitActivity{
								{Description: "Pantau utilisasi dan efisiensi sumber daya TI utama (server, SDM, anggaran) secara berkala."},
								{Description: "Tinjau apakah optimisasi sumber daya menghasilkan penghematan biaya dan peningkatan kinerja yang terukur."},
							},
						},
					},
				},
				{
					Code:        "EDM05",
					Name:        "Ensured Stakeholder Engagement",
					Description: "Memastikan bahwa keterlibatan dan komunikasi pemangku kepentingan TI perusahaan adalah transparan, efektif, dan dapat dipercaya.",
					Practices: []model.CobitPractice{
						{
							Code:        "EDM05.01",
							Name:        "Evaluate stakeholder reporting requirements",
							Description: "Evaluasi kebutuhan pelaporan saat ini dan masa depan untuk semua pemangku kepentingan TI.",
							Activities: []model.CobitActivity{
								{Description: "Identifikasi semua pemangku kepentingan TI internal dan eksternal yang memerlukan informasi dan pelaporan TI."},
								{Description: "Evaluasi apakah pelaporan kinerja TI saat ini sudah memenuhi kebutuhan transparansi dari dewan direksi dan regulator."},
							},
						},
						{
							Code:        "EDM05.02",
							Name:        "Direct stakeholder communication and reporting",
							Description: "Pastikan komunikasi kepada pemangku kepentingan efektif dan tepat waktu.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan mekanisme komunikasi yang jelas antara TI dan pemangku kepentingan bisnis utama."},
								{Description: "Pastikan laporan TI kepada dewan direksi dan manajemen senior akurat, tepat waktu, dan relevan."},
								{Description: "Sediakan saluran umpan balik yang efektif agar pemangku kepentingan dapat menyampaikan kekhawatiran terkait TI."},
							},
						},
						{
							Code:        "EDM05.03",
							Name:        "Monitor stakeholder engagement",
							Description: "Pantau efektivitas keterlibatan pemangku kepentingan TI.",
							Activities: []model.CobitActivity{
								{Description: "Tinjau secara berkala tingkat kepuasan pemangku kepentingan terhadap komunikasi dan pelaporan TI."},
								{Description: "Pantau apakah isu TI yang dieskalasikan oleh pemangku kepentingan ditangani secara tepat waktu."},
							},
						},
					},
				},
			},
		},

		// =====================================================================
		// DOMAIN: APO — Align, Plan and Organise (14 Objectives)
		// =====================================================================
		{
			Code:        "APO",
			Name:        "Align, Plan and Organise",
			Description: "Mencakup strategi dan taktik, serta identifikasi cara terbaik TI dapat berkontribusi pada pencapaian tujuan bisnis. Realisasi visi strategis perlu direncanakan, dikomunikasikan, dan dikelola untuk perspektif yang berbeda.",
			Objectives: []model.CobitObjective{
				{
					Code:        "APO01",
					Name:        "Managed I&T Management Framework",
					Description: "Memperjelas dan menjaga misi dan visi TI serta menerapkan dan memelihara mekanisme serta otoritas untuk mengelola informasi dan teknologi.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO01.01",
							Name:        "Define the organizational structure",
							Description: "Tetapkan struktur organisasi TI yang internal dan tata kelola yang mencerminkan kebutuhan bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan dan dokumentasikan struktur organisasi TI termasuk komite pengarah, unit TI, dan perannya masing-masing."},
								{Description: "Pastikan struktur organisasi TI mendukung kolaborasi yang efektif antara fungsi bisnis dan TI."},
								{Description: "Tinjau dan perbarui struktur organisasi TI secara berkala untuk menyesuaikan perubahan bisnis."},
							},
						},
						{
							Code:        "APO01.02",
							Name:        "Establish roles and responsibilities",
							Description: "Tetapkan, setujui, dan komunikasikan peran dan tanggung jawab personil TI.",
							Activities: []model.CobitActivity{
								{Description: "Dokumentasikan job description yang jelas untuk semua peran TI, termasuk tanggung jawab dan tingkat otoritas."},
								{Description: "Tetapkan matriks RACI (Responsible, Accountable, Consulted, Informed) untuk proses TI utama."},
								{Description: "Pastikan setiap anggota tim TI memahami peran dan tanggung jawabnya secara jelas."},
							},
						},
						{
							Code:        "APO01.03",
							Name:        "Maintain the enablers of the management system",
							Description: "Pertahankan lingkungan yang memungkinkan penerapan framework TI secara efektif.",
							Activities: []model.CobitActivity{
								{Description: "Kelola dan perbarui kebijakan, standar, dan prosedur TI secara berkala agar tetap relevan."},
								{Description: "Pastikan semua enabler TI (proses, orang, teknologi, informasi) berfungsi secara terintegrasi."},
							},
						},
					},
				},
				{
					Code:        "APO02",
					Name:        "Managed Strategy",
					Description: "Memberikan pandangan holistik tentang bisnis dan lingkungan TI saat ini, mengarahkan strategi TI, dan menghasilkan rencana strategis TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO02.01",
							Name:        "Understand enterprise direction",
							Description: "Pertimbangkan lingkungan bisnis saat ini dan masa depan, tujuan perusahaan, dan persyaratan bisnis untuk TI.",
							Activities: []model.CobitActivity{
								{Description: "Analisis dan dokumentasikan strategi bisnis perusahaan dan implikasinya terhadap kebutuhan TI."},
								{Description: "Identifikasi tren teknologi eksternal yang dapat mempengaruhi strategi TI perusahaan."},
								{Description: "Lakukan analisis kesenjangan antara kemampuan TI saat ini dan yang dibutuhkan untuk mendukung strategi bisnis."},
							},
						},
						{
							Code:        "APO02.02",
							Name:        "Assess the current environment, capabilities and performance",
							Description: "Nilai kemampuan dan kinerja TI saat ini untuk membangun pemahaman yang komprehensif.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan asesmen kematangan kemampuan TI saat ini menggunakan framework yang diakui (mis. COBIT, CMMI)."},
								{Description: "Dokumentasikan kekuatan, kelemahan, peluang, dan ancaman (SWOT) dari lingkungan TI saat ini."},
							},
						},
						{
							Code:        "APO02.03",
							Name:        "Define the target IT capabilities",
							Description: "Tentukan target kemampuan TI yang diperlukan berdasarkan analisis bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan target kemampuan TI jangka pendek (1 tahun) dan jangka panjang (3-5 tahun) yang selaras dengan visi bisnis."},
								{Description: "Prioritaskan inisiatif TI berdasarkan nilai bisnis, urgensi, dan ketersediaan sumber daya."},
							},
						},
						{
							Code:        "APO02.04",
							Name:        "Conduct a gap analysis",
							Description: "Identifikasi celah antara kondisi TI saat ini dengan kondisi yang diinginkan.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan analisis kesenjangan yang komprehensif antara kondisi TI aktual dan target yang ditetapkan."},
								{Description: "Dokumentasikan celah kritis yang perlu segera ditangani untuk mendukung strategi bisnis."},
							},
						},
						{
							Code:        "APO02.05",
							Name:        "Define the strategic plan and road map",
							Description: "Buat rencana strategis TI dan peta jalan yang menjelaskan bagaimana tujuan akan dicapai.",
							Activities: []model.CobitActivity{
								{Description: "Susun rencana strategis TI yang mencakup inisiatif, timeline, anggaran, dan KPI keberhasilan yang jelas."},
								{Description: "Buat peta jalan implementasi yang realistis dengan tahapan yang terukur."},
								{Description: "Dapatkan persetujuan dari dewan direksi dan manajemen senior atas rencana strategis TI."},
							},
						},
						{
							Code:        "APO02.06",
							Name:        "Communicate the IT strategy and direction",
							Description: "Pastikan semua pemangku kepentingan memahami dan mendukung rencana dan strategi TI.",
							Activities: []model.CobitActivity{
								{Description: "Komunikasikan rencana strategis TI kepada seluruh pemangku kepentingan menggunakan media dan bahasa yang tepat."},
								{Description: "Tinjau dan perbarui pemangku kepentingan tentang kemajuan implementasi strategi TI secara berkala."},
							},
						},
					},
				},
				{
					Code:        "APO03",
					Name:        "Managed Enterprise Architecture",
					Description: "Menetapkan arsitektur umum yang terdiri dari proses bisnis, informasi, data, aplikasi, dan lapisan teknologi, yang mencerminkan persyaratan strategi dan tata kelola perusahaan.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO03.01",
							Name:        "Develop the enterprise architecture vision",
							Description: "Ciptakan visi arsitektur enterprise yang mencerminkan tujuan dan strategi bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Definisikan visi arsitektur enterprise yang mencakup lapisan bisnis, data, aplikasi, dan teknologi (TOGAF atau sejenis)."},
								{Description: "Pastikan visi arsitektur mendukung tujuan strategis bisnis dan kebutuhan TI jangka panjang."},
							},
						},
						{
							Code:        "APO03.02",
							Name:        "Define reference architecture",
							Description: "Tetapkan arsitektur referensi yang menjadi standar desain solusi TI.",
							Activities: []model.CobitActivity{
								{Description: "Dokumentasikan arsitektur referensi untuk setiap lapisan (bisnis, data, aplikasi, infrastruktur)."},
								{Description: "Pastikan arsitektur referensi diikuti dalam setiap proyek pengembangan atau pengadaan sistem baru."},
							},
						},
						{
							Code:        "APO03.03",
							Name:        "Select opportunities and solutions",
							Description: "Identifikasi dan evaluasi peluang bisnis yang dapat dimanfaatkan melalui arsitektur TI.",
							Activities: []model.CobitActivity{
								{Description: "Evaluasi teknologi baru terhadap arsitektur enterprise yang ada untuk menentukan kecocokan dan nilai bisnis."},
								{Description: "Identifikasi peluang untuk meningkatkan efisiensi melalui standardisasi dan konsolidasi arsitektur TI."},
							},
						},
					},
				},
				{
					Code:        "APO04",
					Name:        "Managed Innovation",
					Description: "Pertahankan kesadaran terhadap tren TI dan teknologi terkait layanan, mengidentifikasi peluang inovasi, dan merencanakan cara memanfaatkan inovasi untuk menciptakan nilai bisnis.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO04.01",
							Name:        "Create an environment conducive to innovation",
							Description: "Ciptakan lingkungan yang mendorong inovasi TI yang menghasilkan nilai bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan program atau mekanisme formal untuk mendorong inovasi TI dari seluruh jajaran organisasi."},
								{Description: "Sediakan anggaran dan waktu khusus untuk eksplorasi dan proof-of-concept teknologi baru."},
							},
						},
						{
							Code:        "APO04.02",
							Name:        "Identify innovation opportunities",
							Description: "Pantau lingkungan TI eksternal untuk mengidentifikasi tren dan peluang inovasi.",
							Activities: []model.CobitActivity{
								{Description: "Pantau tren teknologi (cloud, AI, IoT, blockchain) dan kaitkan dengan potensi manfaat bisnis."},
								{Description: "Lakukan benchmarking reguler terhadap inovasi TI yang diterapkan oleh kompetitor dan pemimpin industri."},
							},
						},
						{
							Code:        "APO04.03",
							Name:        "Assess the potential and readiness of emerging technologies",
							Description: "Nilai kesiapan dan potensi teknologi baru untuk penerapan dalam konteks bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan proof-of-concept (PoC) untuk teknologi baru sebelum investasi besar-besaran dilakukan."},
								{Description: "Nilai kesiapan organisasi (SDM, proses, infrastruktur) dalam mengadopsi teknologi baru."},
							},
						},
					},
				},
				{
					Code:        "APO05",
					Name:        "Managed Portfolio",
					Description: "Laksanakan arahan strategis untuk investasi sejalan dengan visi arsitektur enterprise, pertimbangkan kategori berbeda dari pengeluaran dan sumber daya yang tersedia.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO05.01",
							Name:        "Establish the target investment mix",
							Description: "Tetapkan komposisi portofolio investasi TI yang optimal untuk mendukung strategi bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Kategorikan investasi TI berdasarkan jenis (run/grow/transform) dan tentukan alokasi anggaran yang optimal untuk setiap kategori."},
								{Description: "Selaraskan komposisi portofolio investasi TI dengan prioritas strategis bisnis."},
							},
						},
						{
							Code:        "APO05.02",
							Name:        "Evaluate and select programs to fund",
							Description: "Evaluasi dan pilih program investasi TI berdasarkan keselarasan strategis, manfaat, dan risiko.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan proses seleksi program TI yang konsisten berdasarkan kriteria strategis, nilai bisnis, dan risiko."},
								{Description: "Pastikan semua program investasi TI yang disetujui memiliki business case yang kuat dan divalidasi."},
							},
						},
						{
							Code:        "APO05.03",
							Name:        "Monitor, optimize and report on investment portfolio performance",
							Description: "Pantau dan optimalkan kinerja portofolio investasi TI secara berkala.",
							Activities: []model.CobitActivity{
								{Description: "Pantau realisasi manfaat dari setiap program dalam portofolio investasi TI secara reguler."},
								{Description: "Lakukan review portofolio secara berkala untuk menyesuaikan prioritas berdasarkan perubahan bisnis."},
							},
						},
					},
				},
				{
					Code:        "APO06",
					Name:        "Managed Budget and Costs",
					Description: "Mengelola aktivitas keuangan TI dalam konteks bisnis melalui proses perencanaan dan penganggaran, manajemen dan pengendalian biaya TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO06.01",
							Name:        "Manage finance and accounting practices",
							Description: "Tetapkan kebijakan dan praktik manajemen keuangan TI yang baik.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan kebijakan dan prosedur penganggaran TI yang jelas, transparan, dan selaras dengan siklus anggaran perusahaan."},
								{Description: "Implementasikan mekanisme pelaporan biaya TI yang akurat dan tepat waktu kepada manajemen."},
							},
						},
						{
							Code:        "APO06.02",
							Name:        "Prioritize resource allocation",
							Description: "Implementasikan proses untuk memastikan anggaran TI dialokasikan secara efektif.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan proses prioritisasi alokasi anggaran TI berdasarkan nilai strategis dan tingkat urgensi."},
								{Description: "Pastikan ada visibilitas yang baik tentang bagaimana anggaran TI dialokasikan kepada pemangku kepentingan."},
							},
						},
						{
							Code:        "APO06.03",
							Name:        "Create and maintain budgets",
							Description: "Siapkan dan kelola anggaran TI yang komprehensif.",
							Activities: []model.CobitActivity{
								{Description: "Susun anggaran TI tahunan yang komprehensif mencakup seluruh komponen biaya (OPEX dan CAPEX)."},
								{Description: "Pantau realisasi anggaran TI secara bulanan dan lakukan analisis varians terhadap rencana."},
							},
						},
						{
							Code:        "APO06.04",
							Name:        "Model and allocate costs",
							Description: "Implementasikan mekanisme alokasi biaya TI yang adil dan transparan kepada unit bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Kembangkan model biaya TI (IT cost model) yang transparan untuk mengalokasikan biaya TI ke unit bisnis."},
								{Description: "Komunikasikan dasar alokasi biaya TI kepada pemimpin unit bisnis agar mereka memahami kontribusi biaya TI."},
							},
						},
					},
				},
				{
					Code:        "APO07",
					Name:        "Managed Human Resources",
					Description: "Menyediakan pendekatan terstruktur untuk memastikan struktur, penempatan, dan pengembangan kompetensi sumber daya manusia TI yang optimal.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO07.01",
							Name:        "Maintain adequate and appropriate staffing",
							Description: "Evaluasi kebutuhan kepegawaian TI secara berkala dan pastikan ketersediaan SDM yang cukup.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan analisis kebutuhan SDM TI secara berkala berdasarkan workload aktual dan rencana ke depan."},
								{Description: "Pastikan level kepegawaian TI mencukupi untuk mendukung operasional dan proyek yang berjalan."},
							},
						},
						{
							Code:        "APO07.02",
							Name:        "Identify key IT personnel",
							Description: "Identifikasi personel TI kunci yang memiliki risiko ketergantungan tinggi.",
							Activities: []model.CobitActivity{
								{Description: "Identifikasi posisi dan individu kunci dalam organisasi TI yang memiliki risiko single point of failure."},
								{Description: "Kembangkan rencana suksesi dan transfer knowledge untuk posisi kritis TI."},
							},
						},
						{
							Code:        "APO07.03",
							Name:        "Maintain the skills and competencies of personnel",
							Description: "Pastikan personel TI memiliki kompetensi yang dibutuhkan.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan penilaian kompetensi SDM TI secara berkala dan buat rencana pengembangan yang sesuai."},
								{Description: "Alokasikan anggaran pelatihan yang memadai untuk meningkatkan kompetensi teknis dan manajerial SDM TI."},
								{Description: "Evaluasi efektivitas program pelatihan TI dalam meningkatkan kinerja dan kompetensi."},
							},
						},
						{
							Code:        "APO07.04",
							Name:        "Evaluate employee job performance",
							Description: "Tetapkan dan laksanakan proses evaluasi kinerja SDM TI yang efektif.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan sistem penilaian kinerja berbasis KPI yang jelas dan terukur untuk seluruh staf TI."},
								{Description: "Lakukan tinjauan kinerja SDM TI secara berkala (min. tahunan) dan berikan umpan balik yang konstruktif."},
							},
						},
						{
							Code:        "APO07.05",
							Name:        "Plan and track the usage of IT and business human resources",
							Description: "Pahami dan pantau permintaan akan sumber daya manusia TI dan rekonsiliasi dengan sumber daya yang tersedia.",
							Activities: []model.CobitActivity{
								{Description: "Kelola utilitas SDM TI melalui perencanaan kapasitas sumber daya manusia yang terstruktur."},
								{Description: "Pantau tingkat utilisasi SDM TI dan sesuaikan penugasan untuk menghindari over/underutilization."},
							},
						},
						{
							Code:        "APO07.06",
							Name:        "Manage contract staff",
							Description: "Pastikan konsultan dan kontraktor TI eksternal memenuhi persyaratan organisasi.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan proses seleksi, onboarding, dan pengawasan yang konsisten untuk kontraktor TI eksternal."},
								{Description: "Pastikan kontrak dengan pihak ketiga mencakup klausul kepatuhan, kerahasiaan, dan keamanan informasi yang memadai."},
							},
						},
					},
				},
				{
					Code:        "APO08",
					Name:        "Managed Relationships",
					Description: "Mengelola hubungan antara bisnis dan TI secara formal dan transparan, memastikan fokus pada pencapaian tujuan bersama.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO08.01",
							Name:        "Understand business expectations",
							Description: "Pahami dan kelola ekspektasi bisnis terhadap TI.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan pertemuan reguler dengan pemimpin bisnis untuk memahami ekspektasi dan kebutuhan mereka terhadap layanan TI."},
								{Description: "Dokumentasikan dan validasi ekspektasi bisnis yang terkait dengan TI secara terstruktur."},
							},
						},
						{
							Code:        "APO08.02",
							Name:        "Identify opportunities, risk and constraints for IT to enhance the business",
							Description: "Identifikasi peluang, risiko, dan kendala TI dalam mendukung bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Proaktif identifikasi peluang TI yang dapat meningkatkan efisiensi atau diferensiasi bisnis."},
								{Description: "Komunikasikan risiko dan kendala TI kepada pemangku kepentingan bisnis secara transparan."},
							},
						},
						{
							Code:        "APO08.03",
							Name:        "Manage the business relationship",
							Description: "Kelola hubungan bisnis-TI secara formal dan konstruktif.",
							Activities: []model.CobitActivity{
								{Description: "Tunjuk Business Relationship Manager (BRM) atau peran sejenis untuk memfasilitasi hubungan TI-bisnis."},
								{Description: "Tangani keluhan dan eskalasi dari sisi bisnis secara profesional dan tepat waktu."},
							},
						},
					},
				},
				{
					Code:        "APO09",
					Name:        "Managed Service Agreements",
					Description: "Menyelaraskan layanan dan tingkat layanan TI dengan kebutuhan dan ekspektasi perusahaan, termasuk identifikasi, spesifikasi, desain, penerbitan, persetujuan, dan pemantauan layanan TI.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO09.01",
							Name:        "Identify IT services",
							Description: "Identifikasi dan katalogkan semua layanan TI yang disediakan kepada bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Buat dan pelihara katalog layanan TI yang komprehensif yang mencerminkan semua layanan yang disediakan kepada bisnis."},
								{Description: "Klasifikasikan layanan TI berdasarkan kritisnya terhadap operasional bisnis."},
							},
						},
						{
							Code:        "APO09.02",
							Name:        "Catalog IT-enabled services",
							Description: "Definisikan dan katalogkan layanan yang didukung TI.",
							Activities: []model.CobitActivity{
								{Description: "Dokumentasikan deskripsi layanan, SLA, biaya, dan dependensi untuk setiap layanan TI dalam katalog."},
								{Description: "Pastikan katalog layanan TI selalu diperbarui dan dapat diakses oleh pengguna layanan."},
							},
						},
						{
							Code:        "APO09.03",
							Name:        "Define and prepare service agreements",
							Description: "Susun dan kelola perjanjian tingkat layanan (SLA/OLA) yang efektif.",
							Activities: []model.CobitActivity{
								{Description: "Susun SLA yang mencakup target ketersediaan, kinerja, waktu respons, dan mekanisme eskalasi untuk setiap layanan TI kritikal."},
								{Description: "Dapatkan persetujuan formal dari bisnis dan TI atas SLA yang ditetapkan."},
								{Description: "Tinjau dan perbarui SLA secara berkala agar sesuai dengan perkembangan kebutuhan bisnis."},
							},
						},
						{
							Code:        "APO09.04",
							Name:        "Monitor and report service levels",
							Description: "Pantau pencapaian tingkat layanan dan laporkan hasilnya.",
							Activities: []model.CobitActivity{
								{Description: "Pantau pencapaian target SLA secara berkala dan laporkan hasilnya kepada manajemen dan unit bisnis."},
								{Description: "Lakukan analisis tren kinerja layanan untuk mengidentifikasi area yang memerlukan peningkatan."},
							},
						},
					},
				},
				{
					Code:        "APO10",
					Name:        "Managed Vendors",
					Description: "Mengelola layanan yang diberikan oleh semua jenis vendor untuk memenuhi persyaratan bisnis, termasuk seleksi vendor, kontrak, pemantauan, dan review kinerja.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO10.01",
							Name:        "Identify and evaluate vendor relationships and contracts",
							Description: "Identifikasi dan evaluasi hubungan dan kontrak dengan vendor TI.",
							Activities: []model.CobitActivity{
								{Description: "Buat dan kelola inventarisasi semua vendor dan kontrak TI yang aktif, termasuk nilai, durasi, dan ketentuan kritis."},
								{Description: "Kategorikan vendor berdasarkan tingkat ketergantungan dan risiko bagi bisnis."},
							},
						},
						{
							Code:        "APO10.02",
							Name:        "Select vendors",
							Description: "Pilih vendor berdasarkan praktik pengadaan yang adil dan transparan.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan proses seleksi vendor yang formal dan transparan berdasarkan kriteria teknis, finansial, dan keamanan."},
								{Description: "Lakukan due diligence yang memadai terhadap vendor yang akan menangani data atau sistem kritikal."},
							},
						},
						{
							Code:        "APO10.03",
							Name:        "Manage vendor contracts and relationships",
							Description: "Kelola kontrak vendor dan hubungan secara efektif sepanjang siklus hidup kontrak.",
							Activities: []model.CobitActivity{
								{Description: "Pantau kinerja vendor secara berkala berdasarkan KPI yang disepakati dalam kontrak."},
								{Description: "Kelola proses eskalasi dan penyelesaian sengketa dengan vendor secara formal."},
							},
						},
						{
							Code:        "APO10.04",
							Name:        "Manage vendor risk",
							Description: "Identifikasi dan kelola risiko yang terkait dengan vendor TI.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan asesmen risiko vendor secara berkala, terutama untuk vendor yang mengelola data sensitif atau sistem kritikal."},
								{Description: "Pastikan kontrak vendor mencakup klausul keamanan informasi, kontinuitas layanan, dan hak audit."},
							},
						},
					},
				},
				{
					Code:        "APO11",
					Name:        "Managed Quality",
					Description: "Mendefinisikan dan mengkomunikasikan standar kualitas TI yang mencerminkan kebutuhan organisasi, untuk memastikan bahwa strategi dan tujuan TI dipenuhi secara efektif.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO11.01",
							Name:        "Establish a quality management system (QMS)",
							Description: "Tetapkan dan kelola sistem manajemen kualitas untuk TI.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan dan dokumentasikan sistem manajemen kualitas TI (QMS) yang mencakup standar, prosedur, dan metrik kualitas."},
								{Description: "Pastikan QMS TI selaras dengan standar kualitas yang diakui (mis. ISO 9001) jika relevan."},
							},
						},
						{
							Code:        "APO11.02",
							Name:        "Define and manage quality standards, practices and procedures",
							Description: "Identifikasi dan kelola standar, praktik, dan prosedur kualitas TI.",
							Activities: []model.CobitActivity{
								{Description: "Definisikan standar kualitas yang terukur untuk pengembangan perangkat lunak, infrastruktur, dan layanan TI."},
								{Description: "Terapkan mekanisme jaminan kualitas (QA) dalam siklus hidup pengembangan sistem."},
							},
						},
						{
							Code:        "APO11.03",
							Name:        "Focus quality management on customers",
							Description: "Fokuskan manajemen kualitas pada kepuasan pengguna dan pelanggan.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan survei kepuasan pengguna TI secara berkala untuk mengukur persepsi kualitas layanan TI."},
								{Description: "Tindaklanjuti keluhan dan masukan pengguna sebagai input perbaikan kualitas layanan TI."},
							},
						},
						{
							Code:        "APO11.04",
							Name:        "Perform quality monitoring, control and reviews",
							Description: "Pantau dan kendalikan kualitas TI secara konsisten.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan quality review secara berkala terhadap proses TI utama untuk memastikan kepatuhan terhadap standar yang ditetapkan."},
								{Description: "Pantau tren kualitas dan lakukan tindakan korektif terhadap penyimpangan yang teridentifikasi."},
							},
						},
					},
				},
				{
					Code:        "APO12",
					Name:        "Managed Risk",
					Description: "Mengidentifikasi, menilai, dan mengurangi risiko TI secara berkelanjutan pada tingkat toleransi yang dapat diterima manajemen.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO12.01",
							Name:        "Collect data",
							Description: "Identifikasi dan kumpulkan data relevan untuk mengidentifikasi, menganalisis, dan melaporkan risiko TI.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan proses pengumpulan data risiko TI yang sistematis, termasuk dari insiden, audit, dan asesmen eksternal."},
								{Description: "Dokumentasikan semua risiko TI yang teridentifikasi dalam register risiko terpusat yang dikelola secara aktif."},
							},
						},
						{
							Code:        "APO12.02",
							Name:        "Analyze risk",
							Description: "Kembangkan informasi yang berguna untuk mendukung keputusan risiko.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan analisis risiko TI secara kuantitatif atau kualitatif untuk menentukan dampak dan probabilitas terjadinya risiko."},
								{Description: "Prioritaskan risiko TI berdasarkan hasil analisis dampak dan probabilitas untuk menentukan respons yang tepat."},
							},
						},
						{
							Code:        "APO12.03",
							Name:        "Maintain a risk profile",
							Description: "Buat dan pertahankan profil risiko TI yang komprehensif dan terkini.",
							Activities: []model.CobitActivity{
								{Description: "Perbarui register risiko TI secara berkala untuk mencerminkan risiko baru, perubahan status, dan efektivitas kontrol."},
								{Description: "Laporkan profil risiko TI kepada manajemen senior dan dewan direksi secara berkala."},
							},
						},
						{
							Code:        "APO12.04",
							Name:        "Articulate risk",
							Description: "Berikan informasi tentang kondisi risiko TI yang aktual kepada semua pemangku kepentingan untuk keputusan yang tepat.",
							Activities: []model.CobitActivity{
								{Description: "Komunikasikan risiko TI yang kritikal kepada manajemen senior dengan cara yang mudah dipahami dan relevan bagi bisnis."},
								{Description: "Pastikan laporan risiko TI mencakup rekomendasi tindakan mitigasi yang dapat dilaksanakan."},
							},
						},
						{
							Code:        "APO12.05",
							Name:        "Define a risk management action portfolio",
							Description: "Kelola portofolio opsi respons risiko TI untuk meminimalkan risiko residual.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan strategi respons risiko (mitigate, transfer, accept, avoid) untuk setiap risiko TI yang signifikan."},
								{Description: "Pastikan rencana mitigasi risiko TI memiliki PIC, anggaran, dan timeline yang jelas."},
							},
						},
						{
							Code:        "APO12.06",
							Name:        "Respond to risk",
							Description: "Responlah terhadap risiko yang terwujud secara tepat waktu.",
							Activities: []model.CobitActivity{
								{Description: "Terapkan prosedur eskalasi risiko TI yang jelas agar insiden risiko ditangani secara tepat waktu."},
								{Description: "Lakukan review pasca insiden untuk memahami penyebab dan mencegah pengulangan."},
							},
						},
					},
				},
				{
					Code:        "APO13",
					Name:        "Managed Security",
					Description: "Mendefinisikan, mengoperasikan, dan memantau sistem untuk manajemen keamanan informasi.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO13.01",
							Name:        "Establish and maintain an ISMS",
							Description: "Tetapkan dan kelola Information Security Management System (ISMS).",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan kebijakan keamanan informasi yang komprehensif yang disetujui oleh manajemen senior."},
								{Description: "Implementasikan ISMS sesuai dengan standar yang diakui (mis. ISO/IEC 27001) untuk memastikan keamanan informasi yang sistematis."},
								{Description: "Tinjau dan perbarui kebijakan keamanan informasi secara berkala (min. tahunan)."},
							},
						},
						{
							Code:        "APO13.02",
							Name:        "Define and manage an information security risk treatment plan",
							Description: "Kelola dan pelihara rencana penanganan risiko keamanan informasi.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan asesmen risiko keamanan informasi secara berkala dan dokumentasikan hasilnya dalam risk register."},
								{Description: "Kembangkan dan implementasikan rencana penanganan risiko keamanan yang mencakup kontrol teknis dan non-teknis."},
							},
						},
						{
							Code:        "APO13.03",
							Name:        "Monitor and review the ISMS",
							Description: "Pantau dan tinjau ISMS untuk memastikan efektivitasnya.",
							Activities: []model.CobitActivity{
								{Description: "Lakukan audit internal ISMS secara berkala untuk memastikan kepatuhan terhadap kebijakan dan standar keamanan."},
								{Description: "Lakukan management review ISMS minimal sekali dalam setahun untuk menilai efektivitas dan membuat keputusan perbaikan."},
							},
						},
					},
				},
				{
					Code:        "APO14",
					Name:        "Managed Data",
					Description: "Memastikan bahwa aset data perusahaan dikelola sepanjang siklus hidupnya secara efektif untuk mendukung keputusan bisnis yang berbasis data.",
					Practices: []model.CobitPractice{
						{
							Code:        "APO14.01",
							Name:        "Define and communicate the data management strategy",
							Description: "Tetapkan strategi manajemen data yang mendukung tujuan bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan strategi manajemen data yang mencakup tata kelola data, kualitas data, keamanan data, dan siklus hidup data."},
								{Description: "Komunikasikan strategi manajemen data kepada seluruh pemangku kepentingan yang relevan."},
							},
						},
						{
							Code:        "APO14.02",
							Name:        "Define and maintain a data model",
							Description: "Buat dan kelola model data perusahaan yang komprehensif.",
							Activities: []model.CobitActivity{
								{Description: "Kembangkan dan kelola model data enterprise yang mencerminkan entitas data bisnis dan hubungannya."},
								{Description: "Pastikan model data enterprise digunakan sebagai referensi dalam pengembangan sistem baru."},
							},
						},
						{
							Code:        "APO14.03",
							Name:        "Manage data quality",
							Description: "Pastikan kualitas data memenuhi standar yang diperlukan untuk penggunaan bisnis.",
							Activities: []model.CobitActivity{
								{Description: "Tetapkan standar kualitas data (accuracy, completeness, consistency, timeliness) untuk data kritikal bisnis."},
								{Description: "Implementasikan kontrol kualitas data di titik masuk data dan terapkan proses pembersihan data secara berkala."},
								{Description: "Pantau dan laporkan kualitas data kritis kepada pemilik data dan manajemen secara berkala."},
							},
						},
					},
				},
			},
		},

		// =====================================================================
		// DOMAIN: BAI — Build, Acquire and Implement (11 Objectives)
		// =====================================================================
		{
			Code:        "BAI",
			Name:        "Build, Acquire and Implement",
			Description: "Mencakup identifikasi kebutuhan TI dan perolehan, pengembangan, dan implementasi solusi TI serta integrasinya ke dalam proses bisnis.",
			Objectives: []model.CobitObjective{
				{
					Code:        "BAI01",
					Name:        "Managed Programs",
					Description: "Mengelola semua program dari portofolio investasi yang selaras dengan strategi perusahaan secara terkoordinasi.",
					Practices: []model.CobitPractice{
						{Code: "BAI01.01", Name: "Maintain a standard approach for program management", Description: "Pertahankan pendekatan standar manajemen program.", Activities: []model.CobitActivity{{Description: "Tetapkan dan dokumentasikan metodologi manajemen program TI yang baku (mis. PMBOK, PRINCE2) dan pastikan diikuti oleh semua program."}, {Description: "Latih semua manajer program dalam metodologi yang ditetapkan."}}},
						{Code: "BAI01.02", Name: "Initiate a program", Description: "Inisiasikan program dengan dasar yang kuat.", Activities: []model.CobitActivity{{Description: "Kembangkan business case program yang komprehensif, termasuk manfaat yang diharapkan, biaya, dan risiko."}, {Description: "Dapatkan persetujuan formal sponsor eksekutif dan dewan proyek sebelum memulai program."}}},
						{Code: "BAI01.03", Name: "Manage stakeholder engagement", Description: "Kelola keterlibatan pemangku kepentingan program.", Activities: []model.CobitActivity{{Description: "Identifikasi semua pemangku kepentingan program dan kembangkan rencana keterlibatan yang sesuai."}, {Description: "Komunikasikan kemajuan, perubahan, dan risiko program kepada pemangku kepentingan secara teratur."}}},
						{Code: "BAI01.04", Name: "Develop and maintain the program plan", Description: "Kembangkan dan kelola rencana program yang komprehensif.", Activities: []model.CobitActivity{{Description: "Susun rencana program yang rinci mencakup ruang lingkup, jadwal, sumber daya, anggaran, dan kriteria keberhasilan."}, {Description: "Perbarui rencana program secara reguler berdasarkan kemajuan aktual dan perubahan."}}},
						{Code: "BAI01.05", Name: "Launch and execute the program", Description: "Luncurkan dan laksanakan program secara efektif.", Activities: []model.CobitActivity{{Description: "Pastikan semua sumber daya yang diperlukan tersedia sebelum program diluncurkan."}, {Description: "Pantau progres program secara aktif terhadap rencana dan lakukan tindakan korektif jika diperlukan."}}},
						{Code: "BAI01.06", Name: "Monitor program performance", Description: "Pantau kinerja program secara berkelanjutan.", Activities: []model.CobitActivity{{Description: "Laporkan status program secara berkala kepada sponsor dan komite pengarah menggunakan metrics yang telah disepakati."}, {Description: "Identifikasi risiko program sejak dini dan kelola mitigasinya secara proaktif."}}},
						{Code: "BAI01.07", Name: "Start up and close out projects within the program", Description: "Kelola siklus hidup proyek dalam program.", Activities: []model.CobitActivity{{Description: "Pastikan setiap proyek dalam program memiliki proses formal project initiation dan project closure."}, {Description: "Dokumentasikan pelajaran yang dipetik (lessons learned) dari setiap proyek yang selesai."}}},
						{Code: "BAI01.08", Name: "Manage program risks and issues", Description: "Kelola risiko dan masalah program secara aktif.", Activities: []model.CobitActivity{{Description: "Pertahankan register risiko dan masalah program yang diperbarui secara aktif."}, {Description: "Pastikan ada mekanisme eskalasi yang jelas untuk risiko dan masalah yang tidak dapat diselesaikan di tingkat proyek."}}},
						{Code: "BAI01.09", Name: "Close a program", Description: "Tutup program secara formal.", Activities: []model.CobitActivity{{Description: "Lakukan program closure secara formal, termasuk verifikasi pencapaian manfaat dan penyelesaian semua kewajiban kontraktual."}, {Description: "Dokumentasikan lessons learned dan arsipkan semua dokumen program."}}},
					},
				},
				{
					Code:        "BAI02",
					Name:        "Managed Requirements Definition",
					Description: "Mengidentifikasi solusi dan menganalisis persyaratan sebelum pengadaan atau pembuatan untuk memastikan bahwa solusi TI memenuhi kebutuhan bisnis.",
					Practices: []model.CobitPractice{
						{Code: "BAI02.01", Name: "Define and maintain business functional and technical requirements", Description: "Definisikan persyaratan bisnis dan teknis yang lengkap.", Activities: []model.CobitActivity{{Description: "Kumpulkan dan dokumentasikan persyaratan bisnis fungsional dan non-fungsional dari semua pemangku kepentingan yang relevan."}, {Description: "Validasi persyaratan bersama pemangku kepentingan bisnis sebelum solusi dikembangkan atau diadakan."}}},
						{Code: "BAI02.02", Name: "Perform a feasibility study and formulate alternative solutions", Description: "Lakukan studi kelayakan dan identifikasi alternatif solusi.", Activities: []model.CobitActivity{{Description: "Evaluasi kelayakan teknis, finansial, dan operasional dari berbagai alternatif solusi TI."}, {Description: "Rekomendasikan solusi terbaik berdasarkan analisis biaya-manfaat yang objektif."}}},
						{Code: "BAI02.03", Name: "Manage requirements risk", Description: "Kelola risiko terkait persyaratan.", Activities: []model.CobitActivity{{Description: "Identifikasi dan dokumentasikan risiko yang terkait dengan persyaratan yang tidak jelas, ambigu, atau tidak lengkap."}, {Description: "Terapkan proses review dan validasi persyaratan yang ketat untuk meminimalkan rework di tahap selanjutnya."}}},
						{Code: "BAI02.04", Name: "Obtain approval of requirements and solutions", Description: "Dapatkan persetujuan formal atas persyaratan dan solusi.", Activities: []model.CobitActivity{{Description: "Pastikan semua persyaratan disetujui secara formal oleh pemangku kepentingan bisnis yang berwenang sebelum implementasi dimulai."}}},
					},
				},
				{
					Code:        "BAI03",
					Name:        "Managed Solutions Identification and Build",
					Description: "Menetapkan dan memelihara solusi yang teridentifikasi sesuai dengan persyaratan perusahaan dan mencakup desain, pengembangan, pengadaan/pembuatan, dan pengujian.",
					Practices: []model.CobitPractice{
						{Code: "BAI03.01", Name: "Design high-level solutions", Description: "Rancang solusi tingkat tinggi yang memenuhi persyaratan.", Activities: []model.CobitActivity{{Description: "Kembangkan desain solusi tingkat tinggi yang mencakup arsitektur teknis, integrasi, dan kebutuhan infrastruktur."}, {Description: "Validasikan desain solusi terhadap persyaratan bisnis dan arsitektur enterprise yang berlaku."}}},
						{Code: "BAI03.02", Name: "Design detailed solution components", Description: "Rancang komponen solusi secara rinci.", Activities: []model.CobitActivity{{Description: "Kembangkan desain teknis rinci yang mencakup komponen perangkat lunak, basis data, antarmuka, dan keamanan."}, {Description: "Lakukan design review formal dengan melibatkan arsitek TI dan perwakilan bisnis."}}},
						{Code: "BAI03.03", Name: "Develop solution components", Description: "Kembangkan komponen solusi sesuai standar.", Activities: []model.CobitActivity{{Description: "Kembangkan solusi mengikuti standar pengembangan perangkat lunak yang ditetapkan (coding standards, documentation)."}, {Description: "Lakukan code review dan analisis keamanan kode secara berkala selama pengembangan."}}},
						{Code: "BAI03.04", Name: "Procure solution components", Description: "Lakukan pengadaan komponen solusi yang diperlukan.", Activities: []model.CobitActivity{{Description: "Terapkan proses pengadaan yang sesuai kebijakan perusahaan untuk komponen perangkat lunak atau perangkat keras yang dibeli."}}},
						{Code: "BAI03.05", Name: "Build solutions", Description: "Bangun dan integrasikan solusi sesuai standar.", Activities: []model.CobitActivity{{Description: "Integrasikan semua komponen solusi dan pastikan berfungsi sebagaimana mestinya dalam environment pengujian."}}},
						{Code: "BAI03.06", Name: "Perform quality assurance (QA)", Description: "Lakukan pengujian dan jaminan kualitas solusi.", Activities: []model.CobitActivity{{Description: "Kembangkan rencana pengujian yang komprehensif mencakup unit testing, integration testing, system testing, dan UAT."}, {Description: "Dokumentasikan dan tindaklanjuti semua defect yang ditemukan selama proses pengujian."}}},
						{Code: "BAI03.07", Name: "Prepare for solution testing", Description: "Siapkan lingkungan dan data pengujian.", Activities: []model.CobitActivity{{Description: "Siapkan lingkungan pengujian yang mencerminkan kondisi produksi semirip mungkin."}, {Description: "Gunakan data pengujian yang representatif dan pastikan data sensitif telah di-anonymize."}}},
						{Code: "BAI03.08", Name: "Execute solution testing", Description: "Laksanakan pengujian solusi sesuai rencana.", Activities: []model.CobitActivity{{Description: "Laksanakan semua skenario pengujian sesuai rencana pengujian dan dokumentasikan hasilnya secara lengkap."}, {Description: "Lakukan User Acceptance Testing (UAT) dengan pengguna bisnis yang berwenang."}}},
						{Code: "BAI03.09", Name: "Manage changes to requirements", Description: "Kelola perubahan persyaratan secara terkontrol.", Activities: []model.CobitActivity{{Description: "Terapkan proses manajemen perubahan yang formal untuk setiap perubahan persyaratan selama pengembangan."}, {Description: "Nilai dampak setiap perubahan persyaratan terhadap ruang lingkup, jadwal, dan anggaran sebelum disetujui."}}},
						{Code: "BAI03.10", Name: "Maintain solutions", Description: "Pertahankan dan tingkatkan solusi yang sudah berjalan.", Activities: []model.CobitActivity{{Description: "Terapkan proses manajemen perubahan yang terkontrol untuk semua pembaruan dan perbaikan pada sistem produksi."}}},
					},
				},
				{
					Code:        "BAI04",
					Name:        "Managed Availability and Capacity",
					Description: "Menyeimbangkan kebutuhan bisnis saat ini dan masa depan dengan ketersediaan, kinerja, dan kapasitas TI.",
					Practices: []model.CobitPractice{
						{Code: "BAI04.01", Name: "Assess current availability, performance and capacity and create a baseline", Description: "Nilai ketersediaan dan kapasitas TI saat ini.", Activities: []model.CobitActivity{{Description: "Lakukan asesmen komprehensif terhadap ketersediaan, kinerja, dan kapasitas layanan dan infrastruktur TI yang ada."}, {Description: "Tetapkan baseline kinerja dan kapasitas sebagai acuan pengukuran di masa mendatang."}}},
						{Code: "BAI04.02", Name: "Assess business impact", Description: "Nilai dampak bisnis dari kegagalan ketersediaan TI.", Activities: []model.CobitActivity{{Description: "Lakukan Business Impact Analysis (BIA) untuk menentukan dampak finansial dan operasional dari kegagalan layanan TI kritikal."}, {Description: "Tentukan Recovery Time Objective (RTO) dan Recovery Point Objective (RPO) untuk setiap layanan TI kritis."}}},
						{Code: "BAI04.03", Name: "Plan for new or changed service requirements", Description: "Rencanakan kebutuhan kapasitas untuk layanan baru atau perubahan.", Activities: []model.CobitActivity{{Description: "Kembangkan rencana kapasitas TI berdasarkan proyeksi pertumbuhan bisnis dan rencana inisiatif TI ke depan."}, {Description: "Pastikan infrastruktur TI dapat mengakomodasi pertumbuhan yang diharapkan tanpa degradasi kinerja."}}},
						{Code: "BAI04.04", Name: "Monitor and review availability and capacity", Description: "Pantau dan tinjau ketersediaan dan kapasitas TI.", Activities: []model.CobitActivity{{Description: "Pantau ketersediaan, kinerja, dan kapasitas layanan TI secara real-time dan laporkan penyimpangan secara proaktif."}}},
					},
				},
				{
					Code:        "BAI05",
					Name:        "Managed Organizational Change Enablement",
					Description: "Memaksimalkan kemungkinan keberhasilan implementasi perubahan organisasi yang berhubungan dengan TI secara cepat dan dengan risiko yang minimal.",
					Practices: []model.CobitPractice{
						{Code: "BAI05.01", Name: "Establish the desire to change", Description: "Bangun kesiapan organisasi untuk menerima perubahan.", Activities: []model.CobitActivity{{Description: "Komunikasikan urgensi dan manfaat perubahan yang diinisiasi TI kepada seluruh pemangku kepentingan yang terdampak."}, {Description: "Identifikasi dan libatkan champion perubahan di setiap unit bisnis yang terdampak."}}},
						{Code: "BAI05.02", Name: "Form an effective implementation team", Description: "Bentuk tim implementasi yang efektif.", Activities: []model.CobitActivity{{Description: "Bentuk tim implementasi yang terdiri dari perwakilan TI dan bisnis dengan kompetensi yang relevan dan komitmen penuh."}}},
						{Code: "BAI05.03", Name: "Communicate desired vision", Description: "Komunikasikan visi perubahan yang diinginkan.", Activities: []model.CobitActivity{{Description: "Kembangkan dan sampaikan narasi yang meyakinkan tentang manfaat perubahan kepada semua pihak yang terdampak."}}},
						{Code: "BAI05.04", Name: "Empower role players and identify short-term wins", Description: "Berdayakan pelaksana dan identifikasi pencapaian awal.", Activities: []model.CobitActivity{{Description: "Identifikasi dan rayakan pencapaian awal (quick wins) untuk membangun momentum positif dalam proses perubahan."}}},
						{Code: "BAI05.05", Name: "Enable operation and use", Description: "Aktifkan penggunaan solusi baru melalui pelatihan dan dukungan.", Activities: []model.CobitActivity{{Description: "Siapkan program pelatihan komprehensif yang mencakup semua pengguna yang terdampak oleh sistem atau proses baru."}, {Description: "Sediakan dukungan yang memadai (helpdesk, user guide, pendampingan) selama periode transisi."}}},
						{Code: "BAI05.06", Name: "Embed new approaches", Description: "Tanamkan pendekatan baru dalam budaya organisasi.", Activities: []model.CobitActivity{{Description: "Pantau adopsi perubahan oleh pengguna dan identifikasi hambatan yang perlu ditangani."}, {Description: "Integrasikan praktik baru ke dalam proses bisnis standar dan evaluasi kinerja untuk mendorong kepatuhan."}}},
						{Code: "BAI05.07", Name: "Sustain changes", Description: "Pertahankan perubahan yang berhasil.", Activities: []model.CobitActivity{{Description: "Perbarui kebijakan, prosedur, dan job description untuk mencerminkan cara kerja baru setelah perubahan berhasil."}}},
					},
				},
				{
					Code:        "BAI06",
					Name:        "Managed IT Changes",
					Description: "Mengelola semua perubahan pada infrastruktur TI, aplikasi, dan solusi teknis secara terkontrol, termasuk perubahan darurat, untuk meminimalkan risiko gangguan.",
					Practices: []model.CobitPractice{
						{Code: "BAI06.01", Name: "Evaluate, prioritize and authorize change requests", Description: "Evaluasi, prioritaskan, dan otorisasi permintaan perubahan.", Activities: []model.CobitActivity{{Description: "Terapkan proses formal penerimaan dan pencatatan permintaan perubahan (RFC) melalui sistem manajemen perubahan."}, {Description: "Evaluasi setiap permintaan perubahan untuk dampak teknis, bisnis, keamanan, dan risiko yang mungkin timbul."}, {Description: "Prioritaskan perubahan berdasarkan urgensi dan dampak bisnis, dan dapatkan otorisasi dari Change Advisory Board (CAB)."}}},
						{Code: "BAI06.02", Name: "Manage emergency changes", Description: "Kelola perubahan darurat secara terkontrol.", Activities: []model.CobitActivity{{Description: "Tetapkan prosedur khusus untuk perubahan darurat yang memungkinkan penerapan cepat sambil tetap mempertahankan kontrol."}, {Description: "Pastikan semua perubahan darurat didokumentasikan dan direviuw pasca-implementasi."}}},
						{Code: "BAI06.03", Name: "Track and report all changes", Description: "Lacak dan laporkan semua perubahan TI.", Activities: []model.CobitActivity{{Description: "Pertahankan log perubahan yang komprehensif mencakup semua perubahan, status, dan hasilnya."}, {Description: "Laporkan tren perubahan (volume, berhasil, gagal, rollback) kepada manajemen secara berkala."}}},
						{Code: "BAI06.04", Name: "Close and document the changes", Description: "Tutup dan dokumentasikan perubahan secara formal.", Activities: []model.CobitActivity{{Description: "Pastikan setiap perubahan ditutup secara formal setelah diverifikasi berhasil atau di-rollback."}, {Description: "Perbarui dokumentasi sistem dan konfigurasi untuk mencerminkan perubahan yang telah diterapkan."}}},
					},
				},
				{
					Code:        "BAI07",
					Name:        "Managed IT Change Acceptance and Transitioning",
					Description: "Menerapkan solusi baru atau yang diubah secara resmi, menerima dan mengoperasionalisasikannya, serta menyerahkan kepada proses bisnis yang baru atau yang telah dimodifikasi.",
					Practices: []model.CobitPractice{
						{Code: "BAI07.01", Name: "Establish an implementation plan", Description: "Tetapkan rencana implementasi yang komprehensif.", Activities: []model.CobitActivity{{Description: "Kembangkan rencana deployment yang rinci mencakup langkah-langkah, timeline, rollback plan, dan komunikasi kepada pengguna."}}},
						{Code: "BAI07.02", Name: "Plan business process, system and data conversion", Description: "Rencanakan konversi proses bisnis dan data.", Activities: []model.CobitActivity{{Description: "Rencanakan dan laksanakan migrasi data dari sistem lama ke sistem baru dengan memastikan integritas dan completeness data."}, {Description: "Lakukan validasi data pasca-migrasi untuk memastikan tidak ada data yang hilang atau rusak."}}},
						{Code: "BAI07.03", Name: "Plan acceptance testing", Description: "Rencanakan pengujian penerimaan oleh pengguna.", Activities: []model.CobitActivity{{Description: "Rencanakan dan laksanakan UAT dengan melibatkan pengguna kunci yang merepresentasikan seluruh fungsi bisnis yang terdampak."}}},
						{Code: "BAI07.04", Name: "Establish a test environment", Description: "Siapkan lingkungan pengujian yang memadai.", Activities: []model.CobitActivity{{Description: "Siapkan lingkungan staging/pre-production yang mencerminkan kondisi produksi untuk pengujian akhir sebelum go-live."}}},
						{Code: "BAI07.05", Name: "Perform acceptance tests", Description: "Laksanakan pengujian penerimaan.", Activities: []model.CobitActivity{{Description: "Laksanakan pengujian penerimaan secara terstruktur dan pastikan semua kriteria penerimaan terpenuhi sebelum go-live."}}},
						{Code: "BAI07.06", Name: "Promote to production and manage releases", Description: "Promosikan ke produksi dan kelola rilis.", Activities: []model.CobitActivity{{Description: "Laksanakan proses go-live sesuai rencana deployment yang telah disetujui dan pantau sistem secara intensif pasca-go-live."}, {Description: "Siapkan rollback plan yang siap dieksekusi jika terjadi masalah kritis pasca-go-live."}}},
						{Code: "BAI07.07", Name: "Provide early production support", Description: "Berikan dukungan intensif di awal produksi.", Activities: []model.CobitActivity{{Description: "Sediakan dukungan teknis dan fungsional yang intensif kepada pengguna dalam periode hypercare pasca-go-live."}}},
						{Code: "BAI07.08", Name: "Perform a post-implementation review", Description: "Lakukan review pasca implementasi.", Activities: []model.CobitActivity{{Description: "Lakukan post-implementation review (PIR) setelah sistem berjalan stabil untuk menilai keberhasilan dan pelajaran yang dapat diambil."}}},
					},
				},
				{
					Code:        "BAI08",
					Name:        "Managed Knowledge",
					Description: "Mempertahankan ketersediaan pengetahuan yang relevan, mutakhir, tervalidasi, dan tepercaya untuk mendukung semua aktivitas proses dan memfasilitasi pengambilan keputusan.",
					Practices: []model.CobitPractice{
						{Code: "BAI08.01", Name: "Cultivate and facilitate a knowledge sharing culture", Description: "Kembangkan budaya berbagi pengetahuan.", Activities: []model.CobitActivity{{Description: "Ciptakan insentif dan lingkungan yang mendorong berbagi pengetahuan antar anggota tim TI."}, {Description: "Alokasikan waktu dan sumber daya untuk aktivitas dokumentasi dan transfer pengetahuan."}}},
						{Code: "BAI08.02", Name: "Identify and classify sources of information", Description: "Identifikasi dan klasifikasikan sumber informasi.", Activities: []model.CobitActivity{{Description: "Inventarisasi semua sumber pengetahuan TI yang ada (wiki, prosedur, modul pelatihan) dan klasifikasikan berdasarkan relevansi."}}},
						{Code: "BAI08.03", Name: "Organize and contextualize information into knowledge", Description: "Atur informasi menjadi pengetahuan yang terstruktur.", Activities: []model.CobitActivity{{Description: "Terapkan sistem manajemen pengetahuan (knowledge base) yang memudahkan pencarian dan penggunaan informasi."}}},
						{Code: "BAI08.04", Name: "Use and share knowledge", Description: "Gunakan dan bagikan pengetahuan secara aktif.", Activities: []model.CobitActivity{{Description: "Integrasikan penggunaan knowledge base dalam proses problem solving dan pengambilan keputusan operasional TI."}}},
						{Code: "BAI08.05", Name: "Evaluate and retire information", Description: "Evaluasi dan arsipkan informasi yang sudah kadaluarsa.", Activities: []model.CobitActivity{{Description: "Tinjau dan perbarui konten knowledge base secara berkala untuk memastikan relevansi dan akurasi informasi."}}},
					},
				},
				{
					Code:        "BAI09",
					Name:        "Managed Assets",
					Description: "Mengelola aset TI melalui siklus hidupnya untuk memastikan bahwa nilainya bagi perusahaan dioptimalkan, risiko diminimalkan, dan aset diakuntansikan dengan benar.",
					Practices: []model.CobitPractice{
						{Code: "BAI09.01", Name: "Identify and record current assets", Description: "Identifikasi dan catat aset TI yang ada.", Activities: []model.CobitActivity{{Description: "Pertahankan inventaris aset TI (perangkat keras, perangkat lunak, lisensi, layanan cloud) yang komprehensif dan akurat."}, {Description: "Lakukan rekonsiliasi inventaris aset TI secara berkala untuk memastikan kesesuaian dengan kondisi aktual."}}},
						{Code: "BAI09.02", Name: "Manage critical assets", Description: "Kelola aset TI kritikal secara khusus.", Activities: []model.CobitActivity{{Description: "Identifikasi aset TI kritikal dan terapkan kontrol yang lebih ketat untuk aset tersebut (redudansi, monitoring, keamanan)."}}},
						{Code: "BAI09.03", Name: "Manage the asset life cycle", Description: "Kelola siklus hidup aset TI.", Activities: []model.CobitActivity{{Description: "Rencanakan dan kelola siklus hidup aset TI dari pengadaan hingga penghapusan secara terstruktur."}, {Description: "Pastikan proses penghapusan aset TI dilakukan secara aman, terutama terkait penghapusan data sensitif."}}},
						{Code: "BAI09.04", Name: "Optimize asset costs", Description: "Optimalkan biaya aset TI.", Activities: []model.CobitActivity{{Description: "Analisis total cost of ownership (TCO) dari aset TI utama dan identifikasi peluang optimisasi biaya."}}},
					},
				},
				{
					Code:        "BAI10",
					Name:        "Managed Configuration",
					Description: "Mendefinisikan dan memelihara deskripsi serta hubungan antara sumber daya dan kemampuan kunci yang diperlukan untuk memberikan layanan TI yang diaktifkan oleh TI.",
					Practices: []model.CobitPractice{
						{Code: "BAI10.01", Name: "Establish and maintain a configuration model", Description: "Tetapkan dan kelola model konfigurasi.", Activities: []model.CobitActivity{{Description: "Tetapkan Configuration Management Database (CMDB) sebagai repositori tunggal informasi konfigurasi TI."}, {Description: "Definisikan cakupan, tingkat detail, dan standar penamaan untuk Configuration Items (CI) yang dikelola."}}},
						{Code: "BAI10.02", Name: "Establish and maintain a configuration repository and baseline", Description: "Kelola repositori dan baseline konfigurasi.", Activities: []model.CobitActivity{{Description: "Pastikan semua perubahan konfigurasi tercatat dalam CMDB secara tepat waktu dan akurat."}, {Description: "Tetapkan baseline konfigurasi untuk sistem kritikal sebagai referensi jika terjadi insiden."}}},
						{Code: "BAI10.03", Name: "Maintain and control configuration items", Description: "Kelola dan kendalikan Configuration Items.", Activities: []model.CobitActivity{{Description: "Lakukan audit konfigurasi secara berkala untuk memverifikasi kesesuaian antara CMDB dan kondisi aktual di lingkungan produksi."}}},
						{Code: "BAI10.04", Name: "Produce status and configuration reports", Description: "Hasilkan laporan status dan konfigurasi.", Activities: []model.CobitActivity{{Description: "Laporkan status dan tren perubahan konfigurasi kepada manajemen TI secara berkala."}}},
					},
				},
				{
					Code:        "BAI11",
					Name:        "Managed Projects",
					Description: "Mengelola semua proyek TI dalam program secara terkoordinasi untuk memastikan bahwa ruang lingkup, jadwal, kualitas, dan anggaran proyek sesuai rencana.",
					Practices: []model.CobitPractice{
						{Code: "BAI11.01", Name: "Maintain a standard approach for project management", Description: "Terapkan pendekatan manajemen proyek yang standar.", Activities: []model.CobitActivity{{Description: "Adopsi dan terapkan metodologi manajemen proyek yang baku (mis. PMBOK, PRINCE2, Agile) di seluruh proyek TI."}, {Description: "Sediakan pelatihan metodologi proyek dan sertifikasi bagi manajer proyek TI."}}},
						{Code: "BAI11.02", Name: "Initiate a project", Description: "Inisiasikan proyek secara formal.", Activities: []model.CobitActivity{{Description: "Susun Project Charter yang mendefinisikan tujuan, ruang lingkup, manfaat, anggaran, dan sponsor proyek."}, {Description: "Dapatkan persetujuan formal dari sponsor dan pemangku kepentingan sebelum proyek dimulai."}}},
						{Code: "BAI11.03", Name: "Manage project quality", Description: "Kelola kualitas proyek.", Activities: []model.CobitActivity{{Description: "Tetapkan standar kualitas proyek dan lakukan quality gate review di setiap milestone utama proyek."}}},
						{Code: "BAI11.04", Name: "Manage project risk", Description: "Kelola risiko proyek.", Activities: []model.CobitActivity{{Description: "Identifikasi, analisis, dan kelola risiko proyek secara proaktif menggunakan risk register yang diperbarui secara berkala."}}},
						{Code: "BAI11.05", Name: "Monitor and control projects", Description: "Pantau dan kendalikan kemajuan proyek.", Activities: []model.CobitActivity{{Description: "Pantau progres proyek terhadap rencana (jadwal, anggaran, ruang lingkup) secara berkala dan laporkan status kepada pemangku kepentingan."}}},
						{Code: "BAI11.06", Name: "Manage project change", Description: "Kelola perubahan ruang lingkup proyek.", Activities: []model.CobitActivity{{Description: "Terapkan proses formal change control untuk setiap perubahan ruang lingkup proyek dengan analisis dampak terhadap jadwal dan anggaran."}}},
						{Code: "BAI11.07", Name: "Close a project or iteration", Description: "Tutup proyek atau iterasi secara formal.", Activities: []model.CobitActivity{{Description: "Lakukan project closure secara formal dengan mendokumentasikan lessons learned dan memastikan semua deliverable telah diserahterimakan."}}},
					},
				},
			},
		},

		// =====================================================================
		// DOMAIN: DSS — Deliver, Service and Support (6 Objectives)
		// =====================================================================
		{
			Code:        "DSS",
			Name:        "Deliver, Service and Support",
			Description: "Mencakup penyampaian dan dukungan atas layanan TI, termasuk manajemen keamanan, kontinuitas, dukungan layanan kepada pengguna, dan manajemen data.",
			Objectives: []model.CobitObjective{
				{
					Code:        "DSS01",
					Name:        "Managed Operations",
					Description: "Mengkoordinasikan dan melaksanakan kegiatan dan prosedur operasional yang diperlukan untuk mengsampaikan layanan TI internal dan outsourced.",
					Practices: []model.CobitPractice{
						{Code: "DSS01.01", Name: "Perform operational procedures", Description: "Laksanakan prosedur operasional TI secara konsisten.", Activities: []model.CobitActivity{{Description: "Operasikan infrastruktur TI sesuai jadwal dan prosedur operasional standar yang telah didefinisikan."}, {Description: "Dokumentasikan semua prosedur operasional (runbooks) dan pastikan selalu diperbarui."}, {Description: "Tinjau dan uji prosedur operasional secara berkala untuk memastikan relevansi dan efektivitasnya."}}},
						{Code: "DSS01.02", Name: "Manage outsourced IT services", Description: "Kelola layanan TI yang dialihdayakan secara efektif.", Activities: []model.CobitActivity{{Description: "Pantau kinerja penyedia layanan TI eksternal berdasarkan SLA yang disepakati dan eskalasikan jika target tidak tercapai."}, {Description: "Lakukan review berkala atas hubungan dan kinerja layanan outsourcing TI."}}},
						{Code: "DSS01.03", Name: "Monitor IT infrastructure", Description: "Pantau infrastruktur TI secara proaktif.", Activities: []model.CobitActivity{{Description: "Terapkan monitoring tools untuk memantau ketersediaan, kinerja, dan kapasitas seluruh komponen infrastruktur TI secara real-time."}, {Description: "Tetapkan threshold alert yang sesuai dan pastikan tim TI merespons alert secara tepat waktu."}, {Description: "Analisis tren data monitoring untuk mengidentifikasi potensi masalah sebelum berdampak pada pengguna."}}},
						{Code: "DSS01.04", Name: "Manage the environment", Description: "Kelola lingkungan fisik pusat data.", Activities: []model.CobitActivity{{Description: "Kelola kontrol lingkungan fisik data center (suhu, kelembaban, listrik, fire suppression) sesuai standar yang berlaku."}, {Description: "Pantau dan laporkan kondisi lingkungan fisik data center secara real-time."}}},
						{Code: "DSS01.05", Name: "Manage facilities", Description: "Kelola fasilitas TI.", Activities: []model.CobitActivity{{Description: "Pastikan fasilitas TI (data center, ruang server, jaringan) dipelihara sesuai spesifikasi dan standar keamanan yang berlaku."}}},
					},
				},
				{
					Code:        "DSS02",
					Name:        "Managed Service Requests and Incidents",
					Description: "Memberikan respons yang tepat waktu dan efektif terhadap permintaan pengguna dan resolusi semua jenis insiden.",
					Practices: []model.CobitPractice{
						{Code: "DSS02.01", Name: "Define incident and service request classification schemes", Description: "Tetapkan skema klasifikasi insiden dan permintaan layanan.", Activities: []model.CobitActivity{{Description: "Definisikan dan dokumentasikan skema klasifikasi dan prioritisasi insiden berdasarkan dampak dan urgensi (P1-P4 atau sejenis)."}, {Description: "Komunikasikan skema klasifikasi kepada seluruh staf helpdesk dan pengguna layanan TI."}}},
						{Code: "DSS02.02", Name: "Record, classify and prioritize requests and incidents", Description: "Catat, klasifikasikan, dan prioritaskan insiden.", Activities: []model.CobitActivity{{Description: "Catat semua insiden dan permintaan layanan dalam sistem ticketing segera setelah dilaporkan."}, {Description: "Klasifikasikan dan prioritaskan setiap tiket berdasarkan dampak bisnis dan urgensi sesuai kebijakan yang berlaku."}}},
						{Code: "DSS02.03", Name: "Verify, approve and fulfill service requests", Description: "Verifikasi dan penuhi permintaan layanan.", Activities: []model.CobitActivity{{Description: "Terapkan proses persetujuan yang sesuai untuk permintaan layanan berdasarkan jenis dan level risikonya."}, {Description: "Penuhi permintaan layanan standar melalui proses yang terstandar dan efisien."}}},
						{Code: "DSS02.04", Name: "Investigate, diagnose and allocate incidents", Description: "Investigasi, diagnosa, dan alokasikan insiden.", Activities: []model.CobitActivity{{Description: "Lakukan investigasi awal dan diagnosa setiap insiden secara sistematis untuk menentukan akar masalah."}, {Description: "Alokasikan insiden kepada tim atau individu yang paling tepat berdasarkan jenis dan kategori insiden."}}},
						{Code: "DSS02.05", Name: "Resolve and recover from incidents", Description: "Selesaikan dan pulihkan dari insiden.", Activities: []model.CobitActivity{{Description: "Terapkan solusi sementara (workaround) dengan cepat untuk meminimalkan dampak bisnis dari insiden yang terjadi."}, {Description: "Implementasikan solusi permanen dan dokumentasikan langkah-langkah resolusi untuk referensi di masa mendatang."}}},
						{Code: "DSS02.06", Name: "Close service requests and incidents", Description: "Tutup permintaan layanan dan insiden.", Activities: []model.CobitActivity{{Description: "Konfirmasi kepada pengguna bahwa insiden telah diselesaikan sebelum menutup tiket secara formal."}, {Description: "Lakukan post-incident review untuk insiden P1/P2 untuk mencegah pengulangan."}}},
						{Code: "DSS02.07", Name: "Track status and produce reports", Description: "Pantau status dan hasilkan laporan.", Activities: []model.CobitActivity{{Description: "Pantau KPI manajemen insiden (MTTR, MTBF, first call resolution rate) dan laporkan tren kepada manajemen TI secara berkala."}}},
					},
				},
				{
					Code:        "DSS03",
					Name:        "Managed Problems",
					Description: "Mengidentifikasi dan mengklasifikasikan masalah dan akar penyebabnya, serta memberikan resolusi tepat waktu untuk mencegah insiden berulang.",
					Practices: []model.CobitPractice{
						{Code: "DSS03.01", Name: "Identify and classify problems", Description: "Identifikasi dan klasifikasikan masalah TI.", Activities: []model.CobitActivity{{Description: "Analisis pola insiden berulang secara berkala untuk mengidentifikasi problem yang mendasarinya."}, {Description: "Daftarkan semua problem yang teridentifikasi dalam problem log dan prioritaskan berdasarkan dampak bisnis."}}},
						{Code: "DSS03.02", Name: "Investigate and diagnose problems", Description: "Investigasi dan diagnosa akar penyebab masalah.", Activities: []model.CobitActivity{{Description: "Lakukan Root Cause Analysis (RCA) yang sistematis menggunakan metode yang terstruktur (mis. 5-Why, fishbone diagram)."}, {Description: "Dokumentasikan temuan RCA dan rekomendasikan tindakan perbaikan jangka panjang."}}},
						{Code: "DSS03.03", Name: "Raise known errors", Description: "Catat known error dan solusinya.", Activities: []model.CobitActivity{{Description: "Dokumentasikan semua known error dalam known error database beserta workaround yang tersedia."}, {Description: "Pastikan known error database dapat diakses oleh tim helpdesk untuk mempercepat resolusi insiden serupa."}}},
						{Code: "DSS03.04", Name: "Resolve and close problems", Description: "Selesaikan dan tutup masalah.", Activities: []model.CobitActivity{{Description: "Implementasikan solusi permanen untuk problem setelah melalui proses manajemen perubahan yang sesuai."}, {Description: "Verifikasi efektivitas solusi dan tutup problem record secara formal."}}},
						{Code: "DSS03.05", Name: "Perform proactive problem management", Description: "Lakukan manajemen masalah secara proaktif.", Activities: []model.CobitActivity{{Description: "Analisis tren insiden dan problem secara proaktif untuk mengidentifikasi area yang berisiko tinggi sebelum terjadi insiden."}}},
					},
				},
				{
					Code:        "DSS04",
					Name:        "Managed Continuity",
					Description: "Membangun dan memelihara rencana untuk memungkinkan bisnis dan TI merespons insiden dan gangguan bisnis untuk melanjutkan operasi penting.",
					Practices: []model.CobitPractice{
						{Code: "DSS04.01", Name: "Define the business continuity policy, objectives and scope", Description: "Tetapkan kebijakan dan cakupan business continuity.", Activities: []model.CobitActivity{{Description: "Tetapkan dan dokumentasikan kebijakan kelangsungan bisnis (BCP) yang disetujui manajemen senior, yang mencakup cakupan TI."}, {Description: "Tentukan Recovery Time Objective (RTO) dan Recovery Point Objective (RPO) untuk setiap proses bisnis dan sistem TI kritis."}}},
						{Code: "DSS04.02", Name: "Maintain a continuity strategy", Description: "Pertahankan strategi kelangsungan bisnis yang efektif.", Activities: []model.CobitActivity{{Description: "Kembangkan dan perbarui strategi BCP yang mencakup skenario bencana utama yang relevan bagi organisasi."}, {Description: "Pastikan strategi BCP mencakup kerangka pemulihan TI yang realistis dan telah divalidasi."}}},
						{Code: "DSS04.03", Name: "Develop and implement a business continuity response", Description: "Kembangkan dan implementasikan rencana respons kelangsungan bisnis.", Activities: []model.CobitActivity{{Description: "Dokumentasikan prosedur pemulihan rinci (DRP) untuk setiap sistem TI kritis, termasuk langkah-langkah teknis dan penanggung jawab."}, {Description: "Pastikan prosedur pemulihan bencana dapat dieksekusi oleh tim alternatif jika personel kunci tidak tersedia."}}},
						{Code: "DSS04.04", Name: "Exercise, test and review the BCP/DRP", Description: "Uji dan tinjau BCP/DRP secara berkala.", Activities: []model.CobitActivity{{Description: "Lakukan pengujian BCP/DRP secara berkala (min. sekali per tahun) dengan berbagai skenario untuk memvalidasi efektivitasnya."}, {Description: "Dokumentasikan hasil pengujian dan perbaiki rencana berdasarkan temuan pengujian."}}},
						{Code: "DSS04.05", Name: "Review, maintain and improve the continuity plan", Description: "Tinjau dan tingkatkan rencana kelangsungan bisnis.", Activities: []model.CobitActivity{{Description: "Tinjau BCP/DRP setelah setiap insiden besar, pengujian, atau perubahan signifikan dalam bisnis atau TI."}, {Description: "Pastikan BCP/DRP selalu diperbarui untuk mencerminkan perubahan infrastruktur, proses bisnis, dan ancaman terbaru."}}},
						{Code: "DSS04.06", Name: "Conduct continuity plan training", Description: "Lakukan pelatihan rencana kelangsungan bisnis.", Activities: []model.CobitActivity{{Description: "Berikan pelatihan BCP/DRP kepada semua personel yang memiliki peran dalam pemulihan bencana."}, {Description: "Pastikan seluruh karyawan memahami prosedur evakuasi dan eskalasi dalam situasi darurat."}}},
						{Code: "DSS04.07", Name: "Manage backup arrangements", Description: "Kelola pengaturan backup data dan sistem.", Activities: []model.CobitActivity{{Description: "Terapkan kebijakan backup yang komprehensif (frekuensi, retensi, metode) untuk semua data dan sistem kritis."}, {Description: "Uji pemulihan dari backup secara berkala untuk memastikan data dapat dipulihkan dengan sukses sesuai RTO dan RPO."}}},
					},
				},
				{
					Code:        "DSS05",
					Name:        "Managed Security Services",
					Description: "Melindungi informasi perusahaan untuk mempertahankan tingkat risiko keamanan informasi yang dapat diterima sesuai kebijakan keamanan perusahaan.",
					Practices: []model.CobitPractice{
						{Code: "DSS05.01", Name: "Protect against malware", Description: "Lindungi sistem TI dari malware.", Activities: []model.CobitActivity{{Description: "Instal dan aktifkan solusi antivirus/anti-malware terkini di semua perangkat endpoint dan server."}, {Description: "Lakukan pemindaian malware secara terjadwal dan otomatis, serta respons terhadap setiap ancaman yang terdeteksi."}, {Description: "Pastikan pembaruan signature antivirus dilakukan secara otomatis dan sesegera mungkin."}}},
						{Code: "DSS05.02", Name: "Manage network and connectivity security", Description: "Kelola keamanan jaringan dan konektivitas.", Activities: []model.CobitActivity{{Description: "Terapkan dan kelola firewall, IDS/IPS, dan kontrol keamanan jaringan lainnya sesuai kebijakan yang berlaku."}, {Description: "Segmentasikan jaringan berdasarkan tingkat sensitivitas dan kritisitas sistem (DMZ, internal, trusted zone)."}, {Description: "Pantau dan analisis log jaringan secara berkala untuk mendeteksi anomali dan potensi ancaman."}}},
						{Code: "DSS05.03", Name: "Manage endpoint security", Description: "Kelola keamanan perangkat endpoint.", Activities: []model.CobitActivity{{Description: "Terapkan kebijakan keamanan endpoint yang ketat (enkripsi disk, screen lock, patch management) untuk semua perangkat TI."}, {Description: "Implementasikan solusi Mobile Device Management (MDM) untuk mengamankan perangkat mobile yang mengakses aset perusahaan."}}},
						{Code: "DSS05.04", Name: "Manage user identity and logical access", Description: "Kelola identitas pengguna dan akses logis.", Activities: []model.CobitActivity{{Description: "Terapkan proses provisioning dan de-provisioning akses yang terkontrol berdasarkan prinsip least privilege."}, {Description: "Lakukan review akses pengguna secara berkala untuk memastikan tidak ada hak akses yang berlebihan atau tidak diperlukan."}, {Description: "Implementasikan Multi-Factor Authentication (MFA) untuk akses ke sistem kritikal dan akses remote."}}},
						{Code: "DSS05.05", Name: "Manage physical access to IT assets", Description: "Kelola akses fisik ke aset TI.", Activities: []model.CobitActivity{{Description: "Terapkan kontrol akses fisik yang ketat ke data center dan ruang server (kartu akses, CCTV, log akses)."}, {Description: "Tinjau log akses fisik secara berkala dan investigasi akses yang tidak sah."}}},
						{Code: "DSS05.06", Name: "Manage sensitive documents and output devices", Description: "Kelola dokumen sensitif dan perangkat output.", Activities: []model.CobitActivity{{Description: "Terapkan kebijakan penanganan, penyimpanan, dan pemusnahan dokumen sensitif TI yang sesuai dengan klasifikasi informasi."}}},
						{Code: "DSS05.07", Name: "Monitor the infrastructure for security-related events", Description: "Pantau infrastruktur untuk kejadian terkait keamanan.", Activities: []model.CobitActivity{{Description: "Implementasikan Security Information and Event Management (SIEM) untuk pemantauan keamanan terpusat."}, {Description: "Tetapkan prosedur respons insiden keamanan yang jelas dan uji secara berkala."}}},
					},
				},
				{
					Code:        "DSS06",
					Name:        "Managed Business Process Controls",
					Description: "Mendefinisikan dan mempertahankan kontrol bisnis yang tepat untuk memastikan bahwa informasi yang diproses oleh TI memenuhi semua persyaratan kontrol informasi bisnis.",
					Practices: []model.CobitPractice{
						{Code: "DSS06.01", Name: "Align control activities embedded in business processes with enterprise objectives", Description: "Selaraskan kontrol proses bisnis dengan tujuan enterprise.", Activities: []model.CobitActivity{{Description: "Identifikasi dan dokumentasikan kontrol bisnis yang tertanam dalam proses yang didukung TI."}, {Description: "Verifikasi bahwa kontrol proses bisnis mendukung tujuan kepatuhan dan tata kelola perusahaan."}}},
						{Code: "DSS06.02", Name: "Control the processing of information", Description: "Kendalikan pemrosesan informasi dalam sistem TI.", Activities: []model.CobitActivity{{Description: "Terapkan kontrol input, proses, dan output untuk memastikan akurasi dan integritas data dalam sistem TI."}, {Description: "Pastikan jejak audit (audit trail) yang memadai tersedia untuk semua transaksi bisnis kritis."}}},
						{Code: "DSS06.03", Name: "Manage roles, responsibilities, access privileges and levels of authority", Description: "Kelola peran, tanggung jawab, dan hak akses dalam sistem.", Activities: []model.CobitActivity{{Description: "Terapkan segregation of duties (SoD) untuk mencegah konflik kepentingan dalam proses bisnis yang kritikal."}, {Description: "Kelola hak akses aplikasi bisnis berdasarkan prinsip least privilege dan kebutuhan bisnis yang sah."}}},
						{Code: "DSS06.04", Name: "Manage errors and exceptions", Description: "Kelola kesalahan dan pengecualian dalam proses bisnis.", Activities: []model.CobitActivity{{Description: "Tetapkan proses penanganan error dan exception yang formal dalam sistem bisnis, termasuk eskalasi dan resolusi."}, {Description: "Analisis tren error dan exception untuk mengidentifikasi area yang memerlukan perbaikan kontrol."}}},
						{Code: "DSS06.05", Name: "Ensure traceability of information events and accountabilities", Description: "Pastikan keterlacakan kejadian informasi dan akuntabilitas.", Activities: []model.CobitActivity{{Description: "Implementasikan logging yang komprehensif untuk semua aktivitas pengguna pada sistem bisnis kritis untuk keperluan audit."}, {Description: "Pastikan log tersimpan dengan aman, tidak dapat dimodifikasi, dan dapat diakses untuk keperluan investigasi."}}},
					},
				},
			},
		},

		// =====================================================================
		// DOMAIN: MEA — Monitor, Evaluate and Assess (4 Objectives)
		// =====================================================================
		{
			Code:        "MEA",
			Name:        "Monitor, Evaluate and Assess",
			Description: "Mencakup pemantauan kinerja dan kesesuaian TI terhadap arah dan tujuan kinerja internal dan tujuan pengendalian serta persyaratan eksternal.",
			Objectives: []model.CobitObjective{
				{
					Code:        "MEA01",
					Name:        "Managed Performance and Conformance Monitoring",
					Description: "Mengumpulkan, memvalidasi, dan mengevaluasi tujuan dan metrik bisnis dan TI untuk memonitor kinerja dan kesesuaian.",
					Practices: []model.CobitPractice{
						{Code: "MEA01.01", Name: "Establish a monitoring approach", Description: "Tetapkan pendekatan monitoring yang komprehensif.", Activities: []model.CobitActivity{{Description: "Tetapkan dan dokumentasikan pendekatan monitoring TI yang mencakup semua proses, layanan, dan infrastruktur kritikal."}, {Description: "Identifikasi dan sepakati KPI TI yang relevan dengan pemangku kepentingan bisnis dan TI."}}},
						{Code: "MEA01.02", Name: "Set performance and conformance targets", Description: "Tetapkan target kinerja dan kepatuhan.", Activities: []model.CobitActivity{{Description: "Tetapkan target kinerja yang terukur dan dapat dicapai untuk setiap KPI proses TI yang dipantau."}, {Description: "Selaraskan target kinerja TI dengan SLA yang disepakati dan ekspektasi pemangku kepentingan bisnis."}}},
						{Code: "MEA01.03", Name: "Collect and process performance and conformance data", Description: "Kumpulkan dan proses data kinerja.", Activities: []model.CobitActivity{{Description: "Implementasikan mekanisme pengumpulan data kinerja TI yang otomatis dan handal."}, {Description: "Pastikan data kinerja dikumpulkan secara konsisten, akurat, dan tepat waktu untuk semua KPI yang dipantau."}}},
						{Code: "MEA01.04", Name: "Analyze and report performance", Description: "Analisis dan laporkan kinerja TI.", Activities: []model.CobitActivity{{Description: "Analisis data kinerja TI secara berkala untuk mengidentifikasi tren, anomali, dan area yang memerlukan perhatian."}, {Description: "Hasilkan laporan kinerja TI yang relevan dan mudah dipahami oleh manajemen dan pemangku kepentingan bisnis."}}},
						{Code: "MEA01.05", Name: "Ensure the implementation of corrective actions", Description: "Pastikan tindakan korektif diimplementasikan.", Activities: []model.CobitActivity{{Description: "Tetapkan dan pantau tindakan korektif untuk setiap penyimpangan kinerja yang teridentifikasi."}, {Description: "Verifikasi efektivitas tindakan korektif setelah diimplementasikan."}}},
					},
				},
				{
					Code:        "MEA02",
					Name:        "Managed System of Internal Control",
					Description: "Terus memantau dan mengevaluasi lingkungan kontrol untuk mengidentifikasi dan mempertahankan sistem kontrol internal yang efektif.",
					Practices: []model.CobitPractice{
						{Code: "MEA02.01", Name: "Monitor internal controls", Description: "Pantau kontrol internal TI secara berkelanjutan.", Activities: []model.CobitActivity{{Description: "Implementasikan pemantauan kontrol internal TI secara berkelanjutan menggunakan tools dan teknik yang sesuai."}, {Description: "Identifikasi dan dokumentasikan kelemahan kontrol yang ditemukan melalui pemantauan rutin."}}},
						{Code: "MEA02.02", Name: "Review business process controls effectiveness", Description: "Tinjau efektivitas kontrol proses bisnis.", Activities: []model.CobitActivity{{Description: "Lakukan review efektivitas kontrol bisnis yang tertanam dalam sistem TI secara berkala (min. tahunan)."}, {Description: "Identifikasi kontrol yang tidak efektif atau tidak lagi relevan dan rekomendasikan perbaikan."}}},
						{Code: "MEA02.03", Name: "Perform control self-assessments", Description: "Lakukan self-assessment kontrol internal.", Activities: []model.CobitActivity{{Description: "Terapkan program Control Self-Assessment (CSA) yang memungkinkan pemilik proses mengevaluasi efektivitas kontrol mereka sendiri."}, {Description: "Gunakan hasil CSA sebagai input untuk prioritas audit internal dan perbaikan kontrol."}}},
						{Code: "MEA02.04", Name: "Identify and report control deficiencies", Description: "Identifikasi dan laporkan defisiensi kontrol.", Activities: []model.CobitActivity{{Description: "Dokumentasikan semua defisiensi kontrol yang teridentifikasi dan laporkan kepada manajemen dan pemilik risiko yang relevan."}, {Description: "Pantau tindakan perbaikan atas defisiensi kontrol hingga ditutup secara formal."}}},
					},
				},
				{
					Code:        "MEA03",
					Name:        "Managed Compliance with External Requirements",
					Description: "Mengevaluasi apakah proses TI dan proses bisnis yang didukung TI mematuhi undang-undang, regulasi, dan persyaratan kontrak.",
					Practices: []model.CobitPractice{
						{Code: "MEA03.01", Name: "Identify external compliance requirements", Description: "Identifikasi persyaratan kepatuhan eksternal yang berlaku.", Activities: []model.CobitActivity{{Description: "Identifikasi dan inventarisasi semua regulasi, undang-undang, dan standar eksternal yang berlaku bagi organisasi yang terkait dengan TI."}, {Description: "Pantau perubahan regulasi dan standar eksternal yang dapat mempengaruhi pengelolaan TI secara berkala."}}},
						{Code: "MEA03.02", Name: "Optimize response to external requirements", Description: "Optimalkan respons terhadap persyaratan eksternal.", Activities: []model.CobitActivity{{Description: "Analisis persyaratan kepatuhan eksternal dan terjemahkan ke dalam kebijakan, standar, dan kontrol TI yang spesifik."}, {Description: "Pastikan persyaratan kepatuhan terintegrasi dalam proses pengembangan dan pengoperasian sistem TI."}}},
						{Code: "MEA03.03", Name: "Confirm external compliance", Description: "Konfirmasi kepatuhan terhadap persyaratan eksternal.", Activities: []model.CobitActivity{{Description: "Lakukan asesmen kepatuhan secara berkala untuk memastikan TI memenuhi semua persyaratan regulasi yang berlaku."}, {Description: "Gunakan hasil audit eksternal dan sertifikasi (ISO, SOC2) sebagai bukti kepatuhan kepada pemangku kepentingan."}}},
						{Code: "MEA03.04", Name: "Obtain assurance of external compliance", Description: "Dapatkan jaminan kepatuhan eksternal.", Activities: []model.CobitActivity{{Description: "Lakukan audit eksternal atau sertifikasi pihak ketiga yang independen untuk mendapatkan jaminan kepatuhan regulasi."}, {Description: "Tindaklanjuti temuan audit eksternal secara tepat waktu dan dokumentasikan respons secara formal."}}},
					},
				},
				{
					Code:        "MEA04",
					Name:        "Managed Assurance",
					Description: "Memberikan jaminan independen kepada dewan direksi tentang kepatuhan, kinerja, dan penggunaan TI, serta apakah sistem kontrol TI sudah sesuai.",
					Practices: []model.CobitPractice{
						{Code: "MEA04.01", Name: "Define an assurance scope and objectives", Description: "Definisikan cakupan dan tujuan program assurance TI.", Activities: []model.CobitActivity{{Description: "Tetapkan program audit internal TI yang berbasis risiko dengan cakupan dan tujuan yang jelas."}, {Description: "Prioritaskan area audit TI berdasarkan profil risiko, hasil audit sebelumnya, dan ekspektasi pemangku kepentingan."}}},
						{Code: "MEA04.02", Name: "Assess the appropriateness of the assurance initiative", Description: "Nilai kelayakan inisiatif assurance.", Activities: []model.CobitActivity{{Description: "Evaluasi metodologi dan rencana audit TI untuk memastikan objektivitas, independensi, dan efektivitasnya."}}},
						{Code: "MEA04.03", Name: "Plan assurance initiatives", Description: "Rencanakan inisiatif assurance TI.", Activities: []model.CobitActivity{{Description: "Susun rencana audit TI tahunan yang komprehensif mencakup area, jadwal, sumber daya, dan metodologi yang digunakan."}, {Description: "Koordinasikan rencana audit TI dengan fungsi audit internal, manajemen risiko, dan compliance."}}},
						{Code: "MEA04.04", Name: "Execute assurance initiatives", Description: "Laksanakan inisiatif assurance TI.", Activities: []model.CobitActivity{{Description: "Laksanakan audit TI sesuai rencana dengan mengumpulkan bukti yang memadai dan relevan."}, {Description: "Dokumentasikan temuan, risiko, dan rekomendasi perbaikan dengan jelas dan dapat dipertahankan."}}},
						{Code: "MEA04.05", Name: "Monitor the results of assurance initiatives", Description: "Pantau hasil inisiatif assurance.", Activities: []model.CobitActivity{{Description: "Pantau penyelesaian tindak lanjut atas rekomendasi audit TI oleh manajemen yang bertanggung jawab."}, {Description: "Laporkan status tindak lanjut audit TI kepada dewan direksi atau komite audit secara berkala."}}},
					},
				},
			},
		},
	}

	for i := range domains {
		if err := db.Create(&domains[i]).Error; err != nil {
			log.Printf("Failed to seed domain %s: %v", domains[i].Code, err)
		} else {
			objCount := len(domains[i].Objectives)
			log.Printf("  ✓ Domain %s seeded (%d objectives)", domains[i].Code, objCount)
		}
	}

	log.Println("✅ COBIT 2019 Framework data (40 objectives) seeded successfully!")
}
