# Daylight — MEAN Task Board

An Angular task planner served by an Express REST API backed by MongoDB. It supports creating tasks, listing and searching them, filtering by completion, toggling completion, deleting tasks, and viewing category/completion insights. The browser sends requests to `/api/tasks`; no task data is stored in `localStorage`.

## Stack

- MongoDB: persistent `tasks` collection and index on `createdAt`
- Express/Node.js: JSON REST API, validation, error responses, static Angular hosting
- Angular: responsive task dashboard, task form/cards, routing and insights

## Local run

Requirements: Node.js 22+, pnpm 11+, MongoDB running locally or a MongoDB Atlas connection string.

1. Run `pnpm install`.
2. Copy `.env.example` to `.env`; set `MONGODB_URI` to the MongoDB connection string. Do not commit `.env`.
3. Run `pnpm build` then `pnpm start`.
4. Open `http://127.0.0.1:3000`.
5. Run `pnpm verify` for a MongoDB-backed API integration test. This uses a temporary test database and removes it after the test.

For Angular development, run `pnpm start` and `pnpm dev` in separate terminals. The Angular dev server proxies `/api` to port 3000.

## REST API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check database availability |
| GET | `/api/tasks` | List up to 200 newest tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Set `completed` to a boolean |
| DELETE | `/api/tasks/:id` | Remove a task |

POST JSON fields: `title` (1–100 characters), `category` (`Work`, `Personal`, `Learning`), `priority` (`high`, `medium`, `low`), and `dueDate` (`YYYY-MM-DD`). Invalid fields return HTTP 400 with an `error` message. Missing IDs return HTTP 404.

## Deployment

The application is live at [daylight-mean-task-board.onrender.com](https://daylight-mean-task-board.onrender.com/). `render.yaml` defines a free Render web service that builds Angular and starts Express on the supplied `PORT`. The MongoDB Atlas connection string is stored as the `MONGODB_URI` environment variable in Render, outside source control. The database user is limited to `readWrite` on `mean_task_board`. The Atlas IP Access List contains the two outbound ranges displayed by Render for its Virginia region. On 13 November 2026, the public page loaded, `/api/health` reported `{"status":"ok","database":"connected"}`, and a task was created, persisted after reload, and marked complete.

This is a shared demonstration app without user authentication. Do not enter private data. Before a public deployment with real user data, add authentication and ownership checks.
