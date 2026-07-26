import { useState, useEffect } from 'react';
import { cobitAPI } from '../services/api';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus, FolderOpen, Loader2, Info, AlertCircle, ListTree } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MasterData() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Modal state
  const [modal, setModal] = useState({ open: false, type: '', parentId: null as number | null, parentName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });

  useEffect(() => { fetchDomains(); }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const data = await cobitAPI.getDomains();
      setDomains(data.data || []);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const openModal = (type: string, parentId: number | null = null, parentName = '') => {
    setForm({ code: '', name: '', description: '' });
    setModal({ open: true, type, parentId, parentName });
  };

  const closeModal = () => setModal({ open: false, type: '', parentId: null, parentName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (e: any) {
      alert('Gagal menyimpan: ' + (e.message || 'Terjadi kesalahan'));
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabels: Record<string, string> = {
    domain: 'Domain COBIT',
    objective: 'Objective',
    practice: 'Practice / Kontrol',
    activity: 'Activity / Pertanyaan',
  };

  const countActivities = (domain: any) => {
    let n = 0;
    for (const obj of (domain.objectives || [])) {
      for (const prac of (obj.practices || [])) {
        n += (prac.activities || []).length;
      }
    }
    return n;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">COBIT 2019 Master Data</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola hierarki Domain → Objective → Practice → Activity.</p>
        </div>
        <Button onClick={() => openModal('domain')} className="h-10 px-5 font-medium">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Domain
        </Button>
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
      ) : domains.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/30">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <CardTitle className="mb-2">Belum Ada Data COBIT</CardTitle>
          <CardDescription className="mb-6 max-w-md">
            Data COBIT 2019 akan otomatis diisi saat pertama kali backend dijalankan, atau Anda bisa menambahkannya secara manual.
          </CardDescription>
          <Button onClick={() => openModal('domain')} variant="outline" className="mt-2 h-10 px-5 font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Domain Manual
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map(domain => {
            const domKey = `d-${domain.id}`;
            const isDomainOpen = expanded[domKey];
            const totalQ = countActivities(domain);

            return (
              <Collapsible 
                key={domain.id} 
                open={isDomainOpen} 
                onOpenChange={() => toggle(domKey)}
                className="rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                {/* Domain Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start sm:items-center gap-5 flex-1">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
                        {isDomainOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-muted font-bold text-lg text-foreground shadow-sm">
                      {domain.code}
                    </div>
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold tracking-tight text-lg mb-1">{domain.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{domain.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pl-12 sm:pl-0 shrink-0">
                    <div className="text-right hidden sm:block mr-2">
                      <div className="text-sm font-semibold">{totalQ}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Pertanyaan</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openModal('objective', domain.id, domain.code); }}
                      className="h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">Objective</span>
                    </Button>
                  </div>
                </div>

                {/* Objectives */}
                <CollapsibleContent>
                  <div className="border-t bg-card">
                    {(domain.objectives || []).length === 0 ? (
                      <div className="px-6 py-6 text-center text-sm text-muted-foreground">
                        Belum ada Objective. Tambahkan Objective pertama untuk domain ini.
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {(domain.objectives || []).map((obj: any) => {
                          const objKey = `o-${obj.id}`;
                          const isObjOpen = expanded[objKey];
                          const objQ = (obj.practices || []).reduce((s: number, p: any) => s + (p.activities || []).length, 0);

                          return (
                            <Collapsible 
                              key={obj.id} 
                              open={isObjOpen} 
                              onOpenChange={() => toggle(objKey)}
                              className="border-b last:border-b-0"
                            >
                              {/* Objective Row */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 pl-6 sm:pl-12 gap-3 hover:bg-muted/40 transition-colors bg-muted/10">
                                <div className="flex items-center gap-3">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0 h-6 w-6 text-muted-foreground hover:text-foreground">
                                      {isObjOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                  </CollapsibleTrigger>
                                  <Badge variant="secondary" className="font-mono text-xs">{obj.code}</Badge>
                                  <div>
                                    <span className="font-medium text-sm">{obj.name}</span>
                                    <span className="ml-2 text-[11px] text-muted-foreground border-l pl-2">{objQ} Pertanyaan</span>
                                  </div>
                                </div>
                                <div className="pl-10 sm:pl-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); openModal('practice', obj.id, obj.code); }}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                                  >
                                    <Plus className="h-3 w-3 mr-1.5" />
                                    Practice
                                  </Button>
                                </div>
                              </div>

                              {/* Practices */}
                              <CollapsibleContent>
                                <div className="border-t border-border/50 bg-background/50">
                                  {(obj.practices || []).length === 0 ? (
                                    <div className="px-16 py-4 text-xs text-muted-foreground">
                                      Belum ada Practice.
                                    </div>
                                  ) : (
                                    <div className="flex flex-col">
                                      {(obj.practices || []).map((prac: any) => {
                                        const pracKey = `p-${prac.id}`;
                                        const isPracOpen = expanded[pracKey];
                                        const pracQ = (prac.activities || []).length;

                                        return (
                                          <Collapsible 
                                            key={prac.id} 
                                            open={isPracOpen} 
                                            onOpenChange={() => toggle(pracKey)}
                                            className="border-b border-border/50 last:border-b-0"
                                          >
                                            {/* Practice Row */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 pl-12 sm:pl-20 gap-2 hover:bg-muted/30 transition-colors">
                                              <div className="flex items-center gap-3">
                                                <CollapsibleTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="shrink-0 h-5 w-5 text-muted-foreground hover:text-foreground">
                                                    {isPracOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                  </Button>
                                                </CollapsibleTrigger>
                                                <Badge variant="outline" className="font-mono text-[10px] py-0">{prac.code}</Badge>
                                                <div>
                                                  <span className="font-medium text-[13px]">{prac.name}</span>
                                                  <span className="ml-2 text-[10px] text-muted-foreground border-l pl-2">{pracQ} Aktivitas</span>
                                                </div>
                                              </div>
                                              <div className="pl-10 sm:pl-0">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={(e) => { e.stopPropagation(); openModal('activity', prac.id, prac.code); }}
                                                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-primary"
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />
                                                  Activity
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Activities */}
                                            <CollapsibleContent>
                                              <div className="border-t border-border/30 bg-background">
                                                {(prac.activities || []).length === 0 ? (
                                                  <div className="px-20 py-3 text-[11px] text-muted-foreground italic">
                                                    Belum ada aktivitas / pertanyaan.
                                                  </div>
                                                ) : (
                                                  <div className="flex flex-col py-1">
                                                    {(prac.activities || []).map((act: any, idx: number) => (
                                                      <div key={act.id} className="flex items-start px-16 sm:px-28 py-2 gap-3 hover:bg-muted/20 transition-colors">
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted/50 text-[10px] font-medium text-muted-foreground mt-0.5 border">
                                                          {idx + 1}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{act.description}</p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </CollapsibleContent>
                                          </Collapsible>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Dialog / Modal */}
      <Dialog open={modal.open} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah {typeLabels[modal.type]}</DialogTitle>
            {modal.parentName && (
              <DialogDescription>
                Menambahkan ke dalam <span className="font-semibold text-foreground">{modal.parentName}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Code */}
            {modal.type !== 'activity' && (
              <div className="space-y-2">
                <Label htmlFor="code">
                  Kode {typeLabels[modal.type]} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  required
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder={modal.type === 'domain' ? 'contoh: DSS' : modal.type === 'objective' ? 'contoh: DSS01' : 'contoh: DSS01.01'}
                  className="font-mono uppercase"
                />
              </div>
            )}

            {/* Name */}
            {modal.type !== 'activity' && (
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={`Nama ${typeLabels[modal.type]}...`}
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc">
                {modal.type === 'activity' ? 'Teks Pertanyaan / Aktivitas' : 'Deskripsi'}
                {modal.type === 'activity' && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Textarea
                id="desc"
                required={modal.type === 'activity'}
                rows={modal.type === 'activity' ? 4 : 2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder={
                  modal.type === 'activity'
                    ? 'Tuliskan pertanyaan atau aktivitas yang perlu dinilai oleh auditee...'
                    : 'Deskripsi singkat (opsional)...'
                }
                className="resize-none"
              />
            </div>

            {/* Info for activity */}
            {modal.type === 'activity' && (
              <div className="flex gap-2 rounded-lg bg-muted p-3 text-[11px] text-muted-foreground font-medium border">
                <Info className="h-4 w-4 shrink-0" />
                <p>Pertanyaan ini akan ditampilkan di kuesioner Auditee dengan pilihan jawaban N/P/L/F.</p>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
