import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-brand-200">404</p>
        <h1 className="mt-4 text-xl font-bold text-brand-900">Sayfa Bulunamadı</h1>
        <p className="mt-2 text-sm text-brand-400">Aradığınız sayfa mevcut değil.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
