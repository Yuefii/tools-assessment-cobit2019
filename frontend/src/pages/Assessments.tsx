import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI, userAPI, cobitAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, ClipboardList, Loader2, BarChart3, AlertCircle, ChevronDown, ChevronRight, ChevronLeft, PenSquare, Eye, Search, Trash2, CheckCircle2, Undo2 } from 'lucide-react';

export default function Assessments() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAssessor, isAdmin, isAuditee } = useAuth();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1=info, 2=pick scope
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Complete state
  const [assessmentToComplete, setAssessmentToComplete] = useState<any>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Data for modal
  const [allDomains, setAllDomains] = useState<any[]>([]);
  const [auditees, setAuditees] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState({ title: '', target_level: 3, auditee_id: '', scope_note: '' });

  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Scope selection state
  const [scopeMode, setScopeMode] = useState('objective'); // 'domain' | 'objective'
  const [selectedDomainIDs, setSelectedDomainIDs] = useState<Set<number>>(new Set());
  const [selectedObjectiveIDs, setSelectedObjectiveIDs] = useState<Set<number>>(new Set());
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null);

  useEffect(() => { fetchAssessments(); }, [page, limit, debouncedSearch]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAll(page, limit, debouncedSearch);
      setAssessments(data.data || []);
      setTotal(data.meta?.total || 0);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
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
      setAuditees((usersRes.data || []).filter((u: any) => u.role?.name === 'Auditee'));
    } catch (e) {
      console.error(e);
    }
  };

  // Domain mode: select all objectives in domain
  const toggleDomain = (domain: any) => {
    const newDomains = new Set(selectedDomainIDs);
    const newObjs = new Set(selectedObjectiveIDs);
    const domainObjIDs = (domain.objectives || []).map((o: any) => o.id);

    if (newDomains.has(domain.id)) {
      newDomains.delete(domain.id);
      domainObjIDs.forEach((id: number) => newObjs.delete(id));
    } else {
      newDomains.add(domain.id);
      domainObjIDs.forEach((id: number) => newObjs.add(id));
    }
    setSelectedDomainIDs(newDomains);
    setSelectedObjectiveIDs(newObjs);
  };

  // Objective mode: individual pick
  const toggleObjective = (obj: any, domain: any) => {
    const newObjs = new Set(selectedObjectiveIDs);
    const newDomains = new Set(selectedDomainIDs);

    if (newObjs.has(obj.id)) {
      newObjs.delete(obj.id);
      // uncheck domain if any obj of it is unchecked
      newDomains.delete(domain.id);
    } else {
      newObjs.add(obj.id);
      // auto-check domain if ALL its objectives are now selected
      const allObjIDs = (domain.objectives || []).map((o: any) => o.id);
      if (allObjIDs.every((id: number) => newObjs.has(id))) {
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
    const codes: string[] = [];
    for (const domain of allDomains) {
      for (const obj of (domain.objectives || [])) {
        if (selectedObjectiveIDs.has(obj.id)) codes.push(obj.code);
      }
    }
    return codes.length > 0 ? `Penilaian mencakup: ${codes.join(', ')}` : '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedObjectiveIDs.size === 0) {
      alert('Pilih minimal satu Objective untuk dinilai.');
      return;
    }
    setSubmitting(true);
    try {
      await assessmentAPI.create({
        title: form.title,
        target_level: form.target_level,
        auditee_id: parseInt(form.auditee_id),
        scope_note: buildScopeNote(),
        objective_ids: Array.from(selectedObjectiveIDs),
      });
      setShowModal(false);
      await fetchAssessments();
    } catch (e: any) {
      alert(e.message || 'Gagal membuat assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!assessmentToDelete) return;
    setIsDeleting(true);
    try {
      await assessmentAPI.delete(assessmentToDelete.id);
      setAssessmentToDelete(null);
      fetchAssessments(); // Refresh
    } catch (e: any) {
      alert(e.message || 'Gagal menghapus assessment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await assessmentAPI.updateStatus(id, status);
      await fetchAssessments();
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah status');
    }
  };

  const canCreate = isAssessor?.() || isAdmin?.();

  // Derived: how many objectives per domain are selected
  const domainSelectionInfo = (domain: any) => {
    const total = (domain.objectives || []).length;
    const selected = (domain.objectives || []).filter((o: any) => selectedObjectiveIDs.has(o.id)).length;
    return { total, selected };
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const customColors: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
      active: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
      draft: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };
    const dotColors: Record<string, string> = {
      completed: 'bg-emerald-500',
      active: 'bg-blue-500',
      draft: 'bg-slate-400',
    };
    
    return (
      <Badge variant="outline" className={`font-semibold pl-2 pr-2.5 ${customColors[status] || customColors.draft}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${dotColors[status] || dotColors.draft}`} />
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const getScopeLabel = (a: any) => {
    if (a.scope_note) return a.scope_note;
    if (a.domain?.code) return `${a.domain.code} — ${a.domain.name}`;
    return 'Multi-domain';
  };

  const targetLevelNames = ['', 'Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assessments</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola sesi audit dan pantau progres pengisian kuesioner.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari judul assessment..."
              className="pl-9 h-10 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canCreate && (
            <Button onClick={openModal} className="h-10 px-5 font-medium shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Baru
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : assessments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/30">
          <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <CardTitle className="mb-2">Belum Ada Assessment</CardTitle>
          <CardDescription className="mb-6 max-w-md">
            Buat assessment baru untuk memulai sesi penilaian dan audit kapabilitas TI berbasis COBIT 2019.
          </CardDescription>
          {canCreate && (
            <Button onClick={openModal} variant="outline" className="h-10 px-6 font-medium">
              <Plus className="mr-2 h-4 w-4" />
              Buat Assessment Pertama
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map(a => (
              <Card key={a.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow relative">
                <CardHeader className="p-5 pb-4">
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <StatusBadge status={a.status} />
                    <Badge variant="secondary" className="font-semibold text-[10px] tracking-wider uppercase">
                      Target: Level {a.target_level}
                    </Badge>
                  </div>
                  {(isAdmin?.() || (isAssessor?.() && a.assessor_id === user?.id)) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssessmentToDelete(a);
                      }}
                      title="Hapus Assessment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <CardTitle className="text-lg leading-tight mb-1 pr-6">{a.title}</CardTitle>
                  
                  {/* Scope badges */}
                  <div className="mt-3">
                    {a.objectives && a.objectives.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {a.objectives.slice(0, 4).map((ao: any, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20">
                            {ao.objective?.code || ao.code}
                          </Badge>
                        ))}
                        {a.objectives.length > 4 && (
                          <Badge variant="secondary" className="text-muted-foreground">
                            +{a.objectives.length - 4} lainnya
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {a.domain?.code || 'Multi-domain'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-3 text-[13px] line-clamp-2">
                    {getScopeLabel(a)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1">
                  <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-xs border text-muted-foreground">
                      {a.auditee?.name?.substring(0, 2).toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Auditee</span>
                      <span className="text-sm font-medium leading-none mt-0.5 truncate">{a.auditee?.name || 'Belum ditugaskan'}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 bg-muted/30 border-t gap-2">
                  {isAuditee && isAuditee() ? (
                    <>
                      <Button 
                        onClick={() => navigate(`/dashboard/assessments/${a.id}/fill`)} 
                        className="w-full flex-1"
                        variant={a.status === 'completed' ? 'outline' : 'default'}
                      >
                        {a.status === 'completed' ? <Eye className="mr-2 h-4 w-4" /> : <PenSquare className="mr-2 h-4 w-4" />}
                        {a.status === 'completed' ? 'Lihat Jawaban' : 'Isi Kuesioner'}
                      </Button>
                      {a.status === 'completed' && (
                        <Button 
                          variant="default" 
                          size="icon"
                          onClick={() => navigate(`/dashboard/assessments/${a.id}/report`)}
                          title="Lihat Laporan"
                          className="shrink-0"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => navigate(`/dashboard/assessments/${a.id}/report`)} 
                        className="w-full flex-1"
                        variant={a.status === 'completed' ? 'default' : 'outline'}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Laporan
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/dashboard/assessments/${a.id}/fill`)}
                        title="Review Kuesioner"
                        className="shrink-0 px-3"
                      >
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Review</span>
                      </Button>
                      {a.status === 'completed' ? (
                        <Button 
                          variant="outline" 
                          onClick={() => handleUpdateStatus(a.id, 'active')}
                          title="Buka Kembali (Active)"
                          className="shrink-0 px-3 text-muted-foreground hover:text-foreground"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setAssessmentToComplete(a)}
                          title="Tandai Selesai"
                          className="shrink-0 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Menampilkan <span className="font-medium text-foreground">{assessments.length}</span> dari <span className="font-medium text-foreground">{total}</span> assessment
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sebelumnya</span>
                </Button>
                <div className="text-sm font-medium px-2">
                  Halaman {page} dari {Math.ceil(total / limit) || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  <span className="hidden sm:inline">Selanjutnya</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          CREATE ASSESSMENT MODAL — 2 STEP
      ════════════════════════════════════ */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="sm:max-w-[600px] p-0 flex flex-col gap-0 max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-muted/10">
            <DialogTitle>Assessment Baru</DialogTitle>
            <DialogDescription className="mt-2 flex items-center gap-2">
              <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${modalStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</span>
              <span className={modalStep >= 1 ? 'text-foreground font-medium text-xs' : 'text-xs'}>Info Dasar</span>
              
              <span className="w-8 h-px bg-border mx-1" />
              
              <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${modalStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
              <span className={modalStep >= 2 ? 'text-foreground font-medium text-xs' : 'text-xs'}>Ruang Lingkup</span>
            </DialogDescription>
          </DialogHeader>

          {/* ── STEP 1: Basic Info ── */}
          {modalStep === 1 && (
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Assessment <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Audit TI Q1 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditee">Auditee (Responden) <span className="text-destructive">*</span></Label>
                <Select value={form.auditee_id?.toString()} onValueChange={(val) => setForm({ ...form, auditee_id: val })}>
                  <SelectTrigger id="auditee" className="w-full">
                    <SelectValue placeholder="-- Pilih Auditee --">
                      {form.auditee_id ? auditees.find(u => u.id.toString() === form.auditee_id.toString())?.name : "-- Pilih Auditee --"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {auditees.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label>Target Capability Level (To-Be)</Label>
                  <span className="font-bold text-primary text-xl leading-none">{form.target_level}</span>
                </div>
                <Slider
                  min={1} max={5} step={1}
                  value={[form.target_level]}
                  onValueChange={(val: any) => setForm({ ...form, target_level: Array.isArray(val) ? val[0] : val })}
                  className="py-2 w-full"
                />
                <p className="text-xs text-muted-foreground font-medium">
                  {targetLevelNames[form.target_level]}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope_note">Keterangan Ruang Lingkup (Opsional)</Label>
                <Input
                  id="scope_note"
                  value={form.scope_note}
                  onChange={e => setForm({ ...form, scope_note: e.target.value })}
                  placeholder="Misal: Audit layanan TI operasional 2025"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (!form.title || !form.auditee_id) {
                      alert('Judul dan Auditee wajib diisi.');
                      return;
                    }
                    setModalStep(2);
                  }}
                  className="px-6"
                >
                  Selanjutnya <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Scope Selection ── */}
          {modalStep === 2 && (
            <>
              <div className="px-6 pt-4 pb-3 border-b shrink-0 bg-muted/5">
                {/* Mode toggle */}
                <div className="flex p-1 bg-muted rounded-lg mb-3">
                  <button
                    onClick={() => setScopeMode('objective')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                      scopeMode === 'objective' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Per Objective (Lintas Domain)
                  </button>
                  <button
                    onClick={() => setScopeMode('domain')}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                      scopeMode === 'domain' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Per Domain (Penuh)
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {scopeMode === 'objective' 
                    ? 'Centang objective spesifik secara bebas. Ideal untuk audit spesifik / bertarget.'
                    : 'Pilih domain. Semua objective di dalam domain tersebut akan langsung terpilih.'}
                </p>

                {selectedCount > 0 && (
                  <div className="mt-3 text-xs font-semibold text-primary flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                    {selectedCount} objective dipilih
                  </div>
                )}
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {allDomains.map(domain => {
                  const { total, selected } = domainSelectionInfo(domain);
                  const isDomainSelected = selectedDomainIDs.has(domain.id);
                  const isPartial = selected > 0 && selected < total;
                  const isExpanded = expandedDomain === domain.id;

                  return (
                    <div key={domain.id} className="border rounded-lg overflow-hidden bg-card transition-colors hover:border-primary/30">
                      {/* Domain Header */}
                      <div
                        className={`flex items-center justify-between p-3 sm:px-4 cursor-pointer select-none transition-colors ${
                          isDomainSelected ? 'bg-primary/5' : isPartial ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          if (scopeMode === 'domain') {
                            toggleDomain(domain);
                          } else {
                            setExpandedDomain(isExpanded ? null : domain.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {scopeMode === 'domain' ? (
                            <Checkbox 
                              checked={isDomainSelected} 
                              onCheckedChange={() => toggleDomain(domain)}
                              className="mr-1"
                              onClick={(e) => e.stopPropagation()} // Let the row click handle it or prevent double fire
                            />
                          ) : (
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isDomainSelected ? 'bg-primary' : isPartial ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={isDomainSelected || isPartial ? 'border-primary/50 text-primary bg-background' : 'bg-background'}>
                              {domain.code}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground line-clamp-1">{domain.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <Badge variant="secondary" className={`font-mono text-[10px] ${selected > 0 ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}>
                            {selected}/{total}
                          </Badge>
                          {scopeMode === 'objective' && (
                            <div className="text-muted-foreground">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Objectives List (Objective Mode only) */}
                      {scopeMode === 'objective' && isExpanded && (
                        <div className="border-t bg-muted/10 divide-y divide-border/50">
                          {(domain.objectives || []).map((obj: any) => {
                            const isObjSelected = selectedObjectiveIDs.has(obj.id);
                            return (
                              <label
                                key={obj.id}
                                className={`flex items-start p-3 pl-8 sm:pl-10 cursor-pointer transition-colors ${
                                  isObjSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                                }`}
                              >
                                <Checkbox
                                  checked={isObjSelected}
                                  onCheckedChange={() => toggleObjective(obj, domain)}
                                  className="mt-0.5 mr-3"
                                />
                                <div className="flex flex-col gap-0.5 pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-foreground">{obj.code}</span>
                                    <span className="text-sm text-muted-foreground line-clamp-1">— {obj.name}</span>
                                  </div>
                                  {obj.description && (
                                    <p className="text-xs text-muted-foreground/80 leading-relaxed">{obj.description}</p>
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

              {/* Step 2 Footer */}
              <div className="px-6 py-4 border-t bg-muted/10 flex justify-between items-center shrink-0">
                <Button variant="ghost" onClick={() => setModalStep(1)}>
                  Kembali
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={submitting || selectedCount === 0}
                  className="min-w-[120px]"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? 'Membuat...' : `Simpan (${selectedCount} Obj)`}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════
          DELETE ALERT DIALOG
      ════════════════════════════════════ */}
      <AlertDialog open={!!assessmentToDelete} onOpenChange={(open) => !open && setAssessmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Assessment <strong>"{assessmentToDelete?.title}"</strong> beserta data audit terkait (jawaban, bukti, dsb) akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ════════════════════════════════════
          COMPLETE ALERT DIALOG
      ════════════════════════════════════ */}
      <AlertDialog open={!!assessmentToComplete} onOpenChange={(open) => !open && setAssessmentToComplete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tandai Assessment Selesai?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyelesaikan penilaian <strong>"{assessmentToComplete?.title}"</strong>? 
              Setelah ditandai selesai, laporan akhir akan dapat diakses oleh Auditee dan statusnya akan berubah menjadi Completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { 
                e.preventDefault(); 
                setIsCompleting(true);
                handleUpdateStatus(assessmentToComplete.id, 'completed').finally(() => {
                  setIsCompleting(false);
                  setAssessmentToComplete(null);
                });
              }} 
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isCompleting}
            >
              {isCompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              {isCompleting ? 'Menyimpan...' : 'Ya, Selesai'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
