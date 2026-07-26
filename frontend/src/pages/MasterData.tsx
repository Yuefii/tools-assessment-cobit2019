import { useState, useEffect } from 'react';
import { cobitAPI } from '../services/api';

const CHEVRON_DOWN = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);
const CHEVRON_RIGHT = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

export default function MasterData() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  // Modal state
  const [modal, setModal] = useState({ open: false, type: '', parentId: null, parentName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });

  useEffect(() => { fetchDomains(); }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const data = await cobitAPI.getDomains();
      setDomains(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const openModal = (type, parentId = null, parentName = '') => {
    setForm({ code: '', name: '', description: '' });
    setModal({ open: true, type, parentId, parentName });
  };

  const closeModal = () => setModal({ open: false, type: '', parentId: null, parentName: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { type, parentId } = modal;
      if (type === 'domain') {
        await cobitAPI.createDomain({ code: form.code, name: form.name, description: form.description });
      } else if (type === 'objective') {
        await cobitAPI.createObjective({ domain_id: parentId, code: form.code, name: form.name, description: form.description });
      } else if (type === 'practice') {
        await cobitAPI.createPractice({ objective_id: parentId, code: form.code, name: form.name, description: form.description });
      } else if (type === 'activity') {
        await cobitAPI.createActivity({ practice_id: parentId, description: form.description });
      }
      closeModal();
      await fetchDomains();
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabels = {
    domain: 'Domain COBIT',
    objective: 'Objective',
    practice: 'Practice / Kontrol',
    activity: 'Activity / Pertanyaan',
  };

  const domainColors = {
    EDM: 'from-purple-500 to-purple-600',
    APO: 'from-blue-500 to-blue-600',
    BAI: 'from-cyan-500 to-cyan-600',
    DSS: 'from-indigo-500 to-indigo-600',
    MEA: 'from-emerald-500 to-emerald-600',
  };

  // Count total questions per domain
  const countActivities = (domain) => {
    let n = 0;
    for (const obj of (domain.objectives || [])) {
      for (const prac of (obj.practices || [])) {
        n += (prac.activities || []).length;
      }
    }
    return n;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">COBIT 2019 Master Data</h1>
          <p className="text-slate-500">Kelola hierarki Domain → Objective → Practice → Activity.</p>
        </div>
        <button
          id="add-domain-btn"
          onClick={() => openModal('domain')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-indigo-200 transition-all font-medium text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Domain
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: 'Domain', color: 'bg-slate-800 text-white' },
          { label: 'Objective', color: 'bg-indigo-100 text-indigo-700' },
          { label: 'Practice', color: 'bg-blue-100 text-blue-700' },
          { label: 'Activity / Pertanyaan', color: 'bg-emerald-100 text-emerald-700' },
        ].map(l => (
          <span key={l.label} className={`px-2.5 py-1 rounded-full font-semibold ${l.color}`}>{l.label}</span>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : domains.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-4xl mb-4">📂</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Data COBIT</h3>
          <p className="text-slate-500 mb-6">Data COBIT 2019 akan otomatis diisi saat pertama kali backend dijalankan.</p>
          <button onClick={() => openModal('domain')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            Tambah Domain Manual
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map(domain => {
            const domKey = `d-${domain.id}`;
            const isOpen = expanded[domKey];
            const totalQ = countActivities(domain);
            const gradient = domainColors[domain.code] || 'from-slate-600 to-slate-700';

            return (
              <div key={domain.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Domain Header */}
                <div
                  className={`bg-gradient-to-r ${gradient} text-white p-5 flex items-center justify-between cursor-pointer`}
                  onClick={() => toggle(domKey)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg border border-white/20">
                      {domain.code}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{domain.name}</h3>
                      <p className="text-white/70 text-sm">{domain.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-2xl font-black">{totalQ}</div>
                      <div className="text-white/60 text-xs">Pertanyaan</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal('objective', domain.id, domain.code); }}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white border border-white/20"
                        title="Tambah Objective"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      </button>
                      {isOpen ? CHEVRON_DOWN : CHEVRON_RIGHT}
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                {isOpen && (
                  <div className="divide-y divide-slate-100">
                    {(domain.objectives || []).map(obj => {
                      const objKey = `o-${obj.id}`;
                      const isObjOpen = expanded[objKey];
                      const objQ = (obj.practices || []).reduce((s, p) => s + (p.activities || []).length, 0);

                      return (
                        <div key={obj.id}>
                          {/* Objective Row */}
                          <div
                            className="flex items-center justify-between px-5 py-3 hover:bg-indigo-50/50 cursor-pointer group transition-colors"
                            onClick={() => toggle(objKey)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="ml-4 w-2 h-2 bg-indigo-400 rounded-full"></div>
                              <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2.5 py-1 rounded-lg">{obj.code}</span>
                              <div>
                                <span className="font-semibold text-slate-800 text-sm">{obj.name}</span>
                                <span className="ml-2 text-xs text-slate-400">{objQ} pertanyaan</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); openModal('practice', obj.id, obj.code); }}
                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Tambah Practice"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                              </button>
                              <span className="text-slate-400">{isObjOpen ? CHEVRON_DOWN : CHEVRON_RIGHT}</span>
                            </div>
                          </div>

                          {/* Practices */}
                          {isObjOpen && (
                            <div className="bg-slate-50/60">
                              {(obj.practices || []).map(prac => {
                                const pracKey = `p-${prac.id}`;
                                const isPracOpen = expanded[pracKey];

                                return (
                                  <div key={prac.id}>
                                    {/* Practice Row */}
                                    <div
                                      className="flex items-center justify-between px-8 py-2.5 hover:bg-blue-50/50 cursor-pointer group transition-colors border-t border-slate-100"
                                      onClick={() => toggle(pracKey)}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="ml-4 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                        <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-0.5 rounded">{prac.code}</span>
                                        <div>
                                          <span className="font-medium text-slate-700 text-sm">{prac.name}</span>
                                          <span className="ml-2 text-xs text-slate-400">{(prac.activities || []).length} aktivitas</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); openModal('activity', prac.id, prac.code); }}
                                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                          title="Tambah Activity"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                        <span className="text-slate-400">{isPracOpen ? CHEVRON_DOWN : CHEVRON_RIGHT}</span>
                                      </div>
                                    </div>

                                    {/* Activities */}
                                    {isPracOpen && (
                                      <div className="bg-white border-t border-slate-100">
                                        {(prac.activities || []).map((act, idx) => (
                                          <div key={act.id} className="flex items-start px-12 py-2.5 border-b border-slate-50 last:border-0 hover:bg-emerald-50/40 transition-colors">
                                            <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">
                                              {idx + 1}
                                            </span>
                                            <p className="text-sm text-slate-600 leading-relaxed">{act.description}</p>
                                          </div>
                                        ))}
                                        {(prac.activities || []).length === 0 && (
                                          <div className="px-12 py-2 text-xs text-slate-400 italic">Belum ada aktivitas. Klik + untuk menambah.</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {(obj.practices || []).length === 0 && (
                                <div className="px-8 py-2 text-xs text-slate-400 italic">Belum ada practice.</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(domain.objectives || []).length === 0 && (
                      <div className="px-5 py-3 text-sm text-slate-400 italic">Belum ada objective. Klik + di header domain untuk menambah.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Tambah {typeLabels[modal.type]}</h2>
                {modal.parentName && <p className="text-sm text-slate-500 mt-0.5">dalam: <span className="font-semibold text-indigo-600">{modal.parentName}</span></p>}
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code — only for domain/objective/practice */}
              {modal.type !== 'activity' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kode {typeLabels[modal.type]} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder={modal.type === 'domain' ? 'contoh: DSS' : modal.type === 'objective' ? 'contoh: DSS01' : 'contoh: DSS01.01'}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase"
                  />
                </div>
              )}

              {/* Name — only for domain/objective/practice */}
              {modal.type !== 'activity' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={`Nama ${typeLabels[modal.type]}...`}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {modal.type === 'activity' ? 'Teks Pertanyaan / Aktivitas' : 'Deskripsi'}
                  {modal.type === 'activity' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  required={modal.type === 'activity'}
                  rows={modal.type === 'activity' ? 4 : 2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder={
                    modal.type === 'activity'
                      ? 'Tuliskan pertanyaan atau aktivitas yang perlu dinilai oleh auditee...'
                      : 'Deskripsi singkat (opsional)...'
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Info box for activity */}
              {modal.type === 'activity' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                  💡 Pertanyaan ini akan ditampilkan di kuesioner Auditee dengan pilihan jawaban: <strong>N / P / L / F</strong>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
