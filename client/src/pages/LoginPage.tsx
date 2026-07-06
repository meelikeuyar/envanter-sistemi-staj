import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Hoş geldiniz!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-800 via-brand-700 to-brand-300 p-4">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-36 h-[500px] w-[500px] rounded-full border border-white/[0.06]" />
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full border border-white/[0.06]" />
        <div className="absolute left-24 top-20 h-48 w-48 rounded-full bg-white/[0.03]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md animate-[fadeIn_0.3s_ease] rounded-3xl bg-white p-10 shadow-2xl shadow-brand-900/30"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-0.5 w-10 rounded bg-gradient-to-r from-brand-500 to-brand-300" />
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-brand-400">Hesabınıza giriş yapın</p>
        </div>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-400">
          E-posta
        </label>
        <input
          type="email"
          className="input-base mb-4"
          placeholder="ornek@sirket.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-400">
          Şifre
        </label>
        <input
          type="password"
          className="input-base mb-6"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            'Giriş Yap'
          )}
        </button>

        <p className="mt-6 text-center text-sm text-brand-400">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="font-semibold text-brand-500 hover:text-brand-700">
            Kayıt Ol
          </Link>
        </p>
      </form>
    </div>
  );
}
