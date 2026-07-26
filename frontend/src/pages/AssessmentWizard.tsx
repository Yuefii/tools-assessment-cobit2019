import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, ArrowLeft, Send } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function AssessmentWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evidence, setEvidence] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Group navigation
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [assessRes, answersRes] = await Promise.all([
        assessmentAPI.getById(id!),
        assessmentAPI.getAnswers(id!),
      ]);
      const assessmentData = assessRes.data;
      setAssessment(assessmentData);

      const qs: any[] = [];
      const assessmentObjectives = assessmentData?.objectives || [];

      if (assessmentObjectives.length > 0) {
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

      const existingAnswers: Record<string, string> = {};
      const existingEvidence: Record<string, string> = {};
      for (const ans of (answersRes.data || [])) {
        existingAnswers[ans.activity_id] = ans.score_value;
        existingEvidence[ans.activity_id] = ans.evidence_url || '';
      }
      setAnswers(existingAnswers);
      setEvidence(existingEvidence);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data kuesioner');
    } finally {
      setLoading(false);
    }
  };

  const objectiveGroups = (() => {
    const groups: any[] = [];
    let lastCode = null;
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

  const handleSelectScore = (score: string) => {
    const qId = questions[currentStep].id;
    setAnswers({ ...answers, [qId]: score });
  };

  const handleSaveAndNext = async () => {
    const q = questions[currentStep];
    const score = answers[q.id];
    if (!score) return;
    try {
      await assessmentAPI.submitAnswer({
        assessment_id: parseInt(id!),
        activity_id: q.id,
        score_value: score,
        evidence_url: evidence[q.id] || '',
      });
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const grpIdx = objectiveGroups.findIndex(g => g.startIdx <= nextStep && g.endIdx >= nextStep);
      if (grpIdx >= 0) setActiveGroupIndex(grpIdx);
    } catch (e: any) {
      alert('Gagal menyimpan jawaban: ' + (e.message || 'Error'));
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
        assessment_id: parseInt(id!),
        activity_id: q.id,
        score_value: score,
        evidence_url: evidence[q.id] || '',
      });
      navigate(`/dashboard/assessments/${id}/report`);
    } catch (e: any) {
      alert('Gagal submit: ' + (e.message || 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  const jumpTo = (stepIdx: number) => {
    setCurrentStep(stepIdx);
    const grpIdx = objectiveGroups.findIndex(g => g.startIdx <= stepIdx && g.endIdx >= stepIdx);
    if (grpIdx >= 0) setActiveGroupIndex(grpIdx);
  };

  const scoreOptions = [
    { value: 'N', label: 'Not Achieved', desc: 'Tidak/hampir tidak tercapai (0–15%)' },
    { value: 'P', label: 'Partially Achieved', desc: 'Sebagian tercapai (15–50%)' },
    { value: 'L', label: 'Largely Achieved', desc: 'Sebagian besar tercapai (50–85%)' },
    { value: 'F', label: 'Fully Achieved', desc: 'Sepenuhnya tercapai (85–100%)' },
  ];

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (error) return <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">{error}</div>;
  if (questions.length === 0) return (
    <Card className="max-w-2xl mx-auto mt-8 border-dashed flex flex-col items-center justify-center p-12 text-center bg-muted/30">
      <div className="h-16 w-16 mb-4 flex items-center justify-center rounded-full bg-muted text-4xl">📭</div>
      <CardTitle className="mb-2">Tidak ada pertanyaan tersedia</CardTitle>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Objective yang dipilih belum memiliki aktivitas. Minta Admin untuk mengisi Master Data COBIT.
      </p>
      <Button onClick={() => navigate('/dashboard/assessments')}>
        Kembali ke Daftar
      </Button>
    </Card>
  );

  const currentQ = questions[currentStep];
  const currentAnswer = answers[currentQ.id];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;

  const groupStats = objectiveGroups.map(g => {
    const groupQs = questions.slice(g.startIdx, g.endIdx + 1);
    const answered = groupQs.filter(q => answers[q.id]).length;
    return { ...g, answered, total: groupQs.length };
  });
  const currentGroupIdx = objectiveGroups.findIndex(g => g.startIdx <= currentStep && g.endIdx >= currentStep);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/assessments')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{assessment?.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {objectiveGroups.length > 1
                ? `${objectiveGroups.length} Objective — ${objectiveGroups.map(g => g.code).join(', ')}`
                : `${currentQ.objectiveCode} — ${currentQ.objectiveName}`
              }
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Terjawab</p>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-xl font-bold text-primary leading-none">{answeredCount}</span>
            <span className="text-sm font-medium text-muted-foreground leading-none">/ {questions.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* ── Sidebar: Objective Group Navigator ── */}
        {objectiveGroups.length > 1 && (
          <div className="w-full lg:w-80 shrink-0 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">Navigasi Modul</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {groupStats.map((g, i) => {
                const isCurrent = i === currentGroupIdx;
                const isComplete = g.answered === g.total;
                const isPartial = g.answered > 0 && g.answered < g.total;
                
                return (
                  <button
                    key={g.code}
                    onClick={() => jumpTo(g.startIdx)}
                    className={cn(
                      "w-full text-left px-3 sm:px-4 py-3 rounded-lg border transition-all flex flex-col",
                      isCurrent
                        ? "bg-primary border-primary text-primary-foreground shadow-md"
                        : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-xs font-bold", isCurrent ? "text-primary-foreground/90" : "text-muted-foreground")}>
                        {g.code}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        isCurrent ? "bg-primary-foreground/20 text-primary-foreground" 
                                 : isComplete ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                                 : isPartial ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" 
                                 : "bg-muted text-muted-foreground"
                      )}>
                        {isComplete ? 'Tuntas' : `${g.answered}/${g.total}`}
                      </span>
                    </div>
                    <p className={cn("text-xs font-medium leading-snug line-clamp-2", isCurrent ? "text-primary-foreground" : "text-foreground/80")}>
                      {g.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main Question Area ── */}
        <div className="flex-1 min-w-0">
          <Card className="overflow-hidden border-border/50 shadow-sm">
            {/* Progress Header */}
            <div className="bg-muted/30 px-6 py-5 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Pertanyaan {currentStep + 1} dari {questions.length}
                </span>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <CardContent className="p-6 sm:p-8 md:p-10">
              {/* Question Breadcrumb */}
              <div className="flex items-center flex-wrap gap-2 text-xs mb-6">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{currentQ.objectiveCode}</Badge>
                <span className="text-muted-foreground">›</span>
                <Badge variant="outline" className="text-muted-foreground bg-muted/50">{currentQ.practiceCode}</Badge>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">{currentQ.practiceName}</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {currentQ.description}
                </p>
              </div>

              {/* Score Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {scoreOptions.map((opt) => {
                  const isSelected = currentAnswer === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectScore(opt.value)}
                      className={cn(
                        "flex items-start p-4 rounded-xl border-2 transition-all duration-200 text-left bg-card group",
                        isSelected
                          ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black text-lg mr-4 shrink-0 transition-colors border-2",
                        isSelected 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "bg-muted border-transparent text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                      )}>
                        {opt.value}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h3 className={cn("font-bold text-sm mb-0.5", isSelected ? "text-primary" : "text-foreground")}>
                          {opt.label}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {opt.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-2 shrink-0 pt-1 text-primary">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Evidence */}
              <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                <Label htmlFor="evidence" className="block text-sm font-semibold text-foreground mb-2">
                  Bukti Pendukung / Catatan (Opsional)
                </Label>
                <Textarea
                  id="evidence"
                  className="bg-background resize-none min-h-[80px]"
                  placeholder="Tautkan URL dokumen bukti atau tambahkan catatan di sini..."
                  value={evidence[currentQ.id] || ''}
                  onChange={e => setEvidence({ ...evidence, [currentQ.id]: e.target.value })}
                />
              </div>
            </CardContent>

            {/* Navigation Footer */}
            <CardFooter className="px-6 py-4 border-t bg-muted/10 flex justify-between items-center sm:px-8">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="inline sm:hidden">Kembali</span>
              </Button>

              {currentStep < questions.length - 1 ? (
                <Button
                  onClick={handleSaveAndNext}
                  disabled={!currentAnswer}
                  className="px-6 sm:px-8"
                >
                  <span className="hidden sm:inline">Simpan & Lanjut</span>
                  <span className="inline sm:hidden">Lanjut</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitAll}
                  disabled={!currentAnswer || submitting}
                  className={cn(
                    "px-6 sm:px-8 transition-all",
                    currentAnswer ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  )}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Menyimpan...' : 'Selesai & Kirim'}
                  {!submitting && <Send className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
