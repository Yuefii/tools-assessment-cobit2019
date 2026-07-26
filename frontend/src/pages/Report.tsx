import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { reportAPI } from '../services/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Printer, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

/* ── helpers ─────────────────────────────────────────── */
const levelName = (lvl: number) => {
  const names = ['Incomplete', 'Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing'];
  return names[Math.floor(lvl)] ?? 'Unknown';
};

const levelColor = (lvl: number) => {
  if (lvl < 1) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: '#ef4444' };
  if (lvl < 2) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: '#f97316' };
  if (lvl < 3) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: '#eab308' };
  if (lvl < 4) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: '#22c55e' };
  if (lvl < 5) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: '#3b82f6' };
  return { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', bar: '#8b5cf6' };
};

const domainInfo: Record<string, any> = {
  EDM: { name: 'Evaluate, Direct and Monitor', color: '#6366f1', desc: 'Memastikan tata kelola TI berjalan efektif untuk mendukung tujuan bisnis.' },
  APO: { name: 'Align, Plan and Organise', color: '#0ea5e9', desc: 'Mengelola strategi TI dan mengorganisasikan sumber daya secara optimal.' },
  BAI: { name: 'Build, Acquire and Implement', color: '#10b981', desc: 'Memastikan solusi TI dibangun, diperoleh, dan diimplementasikan dengan tepat.' },
  DSS: { name: 'Deliver, Service and Support', color: '#f59e0b', desc: 'Memastikan layanan TI yang diberikan sesuai kebutuhan bisnis.' },
  MEA: { name: 'Monitor, Evaluate and Assess', color: '#ef4444', desc: 'Memantau kinerja dan kesesuaian TI dengan tujuan strategis.' },
};

const gapRecommendation = (gap: number, targetLevel: number) => {
  if (gap === 0) return 'Level target sudah tercapai. Fokus pada pemeliharaan dan optimisasi berkelanjutan.';
  if (gap <= 0.5) return 'Sangat dekat dengan target. Standarisasi dan dokumentasikan proses yang sudah berjalan.';
  if (gap <= 1) return `Diperlukan peningkatan sedang. Formalisasikan proses menuju Level ${targetLevel} melalui SOP tertulis dan tunjuk Process Owner.`;
  if (gap <= 2) return 'Diperlukan peningkatan signifikan. Susun IT Governance Roadmap dan bentuk tim task force untuk program transformasi TI.';
  return 'Diperlukan peningkatan mendasar. Rekomendasikan keterlibatan konsultan tata kelola TI bersertifikat.';
};

const groupByDomain = (objectives: any[]) => {
  const map: Record<string, any[]> = {};
  objectives.forEach(o => {
    const prefix = o.code?.slice(0, 3).toUpperCase() || 'UNK';
    if (!map[prefix]) map[prefix] = [];
    map[prefix].push(o);
  });
  return map;
};

const PRINT_STYLES = `
  @page { size: A4 portrait; margin: 18mm 18mm 18mm 22mm; }
  @media print {
    .print-hide { display: none !important; }
    .page-break { break-before: page; margin-top: 0 !important; padding-top: 0 !important; border-top: none !important; }
    .no-break { break-inside: avoid; }
    body { background-color: white !important; }
    .print-container { box-shadow: none !important; border: none !important; max-width: 100% !important; margin: 0 !important; }
  }
`;

function DomainSpiderChart({ objectives, targetLevel, color }: { objectives: any[], targetLevel: number, color: string }) {
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
        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
        <Radar name="Target (To-Be)" dataKey="To-Be" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.25} strokeDasharray="5 3" strokeWidth={1.5} />
        <Radar name="As-Is" dataKey="As-Is" stroke={color} fill={color} fillOpacity={0.4} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function LevelBadge({ level }: { level: number }) {
  const c = levelColor(level);
  return (
    <span className={cn("inline-block px-2 py-0.5 text-[8pt] font-bold border rounded", c.bg, c.text, c.border)}>
      {levelName(level)}
    </span>
  );
}

function ProgressBar({ value, max = 5, color = '#1e3a5f' }: { value: number, max?: number, color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-[5px] bg-slate-200 rounded-[3px] overflow-hidden mt-1">
      <div className="h-full rounded-[3px] transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!document.getElementById('rpt-style')) {
      const s = document.createElement('style');
      s.id = 'rpt-style';
      s.textContent = PRINT_STYLES;
      document.head.appendChild(s);
    }
    reportAPI.generate(id!)
      .then(res => setReport(res.data || res))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Memuat laporan…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-destructive/10 border border-destructive/20 rounded-2xl text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h3 className="font-bold text-lg text-destructive mb-2">Laporan Belum Tersedia</h3>
      <p className="text-sm text-destructive/80 mb-6">{error}</p>
      <Button onClick={() => navigate(`/dashboard/assessments/${id}/fill`)}>
        Isi Kuesioner Terlebih Dahulu
      </Button>
    </div>
  );

  const objectives = report.objectives || [];
  const domainGroups = groupByDomain(objectives);
  const domainKeys = Object.keys(domainGroups);

  const fullChartData = objectives.map((o: any) => ({
    subject: o.code,
    'As-Is': parseFloat(o.level.toFixed(2)),
    'To-Be': report.target_level,
    fullMark: 5,
  }));

  const printDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="w-full pb-20">
      {/* ── Toolbar ── */}
      <div className="print-hide flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/assessments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground m-0">Laporan Penilaian COBIT 2019</h1>
            <p className="text-xs text-muted-foreground m-0">Pratinjau · Siap cetak</p>
          </div>
        </div>
        <Button size="lg" className="px-6 h-11 text-sm sm:text-base font-semibold" onClick={() => window.print()}>
          <Printer className="h-5 w-5 mr-2" />
          Cetak / Ekspor PDF
        </Button>
      </div>

      {/* ── Document ── */}
      <Card className="print-container bg-white text-slate-900 border-slate-200 overflow-hidden shadow-lg rounded-none sm:rounded-xl">
        {/* Cover */}
        <div className="p-8 sm:p-12 md:p-16 border-b border-slate-200">
          <div className="flex justify-between items-end border-b-[3px] border-slate-800 pb-4 mb-8">
            <div>
              <div className="text-[8pt] font-bold tracking-[0.15em] uppercase text-slate-500 mb-1">
                Laporan Penilaian Tingkat Kapabilitas
              </div>
              <div className="text-[17pt] sm:text-[22pt] font-extrabold text-slate-900 leading-tight">
                Tata Kelola Teknologi Informasi
              </div>
              <div className="text-[11pt] text-slate-700 mt-1">
                Berdasarkan Kerangka Kerja <strong className="text-slate-900">COBIT 2019</strong>
              </div>
            </div>
            <div className="text-right text-[8.5pt] text-slate-500 leading-relaxed hidden sm:block">
              <div>No. Dok: COBIT-{String(report.assessment_id).padStart(4, '0')}</div>
              <div>{printDate}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9.5pt]">
            {[
              ['Judul Assessment', report.title],
              ['Domain / Ruang Lingkup', report.domain_code || '—'],
              ['Assessor', report.assessor_name || 'Tim Audit Internal'],
              ['Auditee', report.auditee_name || '—'],
              ['Tanggal Pelaksanaan', report.created_at],
              ['Target Capability Level', `Level ${report.target_level} — ${levelName(report.target_level)}`],
            ].map(([label, val], i) => (
              <div key={i} className="flex border border-slate-200">
                <div className="p-2 sm:px-3 bg-slate-50 font-semibold text-slate-600 w-32 sm:w-40 border-r border-slate-200 shrink-0">
                  {label}
                </div>
                <div className="p-2 sm:px-3 text-slate-900">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 1. Ringkasan Hasil */}
        <div className="p-8 sm:p-12 md:px-16 md:py-10 border-b border-slate-200">
          <h2 className="text-[12pt] font-extrabold text-slate-900 border-l-4 border-slate-800 pl-3 mb-6 uppercase tracking-wider">
            1. Ringkasan Hasil Penilaian
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Tingkat Saat Ini (As-Is)', val: report.current_level?.toFixed(2), sub: levelName(report.current_level), accent: 'border-blue-600', text: 'text-blue-600' },
              { label: 'Tingkat Target (To-Be)', val: report.target_level, sub: levelName(report.target_level), accent: 'border-slate-800', text: 'text-slate-800' },
              {
                label: 'Celah Kapabilitas (Gap)',
                val: report.gap?.toFixed(2),
                sub: report.gap > 0 ? 'Perlu Peningkatan' : 'Target Tercapai',
                accent: report.gap > 0 ? 'border-red-600' : 'border-green-600',
                text: report.gap > 0 ? 'text-red-600' : 'text-green-600'
              },
            ].map((c, i) => (
              <div key={i} className={cn("no-break border-2 p-4 sm:p-5", c.accent)}>
                <div className="text-[7pt] sm:text-[8pt] font-bold text-slate-500 uppercase tracking-widest mb-2">{c.label}</div>
                <div className={cn("text-[22pt] sm:text-[26pt] font-extrabold leading-none", c.text)}>{c.val}</div>
                <div className="text-[9pt] font-semibold text-slate-700 mt-1">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 hidden sm:block">
            <div className="text-[8pt] font-bold text-slate-500 uppercase tracking-widest mb-3">Referensi Capability Level COBIT 2019</div>
            <div className="grid grid-cols-6 gap-1.5">
              {[
                { lvl: 0, name: 'Incomplete', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
                { lvl: 1, name: 'Initial', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
                { lvl: 2, name: 'Managed', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
                { lvl: 3, name: 'Defined', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
                { lvl: 4, name: 'Quant. Managed', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
                { lvl: 5, name: 'Optimizing', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
              ].map(l => (
                <div key={l.lvl} className={cn("border p-1.5 sm:p-2 text-center", l.bg, l.border)}>
                  <div className={cn("text-[12pt] sm:text-[14pt] font-extrabold", l.text)}>{l.lvl}</div>
                  <div className={cn("text-[6pt] sm:text-[7pt] font-semibold leading-tight mt-0.5", l.text)}>{l.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-l-4 border-slate-800 p-3 sm:p-4 bg-slate-50 text-[9pt] sm:text-[9.5pt] text-slate-700 leading-relaxed">
            Domain <strong>{report.domain_code}</strong> saat ini berada pada <strong>Level {report.current_level?.toFixed(2)} — {levelName(report.current_level)}</strong>, dengan target <strong>Level {report.target_level} — {levelName(report.target_level)}</strong>.
            {report.gap > 0
              ? <> Terdapat celah sebesar <strong>{report.gap?.toFixed(2)} level</strong> yang perlu ditindaklanjuti melalui program perbaikan terencana.</>
              : <> Target telah tercapai. Fokus selanjutnya adalah mempertahankan dan mengoptimalkan proses yang ada.</>
            }
          </div>
        </div>

        {/* 2. Spider Chart */}
        <div className="page-break sm:mt-8 pt-8 sm:border-t-2 sm:border-dashed border-slate-200 p-8 sm:p-12 md:px-16 md:py-10 border-b border-slate-200">
          <h2 className="text-[12pt] font-extrabold text-slate-900 border-l-4 border-slate-800 pl-3 mb-2 uppercase tracking-wider">
            2. Peta Spider Chart Keseluruhan (As-Is vs. To-Be)
          </h2>
          <p className="text-[9.5pt] text-slate-500 mb-5 leading-relaxed">
            Visualisasi spider chart menampilkan seluruh objective yang dinilai. Area biru = kondisi aktual (As-Is). Garis putus-putus = target kapabilitas (To-Be).
          </p>

          <div className="no-break border border-slate-200 bg-slate-50/50 p-5">
            <div className="h-[300px] sm:h-[380px]">
              {fullChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fullChartData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }} />
                    <Radar name="Target (To-Be)" dataKey="To-Be" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.3} strokeDasharray="6 4" strokeWidth={2} />
                    <Radar name="Current (As-Is)" dataKey="As-Is" stroke="#1e3a5f" fill="#3b82f6" fillOpacity={0.5} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-[9.5pt]">
                  Data tidak mencukupi untuk merender grafik
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Per Domain */}
        <div className="page-break sm:mt-8 pt-8 sm:border-t-2 sm:border-dashed border-slate-200 p-8 sm:p-12 md:px-16 md:py-10 border-b border-slate-200">
          <h2 className="text-[12pt] font-extrabold text-slate-900 border-l-4 border-slate-800 pl-3 mb-2 uppercase tracking-wider">
            3. Gambaran Besar per Domain
          </h2>
          <p className="text-[9.5pt] text-slate-500 mb-6 leading-relaxed">
            Setiap domain COBIT 2019 ditampilkan dengan ringkasan kapabilitas per objective untuk analisis area kekuatan dan kelemahan.
          </p>

          {domainKeys.map(domainKey => {
            const domObjs = domainGroups[domainKey];
            const info = domainInfo[domainKey] || { name: domainKey, color: '#64748b', desc: '' };
            const avgLevel = domObjs.reduce((s, o) => s + o.level, 0) / domObjs.length;
            const domGap = Math.max(0, report.target_level - avgLevel);

            return (
              <div key={domainKey} className="no-break mb-8 border border-slate-200 rounded-lg overflow-hidden">
                {/* Header Domain */}
                <div className="p-4 sm:p-5 flex justify-between items-center bg-slate-50 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                      <span className="text-[11pt] font-extrabold text-slate-900">{domainKey}</span>
                      <span className="text-[9pt] font-semibold text-slate-600 hidden sm:inline">— {info.name}</span>
                    </div>
                    <p className="mt-1 ml-5 text-[8.5pt] text-slate-500 hidden sm:block">{info.desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-[16pt] sm:text-[20pt] font-extrabold leading-none" style={{ color: info.color }}>{avgLevel.toFixed(2)}</div>
                    <div className="text-[7pt] sm:text-[8pt] text-slate-500 font-semibold mt-1">Rata-rata Level</div>
                    {domGap > 0 ? (
                      <div className="text-[7pt] sm:text-[8pt] text-red-600 font-bold mt-0.5">Gap: +{domGap.toFixed(2)}</div>
                    ) : (
                      <div className="text-[7pt] sm:text-[8pt] text-green-600 font-bold mt-0.5">✓ Target Tercapai</div>
                    )}
                  </div>
                </div>

                {/* Body Domain */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {domObjs.length > 1 && (
                    <div className="p-4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50">
                      <div className="text-[7.5pt] font-bold text-slate-500 uppercase tracking-widest mb-2">Spider Chart {domainKey}</div>
                      <DomainSpiderChart objectives={domObjs} targetLevel={report.target_level} color={info.color} />
                    </div>
                  )}
                  
                  <div className={cn("p-4 sm:p-5", domObjs.length === 1 ? "md:col-span-2" : "")}>
                    <div className="text-[7.5pt] font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Ringkasan Objective ({domObjs.length})
                    </div>
                    {domObjs.map((o: any, idx: number) => {
                      const oGap = Math.max(0, report.target_level - o.level);
                      const olc = levelColor(o.level);
                      return (
                        <div key={idx} className={cn("pb-3 mb-3", idx < domObjs.length - 1 ? "border-b border-slate-100" : "")}>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-bold text-[9pt] text-slate-900">{o.code}</span>
                              <span className="text-[8.5pt] text-slate-600 ml-1.5">{o.name}</span>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className={cn("font-extrabold text-[10pt]", olc.text)}>{o.level.toFixed(2)}</span>
                              {oGap > 0
                                ? <span className="text-[7.5pt] text-red-600 font-semibold ml-1">▲{oGap.toFixed(2)}</span>
                                : <span className="text-[7.5pt] text-green-600 font-semibold ml-1">✓</span>
                              }
                            </div>
                          </div>
                          <ProgressBar value={o.level} max={5} color={olc.bar} />
                          <div className="flex justify-between mt-1.5 text-[7.5pt] text-slate-500">
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

        {/* 4. Tabel Detail */}
        <div className="page-break sm:mt-8 pt-8 sm:border-t-2 sm:border-dashed border-slate-200 p-8 sm:p-12 md:px-16 md:py-10 border-b border-slate-200">
          <h2 className="text-[12pt] font-extrabold text-slate-900 border-l-4 border-slate-800 pl-3 mb-2 uppercase tracking-wider">
            4. Penilaian Detail per Objective
          </h2>
          <p className="text-[9.5pt] text-slate-500 mb-6 leading-relaxed">
            Tabel berikut menampilkan penilaian lengkap untuk setiap objective, mencakup tingkat kapabilitas, target, dan celah yang perlu diatasi.
          </p>

          <div className="overflow-x-auto">
            {domainKeys.map(domainKey => {
              const domObjs = domainGroups[domainKey];
              const info = domainInfo[domainKey] || { name: domainKey, color: '#64748b' };
              const avgLevel = domObjs.reduce((s, o) => s + o.level, 0) / domObjs.length;
              const avgScore = domObjs.reduce((s, o) => s + o.score_value, 0) / domObjs.length;

              return (
                <div key={domainKey} className="no-break mb-6 min-w-[600px]">
                  <div className="flex items-center gap-2.5 text-white p-2.5 px-4" style={{ backgroundColor: info.color }}>
                    <div className="w-2 h-2 rounded-full bg-white/80" />
                    <span className="font-extrabold text-[9.5pt]">{domainKey}</span>
                    <span className="font-medium text-[9pt] opacity-90 hidden sm:inline">— {info.name}</span>
                    <span className="ml-auto font-bold text-[9pt] opacity-90">
                      Rata-rata: {avgLevel.toFixed(2)} · Skor: {avgScore.toFixed(1)}%
                    </span>
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[10%]" style={{ backgroundColor: `${info.color}dd` }}>Kode</th>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[30%]" style={{ backgroundColor: `${info.color}dd` }}>Objective</th>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[14%] text-center" style={{ backgroundColor: `${info.color}dd` }}>Skor (%)</th>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[15%] text-center" style={{ backgroundColor: `${info.color}dd` }}>Level As-Is</th>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[11%] text-center" style={{ backgroundColor: `${info.color}dd` }}>Target</th>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[10%] text-center" style={{ backgroundColor: `${info.color}dd` }}>Gap</th>
                        <th className="p-2.5 text-[9pt] border border-slate-300 font-bold text-white w-[10%] text-center" style={{ backgroundColor: `${info.color}dd` }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domObjs.map((o: any, i: number) => {
                        const gap = Math.max(0, report.target_level - o.level);
                        const hasGap = gap > 0;
                        const olc = levelColor(o.level);
                        return (
                          <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                            <td className="p-2.5 text-[9pt] border border-slate-300 font-bold" style={{ color: info.color }}>{o.code}</td>
                            <td className="p-2.5 text-[9pt] border border-slate-300 font-semibold text-slate-800">{o.name}</td>
                            <td className="p-2.5 border border-slate-300 text-center">
                              <span className="font-bold text-[9.5pt] text-slate-900">{o.score_value?.toFixed(1)}%</span>
                              <ProgressBar value={o.score_value} max={100} color={olc.bar} />
                            </td>
                            <td className="p-2.5 border border-slate-300 text-center">
                              <div className={cn("font-extrabold text-[11pt]", olc.text)}>{o.level?.toFixed(2)}</div>
                              <LevelBadge level={o.level} />
                            </td>
                            <td className="p-2.5 text-[9.5pt] border border-slate-300 text-center font-bold">{report.target_level}</td>
                            <td className="p-2.5 border border-slate-300 text-center">
                              <span className={cn(
                                "inline-block px-2 py-0.5 text-[8.5pt] font-bold border",
                                hasGap ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                              )}>
                                {hasGap ? `+${gap.toFixed(2)}` : '0'}
                              </span>
                            </td>
                            <td className="p-2.5 border border-slate-300 text-center">
                              {hasGap ? (
                                <span className="text-[8pt] font-bold text-red-700">⚠ Perlu Perbaikan</span>
                              ) : (
                                <span className="text-[8pt] font-bold text-green-700">✓ Tercapai</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Grand Total */}
            <table className="w-full border-collapse mt-2 min-w-[600px] no-break">
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={2} className="p-2.5 text-[9pt] border border-slate-800 font-bold">Total Keseluruhan</td>
                  <td className="p-2.5 text-[9.5pt] border border-slate-800 text-center font-bold">{report.score_percent?.toFixed(1)}%</td>
                  <td className="p-2.5 text-[10pt] border border-slate-800 text-center font-bold">{report.current_level?.toFixed(2)}</td>
                  <td className="p-2.5 text-[9.5pt] border border-slate-800 text-center font-bold">{report.target_level}</td>
                  <td colSpan={2} className={cn("p-2.5 text-[9pt] border border-slate-800 text-center font-bold", report.gap > 0 ? "text-red-300" : "text-green-300")}>
                    {report.gap > 0 ? `+${report.gap?.toFixed(2)}` : '✓ Tercapai'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 5. Rekomendasi */}
        <div className="page-break sm:mt-8 pt-8 sm:border-t-2 sm:border-dashed border-slate-200 p-8 sm:p-12 md:px-16 md:py-10">
          <h2 className="text-[12pt] font-extrabold text-slate-900 border-l-4 border-slate-800 pl-3 mb-4 uppercase tracking-wider">
            {domainKeys.length > 1 ? '5' : '4'}. Rekomendasi Perbaikan
          </h2>

          <div className="no-break border border-slate-200 bg-slate-50 p-5 text-[9.5pt] leading-relaxed text-slate-700 mb-5">
            {gapRecommendation(report.gap, report.target_level)}
          </div>

          {report.gap > 0 && (
            <div className="overflow-x-auto no-break">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-2.5 text-[9pt] border border-slate-300 w-[8%] text-center font-bold">No</th>
                    <th className="p-2.5 text-[9pt] border border-slate-300 text-left font-bold">Langkah Aksi</th>
                    <th className="p-2.5 text-[9pt] border border-slate-300 w-[20%] text-left font-bold">Timeline</th>
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
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="p-2.5 text-[9pt] border border-slate-300 text-center font-semibold text-slate-700">{i + 1}</td>
                      <td className="p-2.5 text-[9pt] border border-slate-300 text-slate-800">{aksi}</td>
                      <td className="p-2.5 text-[9pt] border border-slate-300 text-slate-600">{timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Dokumen */}
          <div className="mt-12 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between text-[8pt] text-slate-500">
            <span>Dokumen Penilaian COBIT 2019 — No. COBIT-{String(report.assessment_id).padStart(4, '0')}</span>
            <span className="mt-1 sm:mt-0">Dicetak: {printDate}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
