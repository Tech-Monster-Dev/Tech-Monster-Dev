# Tech Monster

Tech Monster is a learning and internship platform with separate student and
administrator experiences. The repository contains a Next.js web application
and an Express API backed by MongoDB.

This guide covers the whole repository. See the [frontend guide](frontend/README.md)
and [backend guide](backend/README.md) for implementation and API details.

## Contents

- [Applications and capabilities](#applications-and-capabilities)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Configuration](#configuration)
- [Commands and validation](#commands-and-validation)
- [Deployment and operations](#deployment-and-operations)
- [Troubleshooting](#troubleshooting)
- [Contributing and license](#contributing-and-license)

## Applications and capabilities

The frontend provides public information pages, account and OTP flows, student
learning dashboards, and administrator tools. The backend exposes REST routes
for authentication, profiles, courses, internships, task submissions,
attendance, certificates, payments, feedback, notices, notifications,
messaging, and support.

The capabilities described here are based on the checked-in pages, services,
controllers, and route registration. A page or API call being present in source
does not by itself establish that its external integrations are configured or
that a complete end-to-end deployment has been verified.

### Technology at a glance

| Area | Verified implementation |
|---|---|
| Frontend | Next.js App Router 16.4.3 and React 19.2.7 (resolved versions in `frontend/package-lock.json`); JavaScript and JSX |
| Backend | Node.js ES modules, Express 5.2.1, Mongoose 9.7.4 |
| Database | MongoDB via Mongoose |
| Frontend styling | Custom CSS, Tailwind CSS 4/PostCSS |
| Frontend API and realtime | Axios and Socket.IO client |
| Backend integrations | Brevo transactional email, Cloudinary uploads, Socket.IO |
| Package management | Independent npm manifests and lockfiles in `frontend/` and `backend/`; no root npm workspace |

CI uses Node.js 22. Neither application declares a separate Node.js engine
range in its package manifest.

## Repository layout

```text
.
├── backend/
│   ├── data/                 JSON course, internship, and support content
│   ├── scripts/              Learning catalog import script
│   ├── src/
│   │   ├── core/             Errors, HTTP, security, and validation
│   │   ├── infrastructure/   Database, email, jobs, logging, sockets, storage
│   │   └── modules/          Feature routes, controllers, services, and models
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/               Public assets
│   ├── src/
│   │   ├── app/              Next.js App Router pages and layouts
│   │   ├── components/       Shared UI components
│   │   ├── features/         Student, admin, authentication, and messaging UI
│   │   ├── providers/        Authentication and notification contexts
│   │   └── services/         API, auth, server-status, and socket clients
│   └── package.json
├── docs/                     Architecture, API, development, and deployment notes
├── scripts/                  Script-area READMEs; no root automation scripts
├── .github/workflows/ci.yml  GitHub Actions validation workflow
├── CONTRIBUTING.md
└── README.md
```

The frontend and backend are independent applications: install and run their
dependencies from their own directories.

## Prerequisites

- Node.js 22 is the version selected by the repository CI workflow. npm is
  used with the committed lockfiles.
- A MongoDB instance and a connection string for the backend.
- Brevo credentials for backend email delivery.
- Cloudinary credentials for image upload features.
- EmailJS service, template, and public-key identifiers for the frontend
  contact form.

MongoDB is required to start the backend. Email, Cloudinary, and EmailJS
configuration is needed only for the corresponding features.

## Local setup

### 1. Install dependencies

From the repository root, install each application separately:

```powershell
Set-Location .\backend
npm ci

Set-Location ..\frontend
npm ci
```

### 2. Configure the backend

Create a local environment file from the checked-in example:

```powershell
Set-Location .\backend
Copy-Item .env.example .env
```

Set `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` to local values.
Configure `BREVO_API_KEY` and the three `CLOUDINARY_*` values when using email
and image uploads. Do not commit `.env` or put real credentials in
documentation.

For the default local frontend setup, set `PORT=8001` in `backend/.env`. The
backend itself defaults to port `8000`, but the frontend Axios and Socket.IO
clients currently select `http://localhost:8001/api` whenever the browser is
served from localhost. The frontend development server runs on port `5199`,
which is in the backend's configured CORS allowlist.

### 3. Start the backend

In a terminal:

```powershell
Set-Location .\backend
npm run dev
```

The server connects to MongoDB before listening. The API health check is
`http://localhost:8001/api/health`; Swagger UI is mounted at
`http://localhost:8001/api/docs`.

### 4. Start the frontend

In a second terminal:

```powershell
Set-Location .\frontend
npm run dev
```

Open `http://localhost:5199`. To seed the bundled course and internship
catalog into the configured MongoDB database, run `npm run seed:catalog` from
`backend/` after configuring `MONGODB_URI`.

## Configuration

The backend example file is [`backend/.env.example`](backend/.env.example).
There is no frontend environment example file. The detailed variable list and
important local URL behavior are in the [frontend configuration guide](frontend/README.md#environment-variables)
and [backend configuration guide](backend/README.md#environment-variables).

The frontend's `NEXT_PUBLIC_*` values are exposed to browser code; they must
not contain private credentials. Backend secrets belong only in the backend
runtime environment.

## Commands and validation

Run commands from the indicated application directory:

| Application | Command | Purpose |
|---|---|---|
| Frontend | `npm ci` | Install locked dependencies |
| Frontend | `npm run dev` | Start Next.js development server on port 5199 |
| Frontend | `npm run build` | Create the production build |
| Frontend | `npm start` | Serve the production build on port 5199 |
| Frontend | `npm run lint` | Run ESLint |
| Backend | `npm ci` | Install locked dependencies |
| Backend | `npm run dev` | Start the API with Nodemon |
| Backend | `npm start` | Start the API with Node.js |
| Backend | `npm run seed:catalog` | Import bundled learning catalog JSON |

There is no frontend test script or checked-in frontend test suite. The
backend's `npm test` script is currently a placeholder that exits with an
error; no backend test files are checked in. There are also no application
`typecheck` scripts.

The GitHub Actions workflow at `.github/workflows/ci.yml` uses Node.js 22 and
conditionally runs configured checks, including the frontend lint and build.
Because the backend currently defines a failing placeholder `test` script,
the backend CI test step invokes it and fails. A successful CI run is not
claimed here.

## Deployment and operations

The CI workflow validates code; it does not deploy either application. The
repository contains no Docker or Compose configuration and no verified
backend deployment manifest. `frontend/vercel.json` is empty, so it does not
specify additional Vercel behavior. Set `NEXT_PUBLIC_API_URL` to the backend
API base URL (including `/api`) when building for a non-local host; confirm
that the backend CORS allowlist also permits the deployed frontend origin.

The backend also exposes maintenance-mode behavior through
`MAINTENANCE_MODE=true`. See the [backend guide](backend/README.md) for route,
security, and operational details.

## Troubleshooting

- **Backend does not start:** confirm MongoDB is reachable and `MONGODB_URI`
  is set in `backend/.env`.
- **Local frontend gets API connection errors:** use `PORT=8001` for the
  backend. The localhost frontend client does not use `NEXT_PUBLIC_API_URL`
  to override its hard-coded port.
- **Browser reports a CORS error:** check the origin allowlist in
  `backend/src/app.js` and the Socket.IO allowlist in
  `backend/src/infrastructure/socket/socket.js`.
- **Email delivery fails:** configure `BREVO_API_KEY` for backend mail and the
  three EmailJS public variables for the frontend contact form.
- **Image uploads fail:** check the backend Cloudinary environment variables.
- **Lint or CI fails:** run the available command in the relevant application
  directory; see the test and CI limitations above.

## Contributing and license

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing changes.
The repository includes issue and pull request templates under `.github/`.
The license terms are in [`LICENSE`](LICENSE).8