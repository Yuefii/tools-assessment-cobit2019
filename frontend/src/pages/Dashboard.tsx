import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI, userAPI, cobitAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Activity, 
  CheckCircle2, 
  Users, 
  Network,
  ArrowRight,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, users: 0, domains: 0 });
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [assessRes] = await Promise.allSettled([assessmentAPI.getAll()]);
      const assessments = assessRes.status === 'fulfilled' ? (assessRes.value.data || []) : [];
      
      let usersCount = 0;
      let domainsCount = 0;

      if (isAdmin && isAdmin()) {
        const [usersRes, domainsRes] = await Promise.allSettled([userAPI.getAll(), cobitAPI.getDomains()]);
        usersCount = usersRes.status === 'fulfilled' ? (usersRes.value.data?.length || 0) : 0;
        domainsCount = domainsRes.status === 'fulfilled' ? (domainsRes.value.data?.length || 0) : 0;
      }

      setStats({
        total: assessments.length,
        completed: assessments.filter((a: any) => a.status === 'completed').length,
        active: assessments.filter((a: any) => a.status === 'active').length,
        users: usersCount,
        domains: domainsCount,
      });
      setRecentAssessments(assessments.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    // We use custom tailwind classes on top of the outline badge to get that modern specific color tint
    const customColors: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
      active: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50',
      draft: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };

    return (
      <Badge variant="outline" className={`font-semibold ${customColors[status] || customColors.draft}`}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-primary px-8 py-10 text-primary-foreground shadow-md">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-12 left-[30%] h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10">
          <p className="mb-1 text-sm font-medium text-primary-foreground/80">Selamat Datang,</p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{user?.name || 'User'}</h1>
          <p className="text-primary-foreground/90 max-w-[600px] text-sm">
            COBIT 2019 IT Maturity Assessment Platform — {user?.role?.name}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessment</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessment Aktif</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isAdmin && isAdmin() ? "Total Pengguna" : "COBIT Domains"}
            </CardTitle>
            {isAdmin && isAdmin() ? (
              <Users className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Network className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAdmin && isAdmin() ? stats.users : stats.domains}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Assessments */}
        <Card className="col-span-4 lg:col-span-4">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Assessment Terkini</CardTitle>
              <CardDescription>
                Daftar assessment terakhir yang sedang atau telah berjalan.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/assessments')} className="hidden sm:flex">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentAssessments.length > 0 ? (
              <div className="space-y-3">
                {recentAssessments.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {a.domain?.code} — {a.domain?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <StatusBadge status={a.status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                        onClick={() => navigate(`/dashboard/assessments/${a.id}/report`)}
                        title="Lihat Laporan"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="sr-only">Laporan</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Belum ada assessment.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* COBIT Level Reference */}
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Capability Level</CardTitle>
            <CardDescription>Referensi skala target level COBIT 2019.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { level: 0, name: 'Incomplete', desc: '0-15%' },
                { level: 1, name: 'Initial', desc: '15-50%' },
                { level: 2, name: 'Managed', desc: '50-70%' },
                { level: 3, name: 'Defined', desc: '70-85%' },
                { level: 4, name: 'Quantitatively', desc: '85-95%' },
                { level: 5, name: 'Optimizing', desc: '95-100%' },
              ].map(l => (
                <div key={l.level} className="flex flex-col items-start justify-center rounded-md border p-3 bg-muted/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary/10 text-xs font-bold text-primary">
                      {l.level}
                    </span>
                    <span className="text-[11px] font-semibold tracking-tight">{l.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium pl-[28px] w-full text-left">
                    Target: {l.desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
