import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Spinner from '../components/Spinner'

function StatCard({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 bg-white',
    indigo: 'border-indigo-200 bg-indigo-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    amber: 'border-amber-200 bg-amber-50',
    rose: 'border-rose-200 bg-rose-50',
  }
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${tones[tone] || tones.slate}`}
    >
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function BarRow({ label, value, max, colorClass }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span className="truncate pr-2 font-medium text-slate-800">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: res } = await api.get('/dashboard/stats')
        if (!cancelled) setData(res)
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const s = data?.stats || {}
  const userWise = data?.userWiseTasks || []
  const progress = data?.projectProgress || []

  const maxUserTotal = Math.max(0, ...userWise.map((u) => u.total))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Overview of projects and tasks</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total projects" value={s.totalProjects ?? 0} tone="indigo" />
        <StatCard label="Total tasks" value={s.totalTasks ?? 0} />
        <StatCard
          label="Completed tasks"
          value={s.completedTasks ?? 0}
          tone="emerald"
        />
        <StatCard label="Pending tasks" value={s.pendingTasks ?? 0} tone="amber" />
        <StatCard
          label="In progress"
          value={s.inProgressTasks ?? 0}
          tone="slate"
        />
        <StatCard label="Overdue tasks" value={s.overdueTasks ?? 0} tone="rose" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">
            Tasks by assignee
          </h2>
          {userWise.length === 0 ? (
            <p className="text-sm text-slate-500">No task data yet.</p>
          ) : (
            <div className="pt-1">
              {userWise.map((u) => (
                <BarRow
                  key={u.name}
                  label={`${u.name} (${u.completed}/${u.total} done)`}
                  value={u.total}
                  max={maxUserTotal}
                  colorClass="bg-indigo-500"
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">
            Project progress (% complete)
          </h2>
          {progress.length === 0 ? (
            <p className="text-sm text-slate-500">No projects with tasks yet.</p>
          ) : (
            <div className="pt-1">
              {progress.map((p) => (
                <BarRow
                  key={p.projectId}
                  label={`${p.title} — ${p.completed}/${p.total} tasks (${p.percent}%)`}
                  value={p.percent}
                  max={100}
                  colorClass="bg-violet-500"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
