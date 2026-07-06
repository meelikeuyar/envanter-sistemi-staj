import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Project } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalProjects: number;
  totalSites: number;
  totalItems: number;
  projects: Project[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalSites: 0,
    totalItems: 0,
    projects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get<Project[]>('/projects');
      const totalSites = data.reduce((a, p) => a + p.siteCount, 0);
      const totalItems = data.reduce((a, p) => a + p.itemCount, 0);
      setStats({
        totalProjects: data.length,
        totalSites,
        totalItems,
        projects: data,
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  const maxItems = Math.max(...stats.projects.map((p) => p.itemCount), 1);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-brand-900">
          Hoş geldiniz, {user?.fullName}
        </h1>
        <p className="mt-1 text-sm text-brand-400">
          Envanter sisteminizin genel görünümü
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="🗂️"
          label="Toplam Proje"
          value={stats.totalProjects}
          color="from-brand-500 to-brand-700"
        />
        <StatCard
          icon="📍"
          label="Toplam Site"
          value={stats.totalSites}
          color="from-emerald-500 to-emerald-700"
        />
        <StatCard
          icon="📦"
          label="Toplam Envanter"
          value={stats.totalItems}
          color="from-violet-500 to-violet-700"
        />
      </div>

      {/* Chart Section */}
      {stats.projects.length > 0 && (
        <div className="mb-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-brand-900">
            Projelere Göre Envanter Dağılımı
          </h2>
          <div className="space-y-4">
            {stats.projects.map((p) => {
              const percentage = maxItems > 0 ? (p.itemCount / maxItems) * 100 : 0;
              return (
                <div key={p._id} className="group">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-800">{p.name}</span>
                    <div className="flex items-center gap-3 text-xs text-brand-400">
                      <span>{p.siteCount} site</span>
                      <span className="font-bold text-brand-600">{p.itemCount} kayıt</span>
                    </div>
                  </div>
                  <div className="h-8 overflow-hidden rounded-lg bg-brand-50">
                    <div
                      className="flex h-full items-center rounded-lg bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700 ease-out"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    >
                      {percentage > 15 && (
                        <span className="pl-3 text-xs font-bold text-white">{p.itemCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-brand-900">Hızlı Erişim</h2>
        {stats.projects.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-3xl">📭</p>
            <p className="mt-2 text-sm text-brand-400">
              Henüz proje yok.{' '}
              <button
                onClick={() => navigate('/projects')}
                className="font-semibold text-brand-500 hover:text-brand-700"
              >
                İlk projenizi oluşturun →
              </button>
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.projects.map((p) => (
              <button
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}/sites`)}
                className="flex items-center gap-3 rounded-xl border border-brand-50 p-4 text-left transition hover:border-brand-200 hover:bg-brand-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg">
                  🗂️
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-brand-900">{p.name}</p>
                  <p className="text-xs text-brand-400">
                    {p.siteCount} site · {p.itemCount} kayıt
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <div
          className={`rounded-full bg-gradient-to-br ${color} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white`}
        >
          {label}
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight text-brand-900">{value}</p>
    </div>
  );
}
