import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI, userAPI, cobitAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAssessor, isAdmin } = useAuth();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1=info, 2=pick scope
  const [submitting, setSubmitting] = useState(false);

  // Data for modal
  const [allDomains, setAllDomains] = useState([]);
  const [auditees, setAuditees] = useState([]);

  // Form state
  const [form, setForm] = useState({ title: '', target_level: 3, auditee_id: '', scope_note: '' });

  // Scope selection state
  const [scopeMode, setScopeMode] = useState('objective'); // 'domain' | 'objective'
  const [selectedDomainIDs, setSelectedDomainIDs] = useState(new Set());
  const [selectedObjectiveIDs, setSelectedObjectiveIDs] = useState(new Set());
  const [expandedDomain, setExpandedDomain] = useState(null);

  useEffect(() => { fetchAssessments(); }, []);

  const fetchAssessments = async () => {
    try {
      const data = await assessmentAPI.getAll();
      setAssessments(data.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    setModalStep(1);
    setSelectedDomainIDs(new Set());
    setSelectedObjectiveIDs(new Set());
    setScopeMode('objective');
    setExpandedDomain(null);
    setForm({ title: '', target_level: 3, auditee_id: '', scope_note: '' });
    try {
      const [domainsRes, usersRes] = await Promise.all([cobitAPI.getDomains(), userAPI.getAll()]);
      setAllDomains(domainsRes.data || []);
      setAuditees((usersRes.data || []).filter(u => u.role?.name === 'Auditee'));
    } catch (e) {
      console.error(e);
    }
  };

  // Domain mode: select all objectives in domain
  const toggleDomain = (domain) => {
    const newDomains = new Set(selectedDomainIDs);
    const newObjs = new Set(selectedObjectiveIDs);
    const domainObjIDs = (domain.objectives || []).map(o => o.id);

    if (newDomains.has(domain.id)) {
      newDomains.delete(domain.id);
      domainObjIDs.forEach(id => newObjs.delete(id));
    } else {
      newDomains.add(domain.id);
      domainObjIDs.forEach(id => newObjs.add(id));
    }
    setSelectedDomainIDs(newDomains);
    setSelectedObjectiveIDs(newObjs);
  };

  // Objective mode: individual pick
  const toggleObjective = (obj, domain) => {
    const newObjs = new Set(selectedObjectiveIDs);
    const newDomains = new Set(selectedDomainIDs);

    if (newObjs.has(obj.id)) {
      newObjs.delete(obj.id);
      // uncheck domain if any obj of it is unchecked
      newDomains.delete(domain.id);
    } else {
      newObjs.add(obj.id);
      // auto-check domain if ALL its objectives are now selected
      const allObjIDs = (domain.objectives || []).map(o => o.id);
      if (allObjIDs.every(id => newObjs.has(id))) {
        newDomains.add(domain.id);
      }
    }
    setSelectedObjectiveIDs(newObjs);
    setSelectedDomainIDs(newDomains);
  };

  const selectedCount = selectedObjectiveIDs.size;

  const buildScopeNote = () => {
    if (form.scope_note.trim()) return form.scope_note;
    // Auto-generate scope note from selected objectives
    const codes = [];
    for (const domain of allDomains) {
      for (const obj of (domain.objectives || [])) {
        if (selectedObjectiveIDs.has(obj.id)) codes.push(obj.code);
      }
    }
    return codes.length > 0 ? `Penilaian mencakup: ${codes.join(', ')}` : '';
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (selectedObjectiveIDs.size === 0) {
      alert('Pilih minimal satu Objective untuk dinilai.');
      return;
    }
    setSubmitting(true);
    try {
      await assessmentAPI.create({
        title: form.title,
        target_level: parseInt(form.target_level),
        auditee_id: parseInt(form.auditee_id),
        scope_note: buildScopeNote(),
        objective_ids: Array.from(selectedObjectiveIDs),
      });
      setShowModal(false);
      await fetchAssessments();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = isAssessor?.() || isAdmin?.();

  // ── Derived: how many objectives per domain are selected
  const domainSelectionInfo = (domain) => {
    const total = (domain.objectives || []).length;
    const selected = (domain.objectives || []).filter(o => selectedObjectiveIDs.has(o.id)).length;
    return { total, selected };
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      active: 'bg-blue-50 text-blue-700 border-blue-200',
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'completed' ? 'bg-emerald-500' : status === 'active' ? 'bg-blue-500' : 'bg-slate-400'
        }`} />
        {status?.toUpperCase()}
      </span>
    );
  };

  // Compute scope label for card
  const getScopeLabel = (a) => {
    if (a.scope_note) return a.scope_note;
    if (a.domain?.code) return `${a.domain.code} — ${a.domain.name}`;
    return 'Multi-domain';
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Assessments</h1>
          <p className="text-slate-500">Kelola sesi audit dan pantau progres pengisian kuesioner.</p>
        </div>
        {canCreate && (
          <button
            id="new-assessment-btn"
            onClick={openModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm shadow-indigo-200 transition-all font-medium text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Assessment Baru
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📋</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Assessment</h3>
          <p className="text-slate-500 mb-6">Buat assessment baru untuk memulai sesi audit COBIT 2019.</p>
          {canCreate && (
            <button onClick={openModal} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Buat Assessment Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map(a => (
            <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <StatusBadge status={a.status} />
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Target: Level {a.target_level}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{a.title}</h3>

                {/* Scope badges — show objective codes if available */}
                {a.objectives && a.objectives.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {a.objectives.slice(0, 4).map((ao, i) => (
                      <span key={i} className="inline-flex items-center bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {ao.objective?.code || ao.code}
                      </span>
                    ))}
                    {a.objectives.length > 4 && (
                      <span className="inline-flex items-center bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-xs font-semibold">
                        +{a.objectives.length - 4} lainnya
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold mb-3">
                    {a.domain?.code || 'Multi-domain'}
                  </div>
                )}

                <p className="text-sm text-slate-500 line-clamp-2">{getScopeLabel(a)}</p>

                <div className="mt-4 flex items-center text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-2">
                    {a.auditee?.name?.substring(0, 2).toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Auditee: </span>
                    <span className="font-medium">{a.auditee?.name || 'Belum ditugaskan'}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/assessments/${a.id}/fill`)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Isi Kuesioner
                </button>
                <button
                  onClick={() => navigate(`/dashboard/assessments/${a.id}/report`)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl transition-colors text-sm"
                  title="Lihat Laporan"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════
          CREATE ASSESSMENT MODAL — 2 STEP
      ════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Assessment Baru</h2>
                <div className="flex items-center mt-2 space-x-2">
                  {[1, 2].map(s => (
                    <div key={s} className="flex items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        modalStep >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>{s}</div>
                      {s < 2 && <div className={`w-16 h-0.5 mx-1 ${modalStep > s ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                  <span className="text-xs text-slate-500 ml-2">
                    {modalStep === 1 ? 'Informasi Dasar' : 'Pilih Ruang Lingkup Penilaian'}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── STEP 1: Basic Info ── */}
            {modalStep === 1 && (
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Assessment <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Audit TI Q1 2025"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Auditee (Responden) <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={form.auditee_id}
                    onChange={e => setForm({ ...form, auditee_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">-- Pilih Auditee --</option>
                    {auditees.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Capability Level (To-Be)</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range" min="1" max="5"
                      value={form.target_level}
                      onChange={e => setForm({ ...form, target_level: e.target.value })}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="font-bold text-indigo-600 text-xl w-8 text-center">{form.target_level}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{['', 'Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing'][form.target_level]}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Keterangan Ruang Lingkup (opsional)</label>
                  <input
                    type="text"
                    value={form.scope_note}
                    onChange={e => setForm({ ...form, scope_note: e.target.value })}
                    placeholder="Misal: Audit layanan TI operasional 2025"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (!form.title || !form.auditee_id) {
                        alert('Judul dan Auditee wajib diisi.');
                        return;
                      }
                      setModalStep(2);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center"
                  >
                    Lanjut — Pilih Ruang Lingkup
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Scope Selection ── */}
            {modalStep === 2 && (
              <>
                <div className="px-6 pt-4 pb-3 border-b border-slate-100 shrink-0">
                  {/* Mode toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-3">
                    <button
                      onClick={() => setScopeMode('objective')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                        scopeMode === 'objective' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      🎯 Per Objective (Lintas Domain)
                    </button>
                    <button
                      onClick={() => setScopeMode('domain')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                        scopeMode === 'domain' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      📂 Per Domain (Semua Objective)
                    </button>
                  </div>

                  {scopeMode === 'objective' && (
                    <p className="text-xs text-slate-500">Centang objective spesifik dari satu atau lebih domain. Ideal untuk penelitian atau audit bertarget.</p>
                  )}
                  {scopeMode === 'domain' && (
                    <p className="text-xs text-slate-500">Pilih domain penuh — semua objective di dalamnya akan dinilai. Cocok untuk audit formal menyeluruh.</p>
                  )}

                  {selectedCount > 0 && (
                    <div className="mt-2 text-xs font-semibold text-indigo-600">
                      ✓ {selectedCount} objective dipilih
                    </div>
                  )}
                </div>

                {/* Scrollable domain/objective list */}
                <div className="overflow-y-auto flex-1 px-6 py-3 space-y-3">
                  {allDomains.map(domain => {
                    const { total, selected } = domainSelectionInfo(domain);
                    const isDomainSelected = selectedDomainIDs.has(domain.id);
                    const isPartial = selected > 0 && selected < total;

                    return (
                      <div key={domain.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Domain header */}
                        <div
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                            isDomainSelected ? 'bg-indigo-50 border-b border-indigo-100' : isPartial ? 'bg-amber-50 border-b border-amber-100' : 'bg-slate-50 border-b border-slate-200'
                          }`}
                          onClick={() => {
                            if (scopeMode === 'domain') {
                              toggleDomain(domain);
                            } else {
                              setExpandedDomain(expandedDomain === domain.id ? null : domain.id);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {scopeMode === 'domain' ? (
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                                  isDomainSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'
                                }`}
                              >
                                {isDomainSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            ) : (
                              <div className={`w-2 h-2 rounded-full ${isDomainSelected ? 'bg-indigo-600' : isPartial ? 'bg-amber-500' : 'bg-slate-300'}`} />
                            )}
                            <div>
                              <span className="font-bold text-slate-800">{domain.code}</span>
                              <span className="text-slate-500 text-sm ml-2">{domain.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              selected > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {selected}/{total}
                            </span>
                            {scopeMode === 'objective' && (
                              <svg
                                className={`w-4 h-4 text-slate-400 transition-transform ${expandedDomain === domain.id ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Objective list (only in objective mode when expanded) */}
                        {scopeMode === 'objective' && expandedDomain === domain.id && (
                          <div className="divide-y divide-slate-100">
                            {(domain.objectives || []).map(obj => {
                              const isObjSelected = selectedObjectiveIDs.has(obj.id);
                              return (
                                <label
                                  key={obj.id}
                                  className={`flex items-start px-4 py-3 cursor-pointer transition-colors ${
                                    isObjSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 mr-3 accent-indigo-600 w-4 h-4 shrink-0"
                                    checked={isObjSelected}
                                    onChange={() => toggleObjective(obj, domain)}
                                  />
                                  <div>
                                    <span className="font-semibold text-slate-800 text-sm">{obj.code}</span>
                                    <span className="text-slate-500 text-sm ml-2">— {obj.name}</span>
                                    {obj.description && (
                                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{obj.description}</p>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                  <button
                    onClick={() => setModalStep(1)}
                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali
                  </button>

                  <button
                    onClick={handleCreate}
                    disabled={submitting || selectedCount === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium flex items-center transition-colors"
                  >
                    {submitting ? 'Membuat...' : `Buat Assessment (${selectedCount} Objective)`}
                    {!submitting && (
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
