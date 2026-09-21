# TeamFlow

A collaborative project and task management app — workspaces, Kanban boards, comments, real-time updates, and notifications.

Built as a full-stack MERN application with a focus on real-time collaboration and clean separation of concerns between client state and server state.

**Live:** https://teamflow-six-phi.vercel.app/ 
**API:** https://teamflow-api-2g6b.onrender.com/api/health

---

## Features

- **Authentication** — JWT-based auth with hashed passwords and protected routes on both client and server
- **Workspaces** — multi-tenant containers with role-based access control (owner, admin, member)
- **Projects** — scoped to workspaces, with color-coded organization
- **Kanban board** — drag-and-drop task management with three columns, fractional ordering, and optimistic updates
- **Task details** — full editing of title, description, priority, status, assignee, and due date
- **Comments** — per-task threads with author-or-admin deletion
- **Activity feed** — an immutable log of every meaningful change in a workspace
- **Notifications** — per-user notifications with an unread badge, mark-as-read, and click-to-navigate
- **Real-time** — Socket.IO for live board updates, notifications, and activity feed changes
- **Polished UX** — error boundaries, toast notifications, custom confirm dialogs, skeleton loaders, and a reconnect banner

---

## Tech Stack

### Frontend
- **React 19** with Vite
- **React Router** for routing
- **Zustand** for client state (auth, UI, token)
- **TanStack Query** for server state (workspaces, projects, tasks, comments, notifications)
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop
- **Socket.IO Client** for real-time
- **Axios** with request/response interceptors

### Backend
- **Node.js 20** + **Express**
- **MongoDB** via **Mongoose**
- **JWT** for stateless auth
- **bcryptjs** for password hashing
- **Socket.IO** for real-time events
- **Vitest** + **Supertest** for tests

### Infrastructure
- **Render** — API hosting with WebSocket support
- **Vercel** — client hosting with global CDN
- **MongoDB Atlas** — managed database
- **GitHub Actions** — CI/CD pipeline

---

## Architecture

### Client State vs. Server State

Two separate concerns, handled by two separate tools:

- **Zustand** manages client state: auth user, token, UI toggles (modals, selected items). Persists only the token to localStorage.
- **TanStack Query** manages server state: everything fetched from the API. Handles caching, invalidation, refetching, and optimistic updates.

This separation is deliberate. Mixing them (e.g., storing fetched workspaces in Zustand) causes stale data bugs that are painful to trace.

### Request Pipeline

Every authenticated request flows through this chain:

```
Client → Axios interceptor (attach JWT)
       → Express → protect middleware (verify JWT)
                → loadWorkspace (verify membership, attach req.workspace)
                → loadProject   (verify project belongs to workspace)
                → loadTask      (verify task belongs to project)
                → controller    (do the work)
       → Activity log + notification fan-out + Socket.IO emit
```

Loaders stack. By the time a controller runs, `req.user`, `req.membership`, `req.workspace`, `req.project`, and `req.task` are all populated and verified. Controllers write to the database, they don't enforce security.

### Real-Time

Two room types on Socket.IO:

- `user:<id>` — personal notifications
- `workspace:<id>` — board changes, activity feed, member changes

The server emits minimal payloads (IDs and event types); the client invalidates the matching TanStack queries and refetches. This keeps socket payloads small and avoids shape drift between socket events and HTTP responses.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A MongoDB Atlas account (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/VinMusau/teamflow.git
cd teamflow

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment variables

**Server** — create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/teamflow
JWT_SECRET=<run the command below>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Client** — create `client/.env` (optional; only needed if the API isn't on localhost:5000):

```env
VITE_API_BASE_URL=http://localhost:5000
```

If omitted, the client uses a Vite proxy to `localhost:5000`.

### 3. Run both servers

Terminal 1:
```bash
cd server
npm run dev
```

Terminal 2:
```bash
cd client
npm run dev
```

Open http://localhost:5173. Register an account, create a workspace, and start adding projects.

---

## Testing

```bash
# Server tests
cd server && npm test

# Client lint + build (equivalent to what CI runs)
cd client && npm run lint && npm run build
```

The server test suite is minimal — it covers the health endpoint and is designed to grow. Add integration tests for auth, workspaces, and tasks as you extend the app.

---

## API Reference

All routes are prefixed with `/api`. Authenticated routes require a `Authorization: Bearer <token>` header.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a user, return user + token |
| `POST` | `/auth/login` | Authenticate, return user + token |
| `GET` | `/auth/me` | Return the current user |

### Workspaces

| Method | Path | Description |
|---|---|---|
| `GET` | `/workspaces` | List workspaces the user belongs to |
| `POST` | `/workspaces` | Create a workspace |
| `GET` | `/workspaces/:id` | Get a workspace (members must be a member) |
| `PATCH` | `/workspaces/:id` | Update name/description (owner/admin) |
| `DELETE` | `/workspaces/:id` | Delete (owner only) |
| `POST` | `/workspaces/:id/members` | Add a member by email (owner/admin) |
| `DELETE` | `/workspaces/:id/members/:userId` | Remove a member (owner/admin) |
| `GET` | `/workspaces/:id/activities` | Workspace activity feed (paginated) |

### Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/workspaces/:wid/projects` | List projects |
| `POST` | `/workspaces/:wid/projects` | Create a project |
| `GET` | `/workspaces/:wid/projects/:pid` | Get a project |
| `PATCH` | `/workspaces/:wid/projects/:pid` | Update |
| `DELETE` | `/workspaces/:wid/projects/:pid` | Delete (owner/admin) |

### Tasks

| Method | Path | Description |
|---|---|---|
| `GET` | `/workspaces/:wid/projects/:pid/tasks` | List tasks (filterable by status/assignee) |
| `POST` | `/workspaces/:wid/projects/:pid/tasks` | Create a task |
| `GET` | `/workspaces/:wid/projects/:pid/tasks/:tid` | Get a task |
| `PATCH` | `/workspaces/:wid/projects/:pid/tasks/:tid` | Update |
| `DELETE` | `/workspaces/:wid/projects/:pid/tasks/:tid` | Delete |

### Comments

| Method | Path | Description |
|---|---|---|
| `GET` | `.../tasks/:tid/comments` | List comments |
| `POST` | `.../tasks/:tid/comments` | Create a comment |
| `DELETE` | `.../tasks/:tid/comments/:cid` | Delete (author or owner/admin) |

### Notifications

| Method | Path | Description |
|---|---|---|
| `GET` | `/notifications` | List notifications |
| `GET` | `/notifications/unread-count` | Get unread count |
| `PATCH` | `/notifications/:id/read` | Mark one as read |
| `PATCH` | `/notifications/read-all` | Mark all as read |

---

## Project Structure

```
teamflow/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── client/
│   ├── src/
│   │   ├── api/                # HTTP wrappers (axios-based)
│   │   ├── components/         # Reusable UI
│   │   │   └── kanban/         # Board-specific components
│   │   ├── hooks/              # TanStack Query hooks + realtime
│   │   ├── lib/                # Utilities (socket, timeAgo, formatters)
│   │   ├── pages/              # Route-level components
│   │   └── stores/             # Zustand stores (auth, token, UI, toast, confirm)
│   └── vite.config.js
└── server/
    ├── src/
    │   ├── config/             # DB, Socket.IO, CORS
    │   ├── controllers/        # Request handlers
    │   ├── middleware/         # Auth, workspace/project/task loaders
    │   ├── models/             # Mongoose schemas
    │   ├── routes/             # Express routers
    │   ├── utils/              # Activity log, notifications, task emits
    │   ├── app.js              # Express app
    │   └── server.js           # HTTP + Socket.IO server
    └── tests/
```

---

## Deployment

### CI/CD Pipeline

Every push to `main`:

1. **CI job** runs `npm run lint` and `npm run build` for the client, `npm test` for the server.
2. **If both pass**, the **deploy job** triggers a Render deploy hook.
3. **Vercel** independently auto-deploys the client on the same push.

PRs to `main` run CI without deploying. Both CI jobs must pass before merging.

### Environment Variables

| Platform | Variable | Notes |
|---|---|---|
| Render | `NODE_ENV` | `production` |
| Render | `MONGODB_URI` | Atlas connection string |
| Render | `JWT_SECRET` | Unique to production, never reuse dev |
| Render | `JWT_EXPIRES_IN` | `7d` |
| Render | `CLIENT_ORIGIN` | The Vercel production URL |
| Vercel | `VITE_API_BASE_URL` | The Render API base URL |

`VITE_*` variables are baked into the client bundle at build time. Changing them requires a redeploy.

---

## Roadmap

- [ ] Email invitations with signed tokens (replace direct email-based adds)
- [ ] File attachments on tasks (S3 / Cloudinary)
- [ ] Mention support in comments (`@user`)
- [ ] Per-project permissions
- [ ] Server tests: integration coverage for auth, RBAC, and task mutations
- [ ] Client tests: component coverage for Kanban and auth flows
- [ ] Rate limiting on auth endpoints (`express-rate-limit`)
- [ ] Helmet for HTTP security headers

---

## License

MIT