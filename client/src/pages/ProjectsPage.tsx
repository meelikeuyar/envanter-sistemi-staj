import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Project } from '../types';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get<Project[]>('/projects');
      setProjects(data);
    } catch {
      toast.error('Projeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<Project>('/projects', { name: name.trim(), description: description.trim() });
      setProjects((prev) => [data, ...prev]);
      setName('');
      setDescription('');
      setShowForm(false);
      toast.success('Proje oluşturuldu');
    } catch {
      toast.error('Proje oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu projeyi ve tüm verilerini silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success('Proje silindi');
    } catch {
      toast.error('Proje silinemedi');
    }
  };

  const totalItems = projects.reduce((a, p) => a + p.itemCount, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Projeler</h1>
          <p className="mt-1 text-sm text-brand-400">
            {projects.length} proje · {totalItems} toplam envanter kaydı
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Yeni Proje
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
        >
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-brand-400">Proje Adı</label>
            <input className="input-base" placeholder="Proje adı" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-brand-400">Açıklama</label>
            <input className="input-base" placeholder="Opsiyonel" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? '...' : 'Ekle'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
            İptal
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-20 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 text-sm text-brand-400">Henüz proje yok. Yeni bir proje oluşturarak başlayın.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/projects/${p._id}/sites`)}
              className="card group relative cursor-pointer"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-xl">
                🗂️
              </div>
              <h3 className="text-lg font-bold text-brand-900">{p.name}</h3>
              {p.description && <p className="mt-1 text-xs text-brand-400 line-clamp-2">{p.description}</p>}
              <p className="mt-3 text-xs text-brand-400">
                {p.siteCount} site · {p.itemCount} kayıt
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p._id);
                }}
                className="absolute right-3 top-3 rounded-lg bg-red-50 px-2 py-1 text-xs text-red-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-100"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
