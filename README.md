# Team Task Manager (MERN)

Full-stack team project and task manager with **JWT authentication**, **bcrypt** password hashing, **role-based access** (`admin` / `member`), and a **React + Tailwind** UI with dashboard progress visuals (bar charts built with semantic HTML/CSS).

## Repository layout

| Path | Description |
|------|-------------|
| `backend/` | Express REST API, Mongoose models, JWT middleware |
| `frontend/` | Vite + React SPA |
| `docs/API.md` | REST API documentation |
| `docs/DATABASE_SCHEMA.md` | MongoDB collections and fields |
| `docs/postman_collection.json` | Sample Postman collection |
| `docs/screenshots/` | Add your assignment screenshots here |

## Prerequisites

- Node.js 18+ and npm  
- MongoDB running locally or a MongoDB Atlas URI  

## Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, optional ADMIN_REGISTRATION_SECRET
npm install
npm run dev
```

API listens on `http://localhost:5000` (or `PORT` in `.env`).

### First admin account

**Option A — Seed script**

```bash
cd backend
npm run seed
```

Default credentials (override with `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` in `.env`): `admin@example.com` / `admin123`.

**Option B — Registration secret**

Set `ADMIN_REGISTRATION_SECRET` in `.env`. On signup, send the same value in JSON field `adminSecret` to create an `admin` user.

## Frontend setup

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open `http://localhost:5173`.

## Role behavior (summary)

| Capability | Admin | Member |
|------------|-------|--------|
| Create / edit / delete projects | Yes | No |
| Add project members | Yes (via project create/edit) | No |
| Create / delete tasks | Yes | No |
| View projects | All | Only where creator or member |
| Update task **status** | Yes | Only on tasks assigned to them |

## GitHub

Create a new repository on GitHub, then:

```bash
git init
git add .
git commit -m "Initial commit: Team Task Manager MERN stack"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Replace the remote URL with your own. Paste that link in your assignment submission.

## Assignment deliverables checklist

1. Source code — this repo  
2. API docs — `docs/API.md`  
3. Database schema — `docs/DATABASE_SCHEMA.md`  
4. README — this file  
5. Screenshots — add under `docs/screenshots/`  
6. GitHub link — after you push  

## Tech stack

- **MongoDB** + **Mongoose**  
- **Express.js**  
- **React** (Vite) + **Tailwind CSS v4**  
- **JWT**, **bcryptjs**, **express-validator**  

## License

MIT (educational use).
