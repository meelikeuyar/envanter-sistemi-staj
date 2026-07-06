import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import type { InventoryItem, Pagination } from '../types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function InventoryPage() {
  const { projectId, siteId } = useParams<{ projectId: string; siteId: string }>();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', ipAddress: '', serialNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const basePath = `/projects/${projectId}/sites/${siteId}/items`;

  const fetchItems = useCallback(
    async (page = 1, query = search) => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: '50' });
        if (query) params.set('search', query);
        const { data } = await api.get(`${basePath}?${params}`);
        setItems(data.items);
        setPagination(data.pagination);
      } catch {
        toast.error('Envanter yüklenemedi');
      } finally {
        setLoading(false);
      }
    },
    [basePath, search]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchItems(1, value), 300);
  };

  const resetForm = () => {
    setForm({ name: '', ipAddress: '', serialNumber: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`${basePath}/${editId}`, form);
        toast.success('Kayıt güncellendi');
      } else {
        await api.post(basePath, form);
        toast.success('Kayıt eklendi');
      }
      resetForm();
      fetchItems(pagination.page);
    } catch {
      toast.error('İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({ name: item.name, ipAddress: item.ipAddress, serialNumber: item.serialNumber });
    setEditId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`${basePath}/${id}`);
      toast.success('Kayıt silindi');
      fetchItems(pagination.page);
    } catch {
      toast.error('Kayıt silinemedi');
    }
  };

  const handleExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]!]!;
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
        const parsed = rows
          .slice(1)
          .filter((r) => r[0])
          .map((r) => ({
            name: String(r[0] || ''),
            ipAddress: String(r[1] || ''),
            serialNumber: String(r[2] || ''),
          }));

        if (parsed.length === 0) {
          toast.error('Dosyada geçerli veri bulunamadı');
          return;
        }

        await api.post(`${basePath}/bulk`, { items: parsed });
        toast.success(`${parsed.length} kayıt eklendi`);
        fetchItems(1);
      } catch {
        toast.error('Excel içe aktarma başarısız');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
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
        <Link
          to={`/projects/${projectId}/sites`}
          className="inline-flex items-center gap-1 rounded-lg border border-brand-100 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          ← Siteler
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Envanter</h1>
          <p className="mt-1 text-sm text-brand-400">
            {pagination.total} kayıt
            {search && ` · "${search}" araması`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            + Yeni Kayıt
          </button>
          <label className="btn-secondary cursor-pointer">
            📂 Excel Yükle
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcel} />
          </label>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm"
        >
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-brand-400">Cihaz Adı</label>
            <input
              className="input-base"
              placeholder="Cihaz adı"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-brand-400">IP / Link</label>
            <input
              className="input-base"
              placeholder="192.168.1.1"
              value={form.ipAddress}
              onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-brand-400">Seri No</label>
            <input
              className="input-base"
              placeholder="SN-XXXX"
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? '...' : editId ? 'Güncelle' : 'Ekle'}
          </button>
          <button type="button" className="btn-secondary" onClick={resetForm}>
            İptal
          </button>
        </form>
      )}

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <input
          className="input-base max-w-sm"
          placeholder="🔍 Ad, IP veya seri no ile ara..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {search && (
          <button className="btn-secondary text-xs" onClick={() => handleSearch('')}>
            Temizle
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-brand-800 to-brand-700">
                {['#', 'Cihaz Adı', 'IP / Link', 'Seri Numarası', 'Ekleyen', 'İşlemler'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-brand-300">
                    <span className="block text-3xl">📭</span>
                    <span className="mt-2 block text-sm">
                      {search ? `"${search}" için sonuç bulunamadı.` : 'Henüz envanter kaydı yok.'}
                    </span>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item._id} className="transition hover:bg-brand-50">
                    <td className="border-b border-brand-50 px-4 py-3 text-brand-300 font-medium">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="border-b border-brand-50 px-4 py-3 font-semibold text-brand-900">{item.name}</td>
                    <td className="border-b border-brand-50 px-4 py-3 font-mono text-xs text-brand-500">{item.ipAddress}</td>
                    <td className="border-b border-brand-50 px-4 py-3 font-mono text-xs text-brand-600">{item.serialNumber}</td>
                    <td className="border-b border-brand-50 px-4 py-3 text-xs text-brand-400">{item.addedBy?.fullName || '—'}</td>
                    <td className="border-b border-brand-50 px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-brand-400">
          <span>
            Sayfa {pagination.page} / {pagination.pages} · Toplam {pagination.total} kayıt
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchItems(pagination.page - 1)}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              ← Önceki
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchItems(pagination.page + 1)}
              className="btn-secondary text-xs disabled:opacity-40"
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
