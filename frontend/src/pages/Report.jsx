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

const levelColor = (lvl) => {
  if (lvl < 1) return { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', bar: '#ef4444' };
  if (lvl < 2) return { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', bar: '#f97316' };
  if (lvl < 3) return { bg: '#fefce8', border: '#fde68a', text: '#92400e', bar: '#eab308' };
  if (lvl < 4) return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', bar: '#22c55e' };
  if (lvl < 5) return { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', bar: '#3b82f6' };
  return { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', bar: '#8b5cf6' };
};

const domainInfo = {
  EDM: { name: 'Evaluate, Direct and Monitor', color: '#6366f1', desc: 'Memastikan tata kelola TI berjalan efektif untuk mendukung tujuan bisnis.' },
  APO: { name: 'Align, Plan and Organise', color: '#0ea5e9', desc: 'Mengelola strategi TI dan mengorganisasikan sumber daya secara optimal.' },
  BAI: { name: 'Build, Acquire and Implement', color: '#10b981', desc: 'Memastikan solusi TI dibangun, diperoleh, dan diimplementasikan dengan tepat.' },
  DSS: { name: 'Deliver, Service and Support', color: '#f59e0b', desc: 'Memastikan layanan TI yang diberikan sesuai kebutuhan bisnis.' },
  MEA: { name: 'Monitor, Evaluate and Assess', color: '#ef4444', desc: 'Memantau kinerja dan kesesuaian TI dengan tujuan strategis.' },
};

const gapRecommendation = (gap, targetLevel) => {
  if (gap === 0) return 'Level target sudah tercapai. Fokus pada pemeliharaan dan optimisasi berkelanjutan.';
  if (gap <= 0.5) return 'Sangat dekat dengan target. Standarisasi dan dokumentasikan proses yang sudah berjalan.';
  if (gap <= 1) return `Diperlukan peningkatan sedang. Formalisasikan proses menuju Level ${targetLevel} melalui SOP tertulis dan tunjuk Process Owner.`;
  if (gap <= 2) return 'Diperlukan peningkatan signifikan. Susun IT Governance Roadmap dan bentuk tim task force untuk program transformasi TI.';
  return 'Diperlukan peningkatan mendasar. Rekomendasikan keterlibatan konsultan tata kelola TI bersertifikat.';
};

/* ── Group objectives by domain prefix ────────────────── */
const groupByDomain = (objectives) => {
  const map = {};
  objectives.forEach(o => {
    const prefix = o.code?.slice(0, 3).toUpperCase() || 'UNK';
    if (!map[prefix]) map[prefix] = [];
    map[prefix].push(o);
  });
  return map;
};

/* ── Print styles ────────────────────────────────────── */
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

/* ── Mini Spider Chart per Domain ──────────────────────── */
function DomainSpiderChart({ objectives, targetLevel, color }) {
  if (!objectives || objectives.length === 0) return null;
  const data = objectives.map(o => ({
    subject: o.code,
    'As-Is': parseFloat(o.level.toFixed(2)),
    'To-Be': targetLevel,
    fullMark: 5,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 9, fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
        <Tooltip
          contentStyle={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
        />
        <Radar name="Target (To-Be)" dataKey="To-Be" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.25} strokeDasharray="5 3" strokeWidth={1.5} />
        <Radar name="As-Is" dataKey="As-Is" stroke={color} fill={color} fillOpacity={0.4} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* ── Level Badge ─────────────────────────────────────── */
function LevelBadge({ level }) {
  const c = levelColor(level);
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', fontSize: '8pt', fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '4px',
    }}>
      {levelName(level)}
    </span>
  );
}

/* ── Progress Bar ──────────────────────────────────── */
function ProgressBar({ value, max = 5, color = '#1e3a5f' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
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

  /* ── Loading ───────────────────────────────────── */
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 24px', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '4px solid #1e3a5f', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Memuat laporan…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Error ────────────────────────────────────── */
  if (error) return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', maxWidth: '480px', margin: '60px auto' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ fontWeight: 700, color: '#b91c1c', fontSize: '18px', marginBottom: '8px' }}>Laporan Belum Tersedia</h3>
      <p style={{ color: '#dc2626', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
      <button
        onClick={() => navigate(`/dashboard/assessments/${id}/fill`)}
        style={{ background: '#1e3a5f', color: 'white', padding: '10px 24px', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px' }}
      >
        Isi Kuesioner Terlebih Dahulu
      </button>
    </div>
  );

  /* ── Data Preparation ────────────────────────── */
  const objectives = report.objectives || [];
  const domainGroups = groupByDomain(objectives);
  const domainKeys = Object.keys(domainGroups);

  // Full chart data (all objectives combined)
  const fullChartData = objectives.map(o => ({
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
    <div style={{ maxWidth: '900px', margin: '0 auto 80px', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Toolbar ──────────────────────────────────── */}
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

        {/* ══ COVER ══════════════════════════════════ */}
        <div style={{ padding: '48px 64px 40px', borderBottom: '1px solid #e2e8f0' }}>
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

          {/* 3 score cards */}
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

          {/* Kesimpulan */}
          <div style={{ marginTop: '18px', borderLeft: '4px solid #1e3a5f', padding: '12px 16px', background: '#f8fafc', fontSize: '9.5pt', color: '#334155', lineHeight: 1.7 }}>
            Domain <strong>{report.domain_code}</strong> saat ini berada pada <strong>Level {report.current_level?.toFixed(2)} — {levelName(report.current_level)}</strong>, dengan target <strong>Level {report.target_level} — {levelName(report.target_level)}</strong>.
            {report.gap > 0
              ? <> Terdapat celah sebesar <strong>{report.gap?.toFixed(2)} level</strong> yang perlu ditindaklanjuti melalui program perbaikan terencana.</>
              : <> Target telah tercapai. Fokus selanjutnya adalah mempertahankan dan mengoptimalkan proses yang ada.</>
            }
          </div>
        </div>

        {/* ══ 2. SPIDER CHART KESELURUHAN ════════════ */}
        <div className="page-break" style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. Peta Spider Chart Keseluruhan (As-Is vs. To-Be)
          </h2>
          <p style={{ fontSize: '9.5pt', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
            Visualisasi spider chart menampilkan seluruh objective yang dinilai. Area biru = kondisi aktual (As-Is). Garis putus-putus = target kapabilitas (To-Be).
          </p>

          <div style={{ border: '1px solid #e2e8f0', background: '#fafafa', padding: '20px' }} className="no-break">
            <div style={{ height: '380px' }}>
              {fullChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fullChartData}>
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

        {/* ══ 3. GAMBARAN BESAR PER DOMAIN ════════════ */}
        <div className="page-break" style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            3. Gambaran Besar per Domain
          </h2>
          <p style={{ fontSize: '9.5pt', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
            Setiap domain COBIT 2019 ditampilkan dengan spider chart dan ringkasan kapabilitas per objective. Ini memberikan gambaran cepat tentang kekuatan dan celah di setiap domain.
          </p>

          {domainKeys.map(domainKey => {
            const domObjs = domainGroups[domainKey];
            const info = domainInfo[domainKey] || { name: domainKey, color: '#64748b', desc: '' };
            const avgLevel = domObjs.reduce((s, o) => s + o.level, 0) / domObjs.length;
            const avgScore = domObjs.reduce((s, o) => s + o.score_value, 0) / domObjs.length;
            const domGap = Math.max(0, report.target_level - avgLevel);
            const lc = levelColor(avgLevel);

            return (
              <div key={domainKey} className="no-break" style={{
                marginBottom: '28px',
                border: `1px solid ${info.color}30`,
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Domain Header */}
                <div style={{ background: `${info.color}12`, borderBottom: `1px solid ${info.color}30`, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: info.color }} />
                      <span style={{ fontSize: '11pt', fontWeight: 800, color: '#0f172a' }}>{domainKey}</span>
                      <span style={{ fontSize: '9pt', fontWeight: 600, color: '#475569' }}>— {info.name}</span>
                    </div>
                    <p style={{ margin: '4px 0 0 20px', fontSize: '8.5pt', color: '#64748b' }}>{info.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <div style={{ fontSize: '20pt', fontWeight: 800, color: info.color, lineHeight: 1 }}>{avgLevel.toFixed(2)}</div>
                    <div style={{ fontSize: '8pt', color: '#64748b', fontWeight: 600 }}>Rata-rata Level</div>
                    {domGap > 0 ? (
                      <div style={{ fontSize: '8pt', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>Gap: +{domGap.toFixed(2)}</div>
                    ) : (
                      <div style={{ fontSize: '8pt', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>✓ Target Tercapai</div>
                    )}
                  </div>
                </div>

                {/* Domain Body: Chart + Objectives List */}
                <div style={{ display: 'grid', gridTemplateColumns: domObjs.length > 1 ? '1fr 1fr' : '1fr', gap: '0' }}>
                  {/* Spider Chart */}
                  {domObjs.length > 1 && (
                    <div style={{ padding: '16px', borderRight: '1px solid #e2e8f0', background: '#fafafa' }}>
                      <div style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Spider Chart Domain {domainKey}</div>
                      <DomainSpiderChart objectives={domObjs} targetLevel={report.target_level} color={info.color} />
                    </div>
                  )}

                  {/* Objectives Summary */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      Ringkasan Objective ({domObjs.length})
                    </div>
                    {domObjs.map((o, idx) => {
                      const oGap = Math.max(0, report.target_level - o.level);
                      const olc = levelColor(o.level);
                      return (
                        <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < domObjs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '9pt', color: '#0f172a' }}>{o.code}</span>
                              <span style={{ fontSize: '8.5pt', color: '#475569', marginLeft: '6px' }}>{o.name}</span>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '10pt', color: olc.text }}>{o.level.toFixed(2)}</span>
                              {oGap > 0
                                ? <span style={{ fontSize: '7.5pt', color: '#dc2626', fontWeight: 600, marginLeft: '4px' }}>▲{oGap.toFixed(2)}</span>
                                : <span style={{ fontSize: '7.5pt', color: '#16a34a', fontWeight: 600, marginLeft: '4px' }}>✓</span>
                              }
                            </div>
                          </div>
                          <ProgressBar value={o.level} max={5} color={olc.bar} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '7.5pt', color: '#94a3b8' }}>
                            <span>Skor: {o.score_value?.toFixed(1)}%</span>
                            <LevelBadge level={o.level} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ 4. PENILAIAN DETAIL PER OBJECTIVE ══════════ */}
        <div className="page-break" style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            4. Penilaian Detail per Objective
          </h2>
          <p style={{ fontSize: '9.5pt', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
            Tabel berikut menampilkan penilaian lengkap untuk setiap governance/management objective, mencakup skor aktual, tingkat kapabilitas, target, dan celah yang perlu diatasi.
          </p>

          {domainKeys.map(domainKey => {
            const domObjs = domainGroups[domainKey];
            const info = domainInfo[domainKey] || { name: domainKey, color: '#64748b', desc: '' };
            const avgLevel = domObjs.reduce((s, o) => s + o.level, 0) / domObjs.length;
            const avgScore = domObjs.reduce((s, o) => s + o.score_value, 0) / domObjs.length;

            return (
              <div key={domainKey} style={{ marginBottom: '24px' }} className="no-break">
                {/* Domain sub-header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: info.color, color: 'white',
                  padding: '8px 16px', marginBottom: '0',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', opacity: 0.8 }} />
                  <span style={{ fontWeight: 800, fontSize: '9.5pt' }}>{domainKey}</span>
                  <span style={{ fontWeight: 500, fontSize: '9pt', opacity: 0.9 }}>— {info.name}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '9pt', opacity: 0.9 }}>
                    Rata-rata Level: {avgLevel.toFixed(2)} · Skor: {avgScore.toFixed(1)}%
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, width: '10%', background: `${info.color}dd` }}>Kode</th>
                      <th style={{ ...th, width: '30%', background: `${info.color}dd` }}>Objective</th>
                      <th style={{ ...th, width: '14%', textAlign: 'center', background: `${info.color}dd` }}>Skor (%)</th>
                      <th style={{ ...th, width: '15%', textAlign: 'center', background: `${info.color}dd` }}>Level As-Is</th>
                      <th style={{ ...th, width: '11%', textAlign: 'center', background: `${info.color}dd` }}>Target</th>
                      <th style={{ ...th, width: '10%', textAlign: 'center', background: `${info.color}dd` }}>Gap</th>
                      <th style={{ ...th, width: '10%', textAlign: 'center', background: `${info.color}dd` }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domObjs.map((o, i) => {
                      const gap = Math.max(0, report.target_level - o.level);
                      const hasGap = gap > 0;
                      const olc = levelColor(o.level);
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                          <td style={{ ...cell, fontWeight: 700, color: info.color }}>{o.code}</td>
                          <td style={{ ...cell }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{o.name}</span>
                          </td>
                          <td style={{ ...cell, textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '10pt', color: '#0f172a' }}>{o.score_value?.toFixed(1)}%</span>
                            <div style={{ marginTop: '4px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${o.score_value}%`, background: olc.bar }} />
                            </div>
                          </td>
                          <td style={{ ...cell, textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '12pt', color: olc.text }}>{o.level?.toFixed(2)}</div>
                            <LevelBadge level={o.level} />
                          </td>
                          <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>
                            {report.target_level}
                          </td>
                          <td style={{ ...cell, textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', fontSize: '8.5pt', fontWeight: 700,
                              background: hasGap ? '#fef2f2' : '#f0fdf4',
                              color: hasGap ? '#b91c1c' : '#15803d',
                              border: `1px solid ${hasGap ? '#fecaca' : '#bbf7d0'}`,
                            }}>
                              {hasGap ? `+${gap.toFixed(2)}` : '0'}
                            </span>
                          </td>
                          <td style={{ ...cell, textAlign: 'center' }}>
                            {hasGap ? (
                              <span style={{ fontSize: '8pt', fontWeight: 700, color: '#b91c1c' }}>⚠ Perlu Perbaikan</span>
                            ) : (
                              <span style={{ fontSize: '8pt', fontWeight: 700, color: '#15803d' }}>✓ Tercapai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Domain subtotal */}
                  <tfoot>
                    <tr style={{ background: `${info.color}18` }}>
                      <td colSpan={2} style={{ ...cell, fontWeight: 700, color: info.color, borderColor: `${info.color}40` }}>
                        Rata-rata Domain {domainKey}
                      </td>
                      <td style={{ ...cell, textAlign: 'center', fontWeight: 700, color: info.color, borderColor: `${info.color}40` }}>
                        {avgScore.toFixed(1)}%
                      </td>
                      <td style={{ ...cell, textAlign: 'center', fontWeight: 700, color: info.color, borderColor: `${info.color}40` }}>
                        {avgLevel.toFixed(2)}
                      </td>
                      <td style={{ ...cell, textAlign: 'center', fontWeight: 700, borderColor: `${info.color}40` }}>
                        {report.target_level}
                      </td>
                      <td colSpan={2} style={{ ...cell, textAlign: 'center', fontWeight: 700, borderColor: `${info.color}40`, color: Math.max(0, report.target_level - avgLevel) > 0 ? '#b91c1c' : '#15803d' }}>
                        {Math.max(0, report.target_level - avgLevel) > 0
                          ? `Gap: +${Math.max(0, report.target_level - avgLevel).toFixed(2)}`
                          : '✓ Target Tercapai'
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}

          {/* Grand Total */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }} className="no-break">
            <tfoot>
              <tr style={{ background: '#1e3a5f' }}>
                <td colSpan={2} style={{ ...cell, border: '1px solid #1e3a5f', fontWeight: 700, color: '#fff' }}>Total Keseluruhan</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{report.score_percent?.toFixed(1)}%</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{report.current_level?.toFixed(2)}</td>
                <td style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: '#fff' }}>{report.target_level}</td>
                <td colSpan={2} style={{ ...cell, border: '1px solid #1e3a5f', textAlign: 'center', fontWeight: 700, color: report.gap > 0 ? '#fca5a5' : '#86efac' }}>
                  {report.gap > 0 ? `+${report.gap?.toFixed(2)}` : '✓ Tercapai'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ══ 5. SPIDER CHART PER DOMAIN (Detail) ══════ */}
        {domainKeys.length > 1 && (
          <div className="page-break" style={{ padding: '40px 64px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              5. Spider Chart per Domain (Tampilan Detail)
            </h2>
            <p style={{ fontSize: '9.5pt', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
              Setiap domain ditampilkan dalam spider chart terpisah untuk memudahkan analisis mendalam terhadap kesenjangan kapabilitas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {domainKeys.map(domainKey => {
                const domObjs = domainGroups[domainKey];
                if (domObjs.length < 2) return null;
                const info = domainInfo[domainKey] || { name: domainKey, color: '#64748b', desc: '' };
                const avgLevel = domObjs.reduce((s, o) => s + o.level, 0) / domObjs.length;

                return (
                  <div key={domainKey} className="no-break" style={{ border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ background: info.color, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '10pt', color: 'white' }}>{domainKey}</span>
                        <span style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.8)', marginLeft: '6px' }}>{info.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, fontSize: '12pt', color: 'white' }}>{avgLevel.toFixed(2)}</span>
                        <span style={{ fontSize: '8pt', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>/ 5.00</span>
                      </div>
                    </div>
                    <div style={{ padding: '8px', background: '#fafafa' }}>
                      <DomainSpiderChart objectives={domObjs} targetLevel={report.target_level} color={info.color} />
                    </div>
                    {/* Legend */}
                    <div style={{ padding: '8px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '16px', fontSize: '8pt', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '3px', background: info.color }} />
                        As-Is
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '2px', background: '#94a3b8', borderTop: '2px dashed #94a3b8' }} />
                        To-Be (Level {report.target_level})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ 6. REKOMENDASI ══════════════════════════ */}
        <div style={{ padding: '40px 64px' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', borderLeft: '4px solid #1e3a5f', paddingLeft: '12px', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {domainKeys.length > 1 ? '6' : '5'}. Rekomendasi Perbaikan
          </h2>

          <div style={{ border: '1px solid #e2e8f0', padding: '18px 22px', background: '#f8fafc', lineHeight: 1.8, fontSize: '10pt', color: '#334155' }} className="no-break">
            {gapRecommendation(report.gap, report.target_level)}
          </div>

          {/* Tabel rencana aksi */}
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
