import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

const statusColors = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-indigo-100 text-indigo-800',
  on_hold: 'bg-amber-100 text-amber-800',
}

export default function Projects() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'active',
    members: [],
  })

  const load = async () => {
    try {
      const [{ data: p }, { data: u }] = await Promise.all([
        api.get('/projects'),
        api.get('/users'),
      ])
      setProjects(p.projects || [])
      setUsers(u.users || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const createProject = async (e) => {
    e.preventDefault()
    try {
      await api.post('/projects', {
        ...form,
        deadline: form.deadline || undefined,
        members: form.members,
      })
      toast.success('Project created')
      setModal(false)
      setForm({
        title: '',
        description: '',
        deadline: '',
        status: 'active',
        members: [],
      })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create project')
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600">Your team workspaces</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            New project
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <p className="col-span-full text-slate-500">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${p._id}`}
                  className="text-lg font-semibold text-indigo-700 hover:underline"
                >
                  {p.title}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[p.status] || statusColors.active}`}
                >
                  {p.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {p.description || '—'}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Deadline:{' '}
                {p.deadline
                  ? new Date(p.deadline).toLocaleDateString()
                  : 'Not set'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Members: {p.members?.length ?? 0}
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => deleteProject(p._id)}
                  className="mt-4 self-start text-sm font-medium text-rose-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">New project</h2>
            <form onSubmit={createProject} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Team members</label>
                <select
                  multiple
                  value={form.members}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      members: Array.from(
                        e.target.selectedOptions,
                        (o) => o.value
                      ),
                    })
                  }
                  className="mt-1 h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
