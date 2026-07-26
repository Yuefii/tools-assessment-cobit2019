import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI, cobitAPI } from '../services/api';

/**
 * AssessmentWizard — mendukung multi-objective lintas domain.
 * Pertanyaan disusun dari assessment.objectives[] (AssessmentObjective[]),
 * bukan dari domain tunggal.
 */
export default function AssessmentWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evidence, setEvidence] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Group navigation: jump to objective group
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [assessRes, answersRes] = await Promise.all([
        assessmentAPI.getById(id),
        assessmentAPI.getAnswers(id),
      ]);
      const assessmentData = assessRes.data;
      setAssessment(assessmentData);

      // Build flat list of questions from assessment's selected objectives
      // Support both new multi-objective format and old domain format
      const qs = [];
      const assessmentObjectives = assessmentData?.objectives || [];

      if (assessmentObjectives.length > 0) {
        // New format: assessment.objectives = [{objective: {practices: [{activities}]}}]
        for (const ao of assessmentObjectives) {
          const obj = ao.objective || ao;
          for (const prac of (obj.practices || [])) {
            for (const act of (prac.activities || [])) {
              qs.push({
                id: act.id,
                objectiveCode: obj.code,
                objectiveName: obj.name,
                practiceCode: prac.code,
                practiceName: prac.name,
                description: act.description,
              });
            }
          }
        }
      } else if (assessmentData?.domain?.objectives) {
        // Fallback: old format using domain
        const domain = assessmentData.domain;
        for (const obj of domain.objectives) {
          for (const prac of (obj.practices || [])) {
            for (const act of (prac.activities || [])) {
              qs.push({
                id: act.id,
                objectiveCode: obj.code,
                objectiveName: obj.name,
                practiceCode: prac.code,
                practiceName: prac.name,
                description: act.description,
              });
            }
          }
        }
      }

      setQuestions(qs);

      // Pre-fill existing answers
      const existingAnswers = {};
      const existingEvidence = {};
      for (const ans of (answersRes.data || [])) {
        existingAnswers[ans.activity_id] = ans.score_value;
        existingEvidence[ans.activity_id] = ans.evidence_url || '';
      }
      setAnswers(existingAnswers);
      setEvidence(existingEvidence);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Compute objective groups for sidebar navigation
  const objectiveGroups = (() => {
    const groups = [];
    let lastCode = null;
    let startIdx = 0;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].objectiveCode !== lastCode) {
        if (lastCode !== null) {
          groups[groups.length - 1].endIdx = i - 1;
        }
        groups.push({ code: questions[i].objectiveCode, name: questions[i].objectiveName, startIdx: i, endIdx: i });
        lastCode = questions[i].objectiveCode;
      }
      groups[groups.length - 1].endIdx = i;
    }
    return groups;
  })();

  const handleSelectScore = (score) => {
    const qId = questions[currentStep].id;
    setAnswers({ ...answers, [qId]: score });
  };

  const handleSaveAndNext = async () => {
    const q = questions[currentStep];
    const score = answers[q.id];
    if (!score) return;
    try {
      await assessmentAPI.submitAnswer({
        assessment_id: parseInt(id),
        activity_id: q.id,
        score_value: score,
        evidence_url: evidence[q.id] || '',
      });
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Update active group
      const grpIdx = objectiveGroups.findIndex(g => g.startIdx <= nextStep && g.endIdx >= nextStep);
      if (grpIdx >= 0) setActiveGroupIndex(grpIdx);
    } catch (e) {
      alert('Gagal menyimpan jawaban: ' + e.message);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const grpIdx = objectiveGroups.findIndex(g => g.startIdx <= prevStep && g.endIdx >= prevStep);
      if (grpIdx >= 0) setActiveGroupIndex(grpIdx);
    }
  };

  const handleSubmitAll = async () => {
    const q = questions[currentStep];
    const score = answers[q.id];
    if (!score) return;
    setSubmitting(true);
    try {
      await assessmentAPI.submitAnswer({
        assessment_id: parseInt(id),
        activity_id: q.id,
        score_value: score,
        evidence_url: evidence[q.id] || '',
      });
      navigate(`/dashboard/assessments/${id}/report`);
    } catch (e) {
      alert('Gagal submit: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Jump to a specific question
  const jumpTo = (stepIdx) => {
    setCurrentStep(stepIdx);
    const grpIdx = objectiveGroups.findIndex(g => g.startIdx <= stepIdx && g.endIdx >= stepIdx);
    if (grpIdx >= 0) setActiveGroupIndex(grpIdx);
  };

  const scoreOptions = [
    { value: 'N', label: 'Not Achieved', desc: 'Tidak/hampir tidak tercapai (0–15%)', color: 'border-red-200 bg-red-50 text-red-700 hover:border-red-400' },
    { value: 'P', label: 'Partially Achieved', desc: 'Sebagian tercapai (15–50%)', color: 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-400' },
    { value: 'L', label: 'Largely Achieved', desc: 'Sebagian besar tercapai (50–85%)', color: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400' },
    { value: 'F', label: 'Fully Achieved', desc: 'Sepenuhnya tercapai (85–100%)', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400' },
  ];

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  );
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>;
  if (questions.length === 0) return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
      <div className="text-4xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak ada pertanyaan tersedia</h3>
      <p className="text-slate-500 mb-6">Objective yang dipilih belum memiliki aktivitas. Minta Admin untuk mengisi Master Data COBIT.</p>
      <button onClick={() => navigate('/dashboard/assessments')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium">
        Kembali
      </button>
    </div>
  );

  const currentQ = questions[currentStep];
  const currentAnswer = answers[currentQ.id];
  const progress = Math.round(((currentStep + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;

  // Compute per-group answered stats
  const groupStats = objectiveGroups.map(g => {
    const groupQs = questions.slice(g.startIdx, g.endIdx + 1);
    const answered = groupQs.filter(q => answers[q.id]).length;
    return { ...g, answered, total: groupQs.length };
  });

  const currentGroupIdx = objectiveGroups.findIndex(g => g.startIdx <= currentStep && g.endIdx >= currentStep);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/assessments')}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{assessment?.title}</h1>
          <p className="text-slate-500 text-sm">
            {objectiveGroups.length > 1
              ? `${objectiveGroups.length} Objective dipilih — ${objectiveGroups.map(g => g.code).join(', ')}`
              : `${currentQ.objectiveCode} — ${currentQ.objectiveName}`
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Dijawab</p>
          <p className="font-bold text-slate-800">{answeredCount}/{questions.length}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {/* ── Sidebar: Objective Group Navigator (shown when multi-objective) ── */}
        {objectiveGroups.length > 1 && (
          <div className="w-52 shrink-0 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">Navigasi Objective</p>
            {groupStats.map((g, i) => {
              const isCurrent = i === currentGroupIdx;
              const isComplete = g.answered === g.total;
              const isPartial = g.answered > 0 && g.answered < g.total;
              return (
                <button
                  key={g.code}
                  onClick={() => jumpTo(g.startIdx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>{g.code}</span>
                    <span className={`text-xs font-semibold ${
                      isCurrent ? 'text-indigo-200' : isComplete ? 'text-emerald-600' : isPartial ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {isComplete ? '✓' : `${g.answered}/${g.total}`}
                    </span>
                  </div>
                  <p className={`text-xs leading-tight line-clamp-2 ${isCurrent ? 'text-white' : 'text-slate-600'}`}>{g.name}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Main Question Card ── */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Progress bar */}
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-500">
                Pertanyaan {currentStep + 1} dari {questions.length}
              </span>
              <span className="text-sm font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Breadcrumb */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-6">
              <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md">{currentQ.objectiveCode}</span>
              <span>›</span>
              <span className="bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-md">{currentQ.practiceCode}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-2">{currentQ.practiceName}</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">{currentQ.description}</p>

            {/* Score Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {scoreOptions.map((opt) => {
                const isSelected = currentAnswer === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectScore(opt.value)}
                    className={`flex items-start p-4 rounded-2xl border-2 transition-all duration-200 text-left ${opt.color} ${
                      isSelected
                        ? 'ring-4 ring-offset-2 ring-indigo-500 shadow-lg scale-[1.02] border-transparent'
                        : 'opacity-80 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center font-black text-xl mr-4 shrink-0 shadow-sm">
                      {opt.value}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base mb-0.5">{opt.label}</h3>
                      <p className="text-sm opacity-75">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Evidence */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bukti / Catatan (Opsional)</label>
              <textarea
                className="w-full p-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                rows="2"
                placeholder="Tautkan dokumen bukti atau tambahkan catatan di sini..."
                value={evidence[currentQ.id] || ''}
                onChange={e => setEvidence({ ...evidence, [currentQ.id]: e.target.value })}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-colors"
              >
                ← Sebelumnya
              </button>

              {currentStep < questions.length - 1 ? (
                <button
                  onClick={handleSaveAndNext}
                  disabled={!currentAnswer}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-50 flex items-center"
                >
                  Simpan & Lanjut
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmitAll}
                  disabled={!currentAnswer || submitting}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-200 transition-all disabled:opacity-50 flex items-center"
                >
                  {submitting ? 'Memproses...' : 'Selesai & Lihat Laporan'}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
