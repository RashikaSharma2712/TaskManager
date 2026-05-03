import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-indigo-100 text-indigo-800'
      : 'text-slate-600 hover:bg-slate-100'
  }`

export default function MainLayout() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/dashboard"
            className="text-lg font-semibold text-indigo-700"
          >
            Team Task Manager
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={navClass}>
              Projects
            </NavLink>
            <NavLink to="/tasks" className={navClass}>
              Tasks
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">
              {user?.name}
              <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs capitalize text-slate-700">
                {user?.role}
              </span>
              {isAdmin && (
                <span className="ml-1 text-xs text-amber-700">Admin</span>
              )}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
