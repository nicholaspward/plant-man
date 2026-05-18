# Plant-Man

Plant-Man is a mobile-first plant care tracker. The current baseline is intentionally small: a React + Vite frontend, an ASP.NET Core Minimal API backend, EF Core, and SQLite.

The app currently lets you test the core loop:

- view seeded plants
- see due or upcoming watering tasks
- mark a watering task done
- persist that action to SQLite
- refresh the dashboard from the API

## Stack

- Frontend: React, Vite, TypeScript
- Backend: ASP.NET Core Minimal APIs
- Data: EF Core with SQLite
- Local environment: VS Code Dev Container

## Requirements

Host machine:

- Docker Desktop
- Visual Studio Code
- VS Code Dev Containers extension

Provided inside the dev container:

- Node.js LTS and npm
- .NET 10 SDK
- SQLite CLI tools

## Getting Started

Open the repo in VS Code and run:

```text
Dev Containers: Reopen in Container
```

The container runs dependency setup automatically:

```bash
dotnet restore plant-manager.sln
dotnet tool restore
cd plant-manager-web && npm install
```

Start the API and frontend together:

```bash
bash scripts/dev.sh
```

Or start the API in one terminal:

```bash
dotnet run --project plant-manager
```

And the frontend in another terminal:

```bash
cd plant-manager-web
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- API health: `http://localhost:5074/api/health`
- API root: `http://localhost:5074`

The Vite dev server proxies `/api` requests to `http://localhost:5074`.

## Database

SQLite is configured in `plant-manager/appsettings.json`:

```json
"DefaultConnection": "Data Source=App_Data/plant-man.db"
```

On startup, the API applies EF Core migrations with `Migrate()` and seeds a few starter plants. This keeps the schema versioned while the project is still easy to test.

The default starter taxons are tracked in [docs/starter-taxa.md](docs/starter-taxa.md).

Local SQLite files are ignored by Git.

If you have a local database created before migrations were added, delete `plant-manager/App_Data/plant-man.db` and restart the API to recreate it from migrations.

## Project Structure

```text
.devcontainer/              Dev container definition
docs/                       Minimal current schema and ERD
plant-manager/              ASP.NET Core Minimal API backend
  Data/                     EF Core DbContext, models, and seeding
  Program.cs                API endpoints and app startup
plant-manager-web/          React + Vite frontend
  src/                      App, API client, types, and styles
```

## Current API

- `GET /api/health`
- `GET /api/plants`
- `GET /api/plants/{id}`
- `POST /api/plants`
- `PUT /api/plants/{id}`
- `DELETE /api/plants/{id}`
- `GET /api/plant-taxa`
- `POST /api/plant-taxa`
- `PUT /api/plant-taxa/{id}`
- `DELETE /api/plant-taxa/{id}`
- `GET /api/care-actions`
- `POST /api/care-actions`
- `PUT /api/care-actions/{id}`
- `DELETE /api/care-actions/{id}`
- `GET /api/action-resources`
- `POST /api/action-resources`
- `PUT /api/action-resources/{id}`
- `DELETE /api/action-resources/{id}`
- `GET /api/care-tasks/upcoming`
- `GET /api/action-logs`
- `POST /api/action-logs`
- `PUT /api/action-logs/{id}`
- `DELETE /api/action-logs/{id}`

Example action log request:

```json
{
  "plantId": 1,
  "careActionId": 1,
  "resources": [
    {
      "actionResourceId": 1,
      "quantity": 250,
      "unit": "ml"
    }
  ]
}
```
