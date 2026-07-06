import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import type { Site } from '../types';
import toast from 'react-hot-toast';

export default function SitesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSites();
  }, [projectId]);

  const fetchSites = async () => {
    try {
      const { data } = await api.get<Site[]>(`/projects/${projectId}/sites`);
      setSites(data);
    } catch {
      toast.error('Siteler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<Site>(`/projects/${projectId}/sites`, {
        name: name.trim(),
        code: code.trim(),
      });
      setSites((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setCode('');
      setShowForm(false);
      toast.success('Site oluşturuldu');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Site oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu siteyi ve tüm envanter kayıtlarını silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/projects/${projectId}/sites/${id}`);
      setSites((prev) => prev.filter((s) => s._id !== id));
      toast.success('Site silindi');
    } catch {
      toast.error('Site silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <Link to="/" className="inline-flex items-center gap-1 rounded-lg border border-brand-100 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50">
          ← Projeler
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Siteler</h1>
          <p className="mt-1 text-sm text-brand-400">{sites.length} site tanımlı</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Yeni Site
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
        >
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-brand-400">Site Adı</label>
            <input className="input-base" placeholder="Ankara" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-semibold text-brand-400">Kod</label>
            <input className="input-base" placeholder="ANK" maxLength={5} value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? '...' : 'Ekle'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
            İptal
          </button>
        </form>
      )}

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 py-20 text-center">
          <p className="text-4xl">📍</p>
          <p className="mt-3 text-sm text-brand-400">Henüz site yok. Yeni bir site ekleyerek başlayın.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sites.map((s) => (
            <div
              key={s._id}
              onClick={() => navigate(`/projects/${projectId}/sites/${s._id}/inventory`)}
              className="card group relative cursor-pointer"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-lg">📍</div>
                <div>
                  <h3 className="font-bold text-brand-900">{s.name}</h3>
                  <span className="text-xs font-semibold text-brand-500">{s.code}</span>
                </div>
              </div>
              <p className="border-t border-brand-50 pt-2 text-xs text-brand-400">
                {s.itemCount} envanter kaydı
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s._id);
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
