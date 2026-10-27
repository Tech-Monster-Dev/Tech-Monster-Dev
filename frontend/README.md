# Frontend

The frontend is a JavaScript/JSX Next.js application that renders the public
Tech Monster site and the student and administrator workspaces. This guide
describes the checked-in implementation; it does not imply that every external
service is configured or that the application has been deployed.

## Contents

- [Stack and scripts](#stack-and-scripts)
- [Setup and configuration](#setup-and-configuration)
- [Source organization](#source-organization)
- [Routes and access control](#routes-and-access-control)
- [Features](#features)
- [API, authentication, and realtime behavior](#api-authentication-and-realtime-behavior)
- [Forms, styles, and assets](#forms-styles-and-assets)
- [Validation and limitations](#validation-and-limitations)

## Stack and scripts

| Concern | Implementation |
|---|---|
| Framework | Next.js App Router; `next` resolves to 16.4.3 in `package-lock.json` |
| UI runtime | React and React DOM 19.2.7 |
| Language | JavaScript and JSX; no TypeScript source is checked in |
| Styling | Custom CSS, Tailwind CSS 4, PostCSS |
| API client | Axios |
| Realtime client | Socket.IO client |
| Motion and icons | Framer Motion, Lucide React, React Icons |
| Charts and visual feedback | Recharts, React Toastify, React Spinners, and other feature-level libraries |

Run commands from `frontend/`:

| Command | Purpose |
|---|---|
| `npm ci` | Install from `package-lock.json` |
| `npm run dev` | Development server at `http://localhost:5199` |
| `npm run build` | Production build |
| `npm start` or `npm run preview` | Serve a production build on port 5199 |
| `npm run lint` | ESLint over the frontend directory |

The manifest does not define `test` or `typecheck` scripts. The repository CI
uses Node.js 22; the frontend package does not declare its own Node.js engine
range.

## Setup and configuration

From the repository root:

```powershell
Set-Location .\frontend
npm ci
npm run dev
```

For a complete local application, start the backend as described in the
[backend guide](../backend/README.md). The frontend development server is on
port `5199`.

### Environment variables

There is no checked-in frontend `.env.example`. The following names are read
directly by frontend code:

| Variable | Use | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | API and Socket.IO client base in non-local browser environments; expected API URL includes `/api` | Defaults in code to the configured remote API. For browsers on `localhost` or `127.0.0.1`, the clients instead hard-code `http://localhost:8001/api`, so this variable does not change the local API port. |
| `NEXT_PUBLIC_MY_GMAIL_SERVICE_ID` | EmailJS service identifier used by `/contact` | Required for contact-form submission. |
| `NEXT_PUBLIC_MY_GMAIL_TEMPLATE_ID` | EmailJS template identifier used by `/contact` | Required for contact-form submission. |
| `NEXT_PUBLIC_MY_GMAIL_PUBLIC_KEY` | EmailJS browser public key used by `/contact` | Required for contact-form submission; this is a public client-side value, not a private secret. |

`NEXT_PUBLIC_*` values are bundled for client-side use. Do not place API
secrets, passwords, private keys, or other confidential credentials in them.
For a non-local deployment, provide the API URL in the frontend build
environment. For EmailJS, provide the three identifiers in the build
environment if the contact form should send messages.

Local development must align the backend port with the frontend's
`localhost:8001` API setting. The backend's default is `8000`; see the
[root setup instructions](../README.md#local-setup).

## Source organization

```text
src/
├── app/                 Next.js route pages, root layout, student/admin layouts
├── components/          Shared UI components and status/error boundary UI
├── features/
│   ├── admin/           Admin dashboards, students, tasks, notices, reports, support
│   ├── auth/            Login, signup, OTP, and password recovery screens
│   ├── dashboard/       Shared dashboard navigation, notifications, and settings
│   ├── messaging/       Chat experience and chat components
│   └── student/         Student dashboard, learning, attendance, tasks, certificates
├── layouts/             Reusable dashboard layouts
├── legacy-pages/        Earlier landing-page modules, still used by current routes
├── providers/           Authentication and notification React contexts
├── services/
│   ├── api/             Axios instance, endpoint constants, feature API modules
│   ├── auth/            Browser token and user storage
│   ├── server/          Backend status service
│   └── socket/          Socket.IO client
├── shared/              Shared hooks and utilities
├── styles/              Global CSS, theme variables, animations, error styles
├── utils/               Shared utility functions
└── validations/          Feature validation schemas

public/
└── assets/              Public logos, illustrations, thumbnails, and profile assets
```

The root layout in `src/app/layout.jsx` imports global styles, page-title
management, image protection, and the shared providers. The landing route
`/` imports the implementation from `src/legacy-pages/landing`; despite its
directory name, that code is active. The `/contact` route also wraps a
component from that area.

The Next.js configuration sets `pageExtensions` to `jsx` and defines short
redirects from selected status paths (such as `/404`) to
`/error_status/<status>`.

## Routes and access control

Routes below are derived from `src/app`. Dynamic segments are shown in square
brackets as they appear in the source.

| Area | Routes |
|---|---|
| Public pages | `/`, `/contact`, `/learn-more`, `/notice`, `/privacy-policy`, `/refund-and-cancellation`, `/terms-and-conditions`, `/verify-certificate/[token]` |
| Authentication | `/auth/login`, `/auth/admin-login`, `/auth/signup`, `/auth/verify-signup-otp`, `/auth/forgot-password`, `/auth/verify-reset-otp`, `/auth/reset-password` |
| Student workspace | `/student`, `/student/dashboard`, `/student/account`, `/student/attendance`, `/student/badges`, `/student/certificate`, `/student/feedback`, `/student/help&support`, `/student/lessons`, `/student/lessons/[type]/[slug]`, `/student/message`, `/student/notification`, `/student/settings`, `/student/tasks`, `/student/tasks/[type]/[slug]`, `/student/user-profile/[userId]` |
| Admin workspace | `/admin`, `/admin/dashboard`, `/admin/certificates`, `/admin/course-form`, `/admin/feedback`, `/admin/internships-form`, `/admin/message`, `/admin/notice`, `/admin/notification`, `/admin/reports`, `/admin/reports/activity/[userId]`, `/admin/settings`, `/admin/students`, `/admin/students/[id]`, `/admin/students/user-profile/[userId]`, `/admin/support`, `/admin/tasks`, `/admin/tasks/[id]` |
| Status/error pages | `/error_status/404`, `/error_status/429`, `/error_status/500`, `/error_status/503`, `/error_status/account-blocked`, `/error_status/auth-required`, `/error_status/offline`, `/error_status/session-expired`, `/error_status/something-went-wrong`, `/error_status/unauthorized` |

`src/app/student/layout.jsx` waits for authentication initialization, redirects
unauthenticated users to `/auth/login`, and sends non-students to the
unauthorized page. `src/app/admin/layout.jsx` similarly redirects
unauthenticated users to `/auth/admin-login` and rejects non-admin roles.
These are client-side navigation guards; API access is separately checked by
backend middleware.

The root provider tree includes `AuthProvider`, `NotificationProvider`, an
error boundary, and a React Toastify container. Authentication initializes
from browser storage; the notification provider loads the user's notifications
and listens for Socket.IO events when signed in.

## Features

| Feature | Frontend implementation and integration |
|---|---|
| Public landing and information | `src/legacy-pages/landing/` provides the landing experience; App Router pages expose contact, learn-more, notice, policy, and terms content. The contact form uses EmailJS and its three `NEXT_PUBLIC_MY_GMAIL_*` settings. |
| Authentication and recovery | `src/features/auth/` contains student/admin login, signup, OTP verification, and password recovery pages. `src/services/api/authService.js` calls the backend auth routes. |
| Student workspace | `src/features/student/` covers dashboard and profile, courses/internships, lessons, tasks and submissions, attendance, badges, certificates, feedback, help/support, messaging, and notifications. The account form's pincode hook calls the public India Post API at `https://api.postalpincode.in/pincode/{pincode}` to look up district and state. |
| Admin workspace | `src/features/admin/` contains student management, course/internship forms, task and submission review, certificate payment review, notices, feedback, reports, support, messaging, and settings. |
| Messaging and notifications | Feature services call the backend REST API; the shared socket client supports realtime events. The notification context handles `newNotification` events and toast display. |
| Shared dashboard UI | `src/features/dashboard/common/`, `src/layouts/`, and `src/components/` provide navigation, settings, loaders, status pages, form controls, cards, and reusable UI. |

The modules provide UI and service calls in source; their complete runtime
behavior depends on API, database, and external-service configuration.

## API, authentication, and realtime behavior

`src/services/api/axios.js` creates the shared Axios client with credentials
enabled, a 30-second timeout, JSON headers, and request/response interceptors.
When an access token is present in browser storage, the request interceptor
sends it as a bearer token. The interceptor bypasses full-page redirects for
selected signup, login, verification, and recovery URLs. Other 401 responses
clear stored session data and navigate to the session-expired page. 403, 429,
and 503 responses navigate to their corresponding status pages.

Feature-level API modules live in `src/services/api/`, with shared path
constants in `endpoints.js`. They map to backend modules such as `/auth`,
`/profile`, `/dashboard`, `/courses`, `/internships`, `/submissions`,
`/notifications`, `/messages`, `/support`, `/feedback`, and
`/certificate-payments`. The backend guide documents paths as actually
registered by Express.

The current browser token storage helper uses `localStorage` for the access
token and user record. The API client also permits an admin access-token key.
The backend returns access and refresh tokens from login; the refresh endpoint
and logout behavior are implemented server-side.

`src/services/socket/socket.js` derives the Socket.IO origin from the API URL
and strips the terminal `/api` segment. It connects with credentials and
polling/websocket transports. The backend has its own Socket.IO origin
allowlist, separate from HTTP CORS.

## Forms, styles, and assets

Shared form controls are in `src/components/ui/Form/`; field validation
helpers are in `src/shared/utils/validation/`, and schema files are grouped in
`src/validations/`. The project also declares React Hook Form and Zod-related
packages; the current frontend source includes Zod schema files but does not
use `useForm` or `zodResolver`.

Global styles are imported from the root layout. `src/styles/` holds theme
variables, animation rules, and error styles; feature components commonly
include adjacent CSS files. Tailwind CSS is configured through
`postcss.config.mjs`, alongside the project's custom CSS.

Static images and public files belong in `public/`; source components can
reference them by root-relative URLs. UI animation uses Framer Motion, charts
use Recharts, and icons come from Lucide React and React Icons.

## Validation and limitations

- `npm run lint` is the available frontend static check. In the audit run it
  reported four errors and one warning across the notification component,
  authentication/provider code, and `useNearViewport`; no source files were
  changed as part of this documentation task.
- No frontend test script or checked-in frontend test suite was found.
- The frontend CI workflow conditionally runs available scripts and requires
  `npm run build`; test results are not claimed here.
- Local API connections use port `8001` regardless of `NEXT_PUBLIC_API_URL`;
  keep the backend's `PORT` aligned with that behavior.
- `NEXT_PUBLIC_API_URL` and EmailJS values have no checked-in frontend example
  file. Confirm production URLs, CORS origins, and EmailJS configuration with
  the project maintainer before deployment.
- `src/services/api/endpoints.js` contains unused `AUTH.COMPLETE_PROFILE` and
  `STUDENT` path constants for which no matching routers are mounted by the
  backend. Do not treat those constants as active API contracts without
  verifying a caller and a registered route.

For repository-wide setup and the backend API reference, return to the
[root README](../README.md) or see the [backend guide](../backend/README.md).