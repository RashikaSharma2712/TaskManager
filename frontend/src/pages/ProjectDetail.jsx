import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending',
  })

  const load = async () => {
    try {
      const [{ data: res }, { data: u }] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users'),
      ])
      setData(res)
      setUsers(u.users || [])
      const p = res.project
      setEditForm({
        title: p.title,
        description: p.description || '',
        deadline: p.deadline ? p.deadline.slice(0, 10) : '',
        status: p.status,
        members: (p.members || []).map((m) => m._id),
      })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load project')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when id changes
  }, [id])

  const saveProject = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/projects/${id}`, {
        ...editForm,
        deadline: editForm.deadline || undefined,
      })
      toast.success('Project updated')
      setEditOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!taskForm.assignedTo) {
      toast.error('Assign to a team member')
      return
    }
    try {
      await api.post(`/tasks/project/${id}`, {
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: taskForm.assignedTo,
        priority: taskForm.priority,
        status: taskForm.status,
        dueDate: taskForm.dueDate || undefined,
      })
      toast.success('Task created')
      setTaskOpen(false)
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        status: 'pending',
      })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create task')
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status })
      toast.success('Task updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  if (loading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const { project, tasks } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            ← Projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {project.title}
          </h1>
          <p className="mt-1 text-slate-600">{project.description || '—'}</p>
          <p className="mt-2 text-sm text-slate-500">
            Deadline:{' '}
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : 'Not set'}{' '}
            · Status:{' '}
            <span className="capitalize">{project.status?.replace('_', ' ')}</span>
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50"
          >
            Edit project
          </button>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tasks</h2>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setTaskOpen(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              Add task
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(tasks || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No tasks yet.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {t.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.assignedTo?.name}
                    </td>
                    <td className="px-4 py-3 capitalize">{t.priority}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={t.status}
                        onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                        className="rounded border border-slate-300 px-2 py-1 text-sm"
                      >
                        {Object.entries(statusLabels).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">Edit project</h2>
            <form onSubmit={saveProject} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deadline: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Members</label>
                <select
                  multiple
                  value={editForm.members}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      members: Array.from(
                        e.target.selectedOptions,
                        (o) => o.value
                      ),
                    })
                  }
                  className="mt-1 h-28 w-full rounded-lg border px-3 py-2"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold">New task</h2>
            <form onSubmit={createTask} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assign to</label>
                <select
                  required
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  <option value="">Select member</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Due date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Initial status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, status: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setTaskOpen(false)}
                  className="rounded-lg border px-4 py-2"
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
