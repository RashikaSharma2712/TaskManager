# Database schema (MongoDB + Mongoose)

Database name comes from your connection string (e.g. `team_task_manager`).

## Collection: `users`

| Field | Type | Notes |
|-------|------|--------|
| `_id` | ObjectId | |
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `password` | String | Required, hashed with bcrypt on save |
| `role` | String | `admin` \| `member`, default `member` |
| `createdAt` | Date | From `timestamps` |
| `updatedAt` | Date | From `timestamps` |

## Collection: `projects`

| Field | Type | Notes |
|-------|------|--------|
| `_id` | ObjectId | |
| `title` | String | Required |
| `description` | String | |
| `members` | [ObjectId] | Ref `User` |
| `createdBy` | ObjectId | Ref `User`, required |
| `deadline` | Date | |
| `status` | String | `planning` \| `active` \| `completed` \| `on_hold` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Relationships:** `createdBy` and `members` → `users`. Deleting a project removes its tasks (application logic); user documents are not cascaded.

## Collection: `tasks`

| Field | Type | Notes |
|-------|------|--------|
| `_id` | ObjectId | |
| `title` | String | Required |
| `description` | String | |
| `assignedTo` | ObjectId | Ref `User`, required |
| `projectId` | ObjectId | Ref `Project`, required |
| `priority` | String | `low` \| `medium` \| `high` |
| `status` | String | `pending` \| `in_progress` \| `completed` |
| `dueDate` | Date | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Relationships:** `assignedTo` → `users`, `projectId` → `projects`.

## Indexes

- `users.email`: unique (via schema).
- Default `_id` indexes on all collections.
