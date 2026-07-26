import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI, userAPI, cobitAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, isAdmin, isAssessor } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, users: 0, domains: 0 });
  const [recentAssessments, setRecentAssessments] = useState([]);
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
        completed: assessments.filter(a => a.status === 'completed').length,
        active: assessments.filter(a => a.status === 'active').length,
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

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      active: 'bg-blue-100 text-blue-700 border-blue-200',
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full -mb-12"></div>
        <div className="relative z-10">
          <p className="text-indigo-200 font-medium text-sm mb-1">Selamat Datang,</p>
          <h1 className="text-3xl font-extrabold mb-2">{user?.name || 'User'}</h1>
          <p className="text-indigo-200">COBIT 2019 IT Maturity Assessment Platform — {user?.role?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Assessment" value={stats.total} icon="📋" color="indigo" />
        <StatCard label="Aktif" value={stats.active} icon="⚡" color="blue" />
        <StatCard label="Selesai" value={stats.completed} icon="✅" color="emerald" />
        {isAdmin && isAdmin() ? (
          <StatCard label="Total Pengguna" value={stats.users} icon="👥" color="violet" />
        ) : (
          <StatCard label="COBIT Domains" value={stats.domains} icon="🏗️" color="violet" />
        )}
      </div>

      {/* COBIT Level Reference */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Referensi Capability Level COBIT 2019</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { level: 0, name: 'Incomplete', color: 'bg-red-50 border-red-200 text-red-700', desc: '0-15%' },
            { level: 1, name: 'Initial', color: 'bg-orange-50 border-orange-200 text-orange-700', desc: '15-50%' },
            { level: 2, name: 'Managed', color: 'bg-amber-50 border-amber-200 text-amber-700', desc: '50-70%' },
            { level: 3, name: 'Defined', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', desc: '70-85%' },
            { level: 4, name: 'Quantitatively Managed', color: 'bg-green-50 border-green-200 text-green-700', desc: '85-95%' },
            { level: 5, name: 'Optimizing', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', desc: '95-100%' },
          ].map(l => (
            <div key={l.level} className={`border rounded-xl p-3 text-center ${l.color}`}>
              <div className="text-2xl font-black mb-1">{l.level}</div>
              <div className="text-xs font-bold">{l.name}</div>
              <div className="text-xs opacity-70 mt-0.5">{l.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Assessment Terkini</h3>
            <button onClick={() => navigate('/dashboard/assessments')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Lihat Semua →</button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAssessments.map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-800">{a.title}</p>
                  <p className="text-sm text-slate-500">{a.domain?.code} — {a.domain?.name}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={a.status} />
                  <button
                    onClick={() => navigate(`/dashboard/assessments/${a.id}/report`)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Laporan →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <p className="text-3xl font-black text-slate-800 mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
