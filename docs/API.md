# Team Task Manager — REST API

Base URL: `http://localhost:5000/api` (configurable via `PORT`).

All protected routes require header:

```http
Authorization: Bearer <JWT>
```

Responses are JSON. Errors use `{ "success": false, "message": "..." }` (and optional `errors` from validation).

---

## Authentication

### `POST /auth/register`

Public. Creates user (default role `member`).

**Body**

| Field | Type | Required |
|-------|------|----------|
| name | string | yes |
| email | string | yes |
| password | string | yes (min 6) |
| adminSecret | string | no — if equal to server `ADMIN_REGISTRATION_SECRET`, role becomes `admin` |

**Success:** `201` — `{ success, token, user: { id, name, email, role } }`

### `POST /auth/login`

**Body:** `email`, `password`

**Success:** `200` — `{ success, token, user }`

### `GET /auth/me`

Protected. Current user profile.

**Success:** `200` — `{ success, user: { id, name, email, role, createdAt } }`

---

## Users

### `GET /users`

Protected. **Admin:** all users. **Member:** users who share a project with the caller (plus self).

**Success:** `200` — `{ success, users: [{ _id, name, email, role }] }`

### `PATCH /users/profile`

Protected. Update own name/email.

**Body:** optional `name`, `email`

**Success:** `200` — `{ success, user }`

---

## Projects

### `GET /projects`

Protected. **Admin:** all projects. **Member:** projects where user is `createdBy` or in `members`.

**Success:** `200` — `{ success, projects }` (populated `createdBy`, `members`)

### `GET /projects/:id`

Protected. Project detail if user has access.

**Success:** `200` — `{ success, project, tasks }`

### `POST /projects`

Protected. **Admin only.**

**Body:** `title` (required), optional `description`, `deadline` (ISO date), `status`, `members` (array of user ObjectIds)

### `PUT /projects/:id`

Protected. **Admin only.** Partial update via body fields.

### `DELETE /projects/:id`

Protected. **Admin only.** Deletes project and all its tasks.

---

## Tasks

### `GET /tasks`

Protected. Optional query: `projectId`.

- **Admin:** all tasks (or filtered by `projectId`).
- **Member:** tasks in accessible projects or assigned to user.

**Success:** `200` — `{ success, tasks }` (populated `projectId`, `assignedTo`)

### `POST /tasks/project/:projectId`

Protected. **Admin only.**

**Body:** `title`, `assignedTo` (required), optional `description`, `priority`, `status`, `dueDate`

### `PATCH /tasks/:id`

Protected.

- **Admin:** can update any task fields.
- **Member:** only if task is assigned to them; body must include `status` only (other fields ignored by design).

### `DELETE /tasks/:id`

Protected. **Admin only.**

---

## Dashboard

### `GET /dashboard/stats`

Protected. Aggregated stats for the current user’s visibility (admin = global; member = scoped).

**Success:** `200`

```json
{
  "success": true,
  "stats": {
    "totalProjects",
    "totalTasks",
    "completedTasks",
    "pendingTasks",
    "inProgressTasks",
    "overdueTasks"
  },
  "userWiseTasks": [{ "name", "total", "completed", "pending" }],
  "projectProgress": [{ "projectId", "title", "total", "completed", "percent" }]
}
```

---

## Health

### `GET /health`

**Note:** Mounted at `/api/health` in this app (full path includes `/api` prefix from server).

Returns `{ ok: true, service: "team-task-manager-api" }`.

---

## Postman

Import `docs/postman_collection.json`. After login, copy `token` from the response into the collection variable `token`.
