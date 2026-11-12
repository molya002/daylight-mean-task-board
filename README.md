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

`render.yaml` defines a Render web service that builds Angular and starts Express on the supplied `PORT`. A MongoDB Atlas connection string must be set as the `MONGODB_URI` secret. Use a database user limited to `readWrite` on `mean_task_board`, not an Atlas administrator. After the Render service exists, find its outbound IP ranges under **Connect → Outbound** and add those ranges to the Atlas IP Access List. The application serves the built Angular pages and API from the same origin. Once deployed, check the public URL, `/api/health`, and create/toggle/delete a task through the page. No public deployment URL exists yet; do not claim the deployment rubric item until one is verified.

This is a shared demonstration app without user authentication. Do not enter private data. Before a public deployment with real user data, add authentication and ownership checks.
