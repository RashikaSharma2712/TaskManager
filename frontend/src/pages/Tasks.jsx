import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function Tasks() {
  const { user, isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    try {
      const params = {}
      if (projectFilter) params.projectId = projectFilter
      const { data } = await api.get('/tasks', { params })
      setTasks(data.tasks || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter])

  const projectOptions = useMemo(() => {
    const map = new Map()
    tasks.forEach((t) => {
      const p = t.projectId
      if (p && p._id) map.set(p._id, p.title)
    })
    return [...map.entries()]
  }, [tasks])

  const filtered = useMemo(() => {
    if (!statusFilter) return tasks
    return tasks.filter((t) => t.status === statusFilter)
  }, [tasks, statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}`, { status })
      toast.success('Updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        <p className="text-slate-600">
          {isAdmin ? 'All tasks' : 'Tasks in your projects and assigned to you'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All projects</option>
          {projectOptions.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No tasks match filters.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const assigneeId = t.assignedTo?._id || t.assignedTo
                const canChange =
                  isAdmin ||
                  (assigneeId && String(assigneeId) === String(user?.id))
                return (
                  <tr key={t._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{t.title}</span>
                      {t.projectId?._id && (
                        <Link
                          to={`/projects/${t.projectId._id}`}
                          className="ml-2 text-xs text-indigo-600 hover:underline"
                        >
                          View project
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.projectId?.title || '—'}
                    </td>
                    <td className="px-4 py-3">{t.assignedTo?.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 capitalize">{t.priority}</td>
                    <td className="px-4 py-3">
                      {canChange ? (
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus(t._id, e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className="capitalize">{t.status?.replace('_', ' ')}</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
