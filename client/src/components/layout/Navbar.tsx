import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-white bg-white/15'
      : 'text-white/70 hover:text-white hover:bg-white/10';

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 shadow-lg shadow-brand-800/20">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-3 text-white">
            <span className="text-lg font-bold tracking-tight">Inventory</span>
            <span className="hidden h-5 w-px bg-white/25 sm:block" />
            <span className="hidden text-sm font-medium text-white/75 sm:block">Management</span>
          </Link>

          <span className="ml-3 h-5 w-px bg-white/20" />

          <div className="ml-2 flex items-center gap-1">
            <Link
              to="/"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${isActive('/projects')}`}
            >
              Projeler
            </Link>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold leading-tight text-white">{user.fullName}</p>
                <p className="text-[10px] text-white/60">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
            >
              Çıkış
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
