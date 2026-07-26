import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { reportAPI } from '../services/api';

/* ── helpers ─────────────────────────────────────────── */
const levelName = (lvl) => {
  const names = ['Incomplete', 'Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing'];
  return names[Math.floor(lvl)] ?? 'Unknown';
};

const gapRecommendation = (gap, targetLevel) => {
  if (gap === 0) return 'Level target sudah tercapai. Fokus pada pemeliharaan dan optimisasi berkelanjutan.';
  if (gap <= 0.5) return 'Sangat dekat dengan target. Standarisasi dan dokumentasikan proses yang sudah berjalan.';
  if (gap <= 1) return `Diperlukan peningkatan sedang. Formalisasikan proses menuju Level ${targetLevel} melalui SOP tertulis dan tunjuk Process Owner.`;
  if (gap <= 2) return 'Diperlukan peningkatan signifikan. Susun IT Governance Roadmap dan bentuk tim task force untuk program transformasi TI.';
  return 'Diperlukan peningkatan mendasar. Rekomendasikan keterlibatan konsultan tata kelola TI bersertifikat.';
};

/* ── Print styles injected once ─────────────────────── */
const PRINT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @page { size: A4 portrait; margin: 18mm 18mm 18mm 22mm; }
  @media print {
    body { font-family: 'Inter', sans-serif !important; }
    .print-hide { display: none !important; }
    .page-break { break-before: page; }
    .no-break { break-inside: avoid; }
  }
  @media screen {
    .page-break { border-top: 2px dashed #e2e8f0; margin-top: 32px; padding-top: 32px; }
  }
`;

/* ── component ──────────────────────────────────────── */
export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document.getElementById('rpt-style')) {
      const s = document.createElement('style');
      s.id = 'rpt-style';
      s.textContent = PRINT_STYLES;
      document.head.appendChild(s);
    }
    reportAPI.generate(id)
      .then(res => setReport(res.data || res))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="font-semibold text-red-700 text-lg mb-2">Laporan Belum Tersedia</h3>
      <p className="text-red-600 text-sm mb-6">{error}</p>
      <button
        onClick={() => navigate(`/dashboard/assessments/${id}/fill`)}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium"
      >
        Isi Kuesioner Terlebih Dahulu
      </button>
    </div>
  );

  const objectives = report.objectives || [];
  const chartData = objectives.map(o => ({
    subject: o.code,
    'As-Is': parseFloat(o.level.toFixed(2)),
    'To-Be': report.target_level,
    fullMark: 5,
  }));
  const printDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  /* shared styles */
  const cell = { padding: '9px 14px', fontSize: '9.5pt', border: '1px solid #cbd5e1', verticalAlign: 'middle' };
  const th = { ...cell, background: '#1e3a5f', color: '#fff', fontWeight: 700 };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto 80px', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/dashboard/assessments')}
            style={{ padding: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}
          >
            <svg width="20" height="20" fill="none" stroke="#475569" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Laporan Penilaian COBIT 2019</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Pratinjau · Siap cetak</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#1e3a5f', color: 'white',
            padding: '9px 18px', borderRadius: '10px', border: 'none',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer',
          }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Cetak / Ekspor PDF
        </button>
      </div>

      {/* ════════════════════════════════════════════
          DOKUMEN
      ════════════════════════════════════════════ */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

        {/* ══ COVER RINGKAS ══════════════════════════ */}
        <div style={{ padding: '48px 64px 40px', borderBottom: '1px solid #e2e8f0' }}>
          {/* kop */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '3px solid #1e3a5f', paddingBottom: '14px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '8pt', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748b', marginBottom: '2px' }}>Laporan Penilaian Tingkat Kapabilitas</div>
              <div style={{ fontSize: '17pt', fontWeight: 800, color: '#0f172a' }}>Tata Kelola Teknologi Informasi</div>
              <div style={{ fontSize: '11pt', color: '#1e3a5f', marginTop: '2px' }}>Berdasarkan Kerangka Kerja <strong>COBIT 2019</strong></div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#94a3b8', lineHeight: 1.7 }}>
              <div>No. Dok: COBIT-{String(report.assessment_id).padStart(4, '0')}</div>
              <div>{printDate}</div>
            </div>
          </div>

          {/* metadata 2 kolom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '9.5pt' }}>
            {[
              ['Judul Assessment', report.title],
              ['Domain / Ruang Lingkup', report.domain_code || '—'],
              ['Assessor', report.assessor_name || 'Tim Audit Internal'],
              ['Auditee', report.auditee_name || '—'],
              ['Tanggal Pelaksanaan', report.created_at],
              ['Target Capability Level', `Level ${report.target_level} — ${levelName(report.target_level)}`],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', gap: '0', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '7px 12px', background: '#f8fafc', fontWeight: 600, color: '#475569', minWidth: '160px', borderRight: '1px solid #e2e8f0' }}>{label}</div>
                <div style={{ padding: '7px 12px', color: '#1e293b' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ 1. RINGKASAN HASIL ══════════════════════ */}
        <div style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1. Ringkasan Hasil Penilaian
          </h2>

          {/* 3 kartu skor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Tingkat Saat Ini (As-Is)', val: report.current_level?.toFixed(2), sub: levelName(report.current_level), accent: '#2563eb' },
              { label: 'Tingkat Target (To-Be)', val: report.target_level, sub: levelName(report.target_level), accent: '#1e3a5f' },
              {
                label: 'Celah Kapabilitas (Gap)',
                val: report.gap?.toFixed(2),
                sub: report.gap > 0 ? 'Perlu Peningkatan' : 'Target Tercapai',
                accent: report.gap > 0 ? '#dc2626' : '#16a34a',
              },
            ].map((c, i) => (
              <div key={i} className="no-break" style={{ border: `2px solid ${c.accent}`, padding: '16px 18px' }}>
                <div style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{c.label}</div>
                <div style={{ fontSize: '26pt', fontWeight: 800, color: c.accent, lineHeight: 1 }}>{c.val}</div>
                <div style={{ fontSize: '9.5pt', fontWeight: 600, color: '#334155', marginTop: '4px' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Skala referensi */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 18px' }}>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Referensi Capability Level COBIT 2019</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
              {[
                { lvl: 0, name: 'Incomplete', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
                { lvl: 1, name: 'Initial', bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
                { lvl: 2, name: 'Managed', bg: '#fefce8', border: '#fde68a', text: '#92400e' },
                { lvl: 3, name: 'Defined', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
                { lvl: 4, name: 'Quant. Managed', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
                { lvl: 5, name: 'Optimizing', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
              ].map(l => (
                <div key={l.lvl} style={{ background: l.bg, border: `1px solid ${l.border}`, padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14pt', fontWeight: 800, color: l.text }}>{l.lvl}</div>
                  <div style={{ fontSize: '7.5pt', fontWeight: 600, color: l.text, lineHeight: 1.3 }}>{l.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kesimpulan singkat */}
          <div style={{ marginTop: '18px', borderLeft: '4px solid #1e3a5f', padding: '12px 16px', background: '#f8fafc', fontSize: '9.5pt', color: '#334155', lineHeight: 1.7 }}>
            Domain <strong>{report.domain_code}</strong> saat ini berada pada <strong>Level {report.current_level?.toFixed(2)} — {levelName(report.current_level)}</strong>, dengan target <strong>Level {report.target_level} — {levelName(report.target_level)}</strong>.
            {report.gap > 0
              ? <> Terdapat celah sebesar <strong>{report.gap?.toFixed(2)} level</strong> yang perlu ditindaklanjuti melalui program perbaikan terencana.</>
              : <> Target telah tercapai. Fokus selanjutnya adalah mempertahankan dan mengoptimalkan proses yang ada.</>
            }
          </div>
        </div>

        {/* ══ 2. GRAFIK RADAR ═════════════════════════ */}
        <div className="page-break" style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. Peta Radar Kesenjangan (As-Is vs. To-Be)
          </h2>
          <p style={{ fontSize: '9.5pt', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
            Area biru = kondisi aktual (As-Is). Garis putus-putus = target kapabilitas (To-Be). Semakin jauh titik dari pusat berarti semakin baik.
          </p>

          <div style={{ border: '1px solid #e2e8f0', background: '#fafafa', padding: '20px' }} className="no-break">
            <div style={{ height: '360px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ paddingTop: '12px', fontFamily: 'Inter, sans-serif', fontSize: '11px' }} />
                    <Radar name="Target (To-Be)" dataKey="To-Be" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.3} strokeDasharray="6 4" strokeWidth={2} />
                    <Radar name="Current (As-Is)" dataKey="As-Is" stroke="#1e3a5f" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '9.5pt' }}>
                  Data tidak mencukupi untuk merender grafik
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ 3. RINCIAN PER OBJECTIVE ════════════════ */}
        <div className="page-break" style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            3. Rincian Skor per Objective
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse' }} className="no-break">
            <thead>
              <tr>
                <th style={{ ...th, width: '10%' }}>Kode</th>
                <th style={{ ...th, width: '32%' }}>Objective</th>
                <th style={{ ...th, width: '14%', textAlign: 'center' }}>Skor</th>
                <th style={{ ...th, width: '18%', textAlign: 'center' }}>Level As-Is</th>
                <th style={{ ...th, width: '14%', textAlign: 'center' }}>Target</th>
                <th style={{ ...th, width: '12%', textAlign: 'center' }}>Gap</th>
              </tr>
            </thead>
            <tbody>
              {objectives.map((o, i) => {
                const gap = Math.max(0, report.target_level - o.level);
                const hasGap = gap > 0;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                    <td style={{ ...cell, fontWeight: 700 }}>{o.code}</td>
                    <td style={cell}>{o.name}</td>
                    <td style={{ ...cell, textAlign: 'center', fontWeight: 600 }}>
                      {o.score_value?.toFixed(1)}%
                      <div style={{ marginTop: '4px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${o.score_value}%`, background: '#1e3a5f' }} />
                      </div>
                    </td>
                    <td style={{ ...cell, textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '11pt' }}>{o.level?.toFixed(2)}</span>
                      <br />
                      <span style={{ fontSize: '8pt', color: '#64748b' }}>{levelName(o.level)}</span>
                    </td>
                    <td style={{ ...cell, textAlign: 'center' }}>
                      <span style={{ fontWeight: 700 }}>{report.target_level}</span>
                    </td>
                    <td style={{ ...cell, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', fontSize: '8.5pt', fontWeight: 700,
                        background: hasGap ? '#fef2f2' : '#f0fdf4',
                        color: hasGap ? '#b91c1c' : '#15803d',
                        border: `1px solid ${hasGap ? '#fecaca' : '#bbf7d0'}`,
                      }}>
                        {hasGap ? `+${gap.toFixed(2)}` : '✓'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#1e3a5f' }}>
                <td colSpan={2} style={{ ...cell, border: '1px solid #1e3a5f', fontWeight: 700, color: '#fff' }}>Rata-rata Domain</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{report.score_percent?.toFixed(1)}%</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{report.current_level?.toFixed(2)}</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{report.target_level}</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: report.gap > 0 ? '#fca5a5' : '#86efac' }}>
                  {report.gap > 0 ? `+${report.gap?.toFixed(2)}` : '✓'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ══ 4. REKOMENDASI ══════════════════════════ */}
        <div style={{ padding: '40px 64px' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            4. Rekomendasi Perbaikan
          </h2>

          <div style={{ border: '1px solid #e2e8f0', padding: '18px 22px', background: '#f8fafc', lineHeight: 1.8, fontSize: '10pt', color: '#334155' }} className="no-break">
            {gapRecommendation(report.gap, report.target_level)}
          </div>

          {/* Tabel rencana aksi ringkas */}
          {report.gap > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }} className="no-break">
              <thead>
                <tr>
                  <th style={{ ...th, width: '8%', textAlign: 'center' }}>No</th>
                  <th style={th}>Langkah Aksi</th>
                  <th style={{ ...th, width: '20%' }}>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {[
                  report.gap <= 0.5 && [
                    ['Standarisasi dan dokumentasikan proses yang sudah berjalan', '1–2 Bulan'],
                    ['Lakukan pelatihan SDM TI untuk memahami standar yang dipersyaratkan', '2–3 Bulan'],
                    ['Jadwalkan reassessment setelah implementasi', '3 Bulan'],
                  ],
                  report.gap <= 1 && report.gap > 0.5 && [
                    ['Susun SOP tertulis untuk memformalisasikan proses menuju target level', '1–2 Bulan'],
                    ['Tunjuk Process Owner yang bertanggung jawab atas setiap objective', '1 Bulan'],
                    ['Adakan pelatihan COBIT 2019 untuk tim internal', '2–4 Bulan'],
                    ['Jadwalkan reassessment dalam 6 bulan', '6 Bulan'],
                  ],
                  report.gap <= 2 && report.gap > 1 && [
                    ['Susun IT Governance Roadmap berbasis hasil temuan ini', '1 Bulan'],
                    ['Prioritaskan perbaikan pada objective dengan gap terbesar', '2–3 Bulan'],
                    ['Bentuk tim task force untuk program transformasi TI', '1–2 Bulan'],
                    ['Integrasikan target COBIT ke dalam KPI tahunan TI', '3–6 Bulan'],
                    ['Jadwalkan reassessment dalam 6 bulan', '6 Bulan'],
                  ],
                  report.gap > 2 && [
                    ['Lakukan kajian menyeluruh atas seluruh proses TI yang ada', '< 1 Bulan'],
                    ['Konsultasikan dengan ahli tata kelola TI bersertifikat (CGEIT/CISA)', '1 Bulan'],
                    ['Implementasikan program perbaikan bertahap (12 bulan)', '12 Bulan'],
                    ['Dokumentasikan seluruh proses dari awal sesuai standar COBIT 2019', '3–6 Bulan'],
                  ],
                ].find(Boolean)?.map(([aksi, timeline], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ ...cell, textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                    <td style={cell}>{aksi}</td>
                    <td style={{ ...cell, color: '#475569' }}>{timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer dokumen */}
          <div style={{ marginTop: '40px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#94a3b8' }}>
            <span>Dokumen Penilaian COBIT 2019 — No. COBIT-{String(report.assessment_id).padStart(4, '0')}</span>
            <span>Dicetak: {printDate}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
