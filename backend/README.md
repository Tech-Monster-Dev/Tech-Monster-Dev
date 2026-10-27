# Backend

The backend is an ES-module Node.js application built with Express and
Mongoose. It serves the JSON API used by the frontend, connects to MongoDB,
initializes Socket.IO, and starts scheduled maintenance jobs.

This guide documents route registration and behavior found in the repository.
It is not a claim that every optional integration is configured or that all
endpoints have been runtime-tested.

## Contents

- [Stack and commands](#stack-and-commands)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Architecture and request lifecycle](#architecture-and-request-lifecycle)
- [API reference](#api-reference)
- [Authentication and security](#authentication-and-security)
- [Database models](#database-models)
- [Integrations and operational behavior](#integrations-and-operational-behavior)
- [Tests, CI, and deployment](#tests-ci-and-deployment)
- [Known gaps and troubleshooting](#known-gaps-and-troubleshooting)

## Stack and commands

| Concern | Implementation |
|---|---|
| Runtime | Node.js; GitHub Actions selects Node.js 22. `package.json` does not declare an engine range. |
| Module system | ECMAScript modules (`"type": "module"`) |
| HTTP framework | Express 5.2.1 |
| Database | MongoDB through Mongoose 9.7.4 |
| Validation | Zod schemas and a `safeParse` middleware on selected routes |
| Realtime | Socket.IO 4.8.3 |
| Logging | Morgan middleware and Winston file/console transports |

Run these commands from `backend/`:

| Command | Purpose |
|---|---|
| `npm ci` | Install dependencies from `package-lock.json` |
| `npm run dev` | Run `src/server.js` with Nodemon |
| `npm start` | Run `src/server.js` with Node.js |
| `npm run seed:catalog` | Read catalog JSON under `data/Courses` and `data/Internships` and import it into the configured database |
| `npm test` | Currently a placeholder that prints an error and exits non-zero; it is not a usable test suite |

No backend lint, type-check, migration script, or checked-in test file was
found. The `test` script listed above is only a failing placeholder.

## Setup

From the repository root, install backend packages and create a local
environment file:

```powershell
Set-Location .\backend
npm ci
Copy-Item .env.example .env
```

Set at least `MONGODB_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` in `.env`.
Use an accessible development MongoDB instance. Configure email and
Cloudinary values if you need those integrations. Keep `.env` local and never
commit secret values.

To start the service:

```powershell
npm run dev
```

The server connects to MongoDB first, then creates the HTTP server, initializes
Socket.IO, starts scheduled jobs, and listens on `PORT` (default `8000`).
For the local frontend, set `PORT=8001` because its localhost API client is
currently fixed to port 8001. The frontend itself runs at port 5199, an origin
allowed by the backend CORS configuration.

The root API health endpoint is `GET /api/health`; Swagger UI is served at
`/api/docs`. The learning catalog import is optional and requires a valid
`MONGODB_URI`:

```powershell
npm run seed:catalog
```

There are no Mongoose migration files or general database reset command in
the tracked backend.

## Environment variables

`backend/.env.example` contains placeholders. Runtime references were checked
in `backend/src/` and the catalog script; example-only settings are called out
below.

| Variable | Purpose | Requirement / behavior |
|---|---|---|
| `MONGODB_URI` | Mongoose connection string; also used by the catalog import | Required to connect; the server exits when the connection fails. |
| `PORT` | HTTP listen port | Optional; defaults to `8000`. Use `8001` for the current local frontend configuration. |
| `JWT_SECRET` | Signs and verifies access tokens | Required for authenticated API flows; no code default is provided. |
| `JWT_REFRESH_SECRET` | Signs and verifies refresh tokens | Required for refresh-token flows; no code default is provided. |
| `JWT_EXPIRES_IN` | Access-token expiry passed to `jsonwebtoken` | Optional; code defaults to `7d`. The example file sets `15m`, so its value differs from the code fallback. |
| `NODE_ENV` | Selects development error details and non-production console logging | Optional; stack details are included in API errors only when set to `development`; Winston adds its console transport unless set to `production`. |
| `BREVO_API_KEY` | Authenticates transactional email requests to Brevo | Required for email sending; mail delivery throws if absent. |
| `EMAIL_USER` | Sender email supplied to Brevo | Optional; the mail module has a source-code fallback. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud configuration and status display | Needed along with the API key and secret for uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary authentication | Needed for Cloudinary uploads. |
| `CLOUDINARY_API_SECRET` | Cloudinary authentication | Needed for Cloudinary uploads; keep private. |
| `MAINTENANCE_MODE` | Enables maintenance responses when exactly `true` | Optional; only the string `true` activates the mode. |
| `CLIENT_URL` | Listed in `.env.example` | No runtime reference was found in backend source. HTTP and Socket.IO origins are currently hard-coded; setting this value alone does not configure CORS. |

The API host may need to match the browser configuration. The backend default
port is `8000`, while the frontend uses `8001` on localhost. HTTP CORS origins
are listed in `src/app.js`; Socket.IO origins are listed separately in
`src/infrastructure/socket/socket.js`.

## Architecture and request lifecycle

```text
src/
├── server.js                 dotenv, database connection, HTTP/Socket.IO startup, jobs
├── app.js                    Express middleware, route mounting, health/docs/404
├── core/
│   ├── errors/               AppError and centralized error handler
│   ├── http/                 Async handler wrapper
│   ├── security/             JWT authentication, role checks, rate limits
│   └── validation/           Request-body validation middleware
├── infrastructure/
│   ├── database/             Mongoose connection
│   ├── docs/                 Swagger UI/spec setup
│   ├── email/                Brevo mail sender, templates, feature mail services
│   ├── jobs/                 Refresh-token cleanup and submission expiry
│   ├── logging/              Morgan middleware and Winston logger
│   ├── server/               Admin server-status endpoint
│   ├── socket/               Socket.IO server and user events
│   └── storage/              Multer and Cloudinary helpers
└── modules/                  Feature routes, controllers, services, and models
```

`server.js` loads dotenv, awaits `connectDB()`, creates the HTTP server, then
initializes Socket.IO and two cron jobs. `app.js` parses JSON and URL-encoded
requests, parses cookies, logs requests, enforces maintenance mode, mounts
feature routers under `/api`, then serves the root health response and JSON
404/error responses. Route middleware authenticates and authorizes before
controllers perform feature logic.

Feature modules include auth, users, profiles, dashboards, courses,
internships, learning, attendance, tasks, submissions, certificates,
certificate payments, feedback, notices, notifications, messages, support,
search, follow, analytics, admin, and reports.

## API reference

Feature routes below use the `/api` prefix registered in `src/app.js`; the
backend's root response at `/` is the exception.
“Authenticated” means the request must provide a valid access token using the
JWT authorization scheme. “Student” and “admin” refer to role gates applied by
route middleware. Routes without a listed role may still require
authentication. In a row that lists a common prefix followed by shorthand
suffixes, each suffix is appended to that prefix.

The route tables emphasize registered methods, paths, access gates, and
purposes. Dynamic path parameters are shown with `:`. Body fields, query
parameters, and response details are listed below only where the validator or
handler explicitly establishes them; otherwise, inspect the linked route and
controller rather than inferring a contract.

The request validator responds with HTTP 400 and a `success: false` JSON body
containing validation issues. The centralized error handler returns
`success: false`, `statusCode`, and `message`; it adds stack/error details only
when `NODE_ENV=development`. The app returns 404 for unregistered paths and
503 while maintenance mode is enabled. Other response codes are
handler-specific.

### Health, public content, and authentication

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/health` | Public | Health response; returns 503 while maintenance mode is active. |
| `GET /` | Public | Root backend status JSON. |
| `GET /api/docs` | Public UI | Swagger UI; generated endpoint coverage is not verified. |
| `GET /api/public/hero-stats` | Public | Landing-page statistics. |
| `POST /api/auth/signup` | Public; registration limiter and Zod validation | Register an account; validated fields include username, email, password, and accepted terms. |
| `POST /api/auth/login` | Public; login limiter and Zod validation | Authenticate with email and password. |
| `POST /api/auth/admin/login` | Public; login limiter | Administrator login. |
| `POST /api/auth/verify-otp` | Public | Verify signup OTP. |
| `POST /api/auth/resend-otp` | Public; OTP limiter | Resend signup OTP. |
| `POST /api/auth/forgot-password` | Public; password-reset limiter | Request password reset OTP. |
| `POST /api/auth/verify-reset-otp` | Public | Verify password-reset OTP. |
| `POST /api/auth/reset-password` | Public | Reset password after OTP verification. |
| `POST /api/auth/refresh-token` | Public route; refresh token required in request body | Exchange a stored refresh token for an access token. |
| `POST /api/auth/logout` | Bearer | Revoke the authenticated user's stored refresh tokens. |

Signup requires terms acceptance and a password of at least eight characters
with upper- and lowercase letters, a number, and a special character, as
defined in `auth.validation.js`. User passwords are hashed in the User model.
The login body is validated for email and password. Request and response
details for other authentication operations are implemented in their
controllers and are not represented by one shared response schema.

### Users, profiles, and dashboards

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/users/me` | Bearer | Get the current user. |
| `PUT /api/users/profile` | Bearer | Update user profile information through the user module. |
| `PUT /api/users/change-password` | Bearer | Change password. |
| `DELETE /api/users/delete-account` | Bearer | Delete the current account. |
| `GET /api/profile` | Bearer | Get the current profile. |
| `GET /api/profile/user/:userId` | Authenticated | Read another user's profile. |
| `PUT /api/profile` and `PATCH /api/profile` | Bearer; profile Zod validation | Update profile fields. |
| `PUT /api/profile/profile-image` | Bearer; image upload | Upload profile avatar (`avatar` multipart field). |
| `GET /api/dashboard/student` | Student | Student dashboard data. |
| `GET /api/dashboard/admin` | Admin | Admin dashboard data. |
| `GET /api/admin/dashboard` | Admin | Admin overview data. |
| `GET /api/admin/enrollments` | Admin | Enrollment listing. |
| `GET /api/admin/users` and `GET /api/admin/users/:id` | Admin | List or view users. |
| `PUT /api/admin/users/:id` | Admin | Update a user. |
| `PATCH /api/admin/users/:id/block`, `/unblock`, or `/restore` | Admin | Change a user's account state. |
| `DELETE /api/admin/users/:id` | Admin | Delete a user. |

### Courses, internships, and learning

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/courses`, `GET /api/courses/:id`, `GET /api/courses/slug/:slug` | Public | Browse or retrieve course catalog records. |
| `POST /api/courses` | Admin; image upload | Create a course; image field is `img`. |
| `PUT /api/courses/:id` | Admin; image upload | Update a course. |
| `DELETE /api/courses/:id` | Admin | Delete a course. |
| `POST /api/courses/:id/join`, `GET /api/courses/student/my` | Student | Join a course or list the student's courses. |
| `PUT /api/courses/:id/progress`, `PUT /api/courses/:id/complete` | Student | Update course progress or mark completion. |
| `POST /api/courses/slug/:slug/complete-lesson`, `GET /api/courses/slug/:slug/completed-lessons` | Student | Record or retrieve completed lessons. |
| `GET /api/internships`, `GET /api/internships/:id`, `GET /api/internships/slug/:slug` | Public | Browse or retrieve internship catalog records. |
| `POST /api/internships` | Admin; image upload | Create an internship. |
| `PUT /api/internships/:id` | Admin; image upload | Update an internship. |
| `DELETE /api/internships/:id` | Admin | Delete an internship. |
| `POST /api/internships/:id/join`, `GET /api/internships/student/my` | Student | Join an internship or list the student's internships. |
| `PUT /api/internships/:id/progress`, `PUT /api/internships/:id/complete` | Student | Update internship progress or mark completion. |
| `POST /api/internships/slug/:slug/complete-lesson`, `GET /api/internships/slug/:slug/completed-lessons` | Student | Record or retrieve completed lessons. |
| `GET /api/learning/:type/:slug` | Student | Retrieve learning content. |
| `GET /api/search/internships` | Public | Search internships. |
| `GET /api/search/users` | Bearer | Search users. |

Course and internship routes accept image uploads through Multer's in-memory
storage and Cloudinary. See [upload behavior](#integrations-and-operational-behavior).

### Attendance, tasks, and submissions

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/attendance/active-time`, `POST /api/attendance/active-time` | Student | Read or update active-time data. |
| `GET /api/attendance/my-attendance` | Student | Read the current student's attendance. |
| `GET /api/attendance/internship/:id` | `employer` role gate | Internship attendance. The User schema currently allows only `student` and `admin`; see known gaps. |
| `POST /api/tasks` | Admin | Create a task. |
| `GET /api/tasks/my-tasks`, `GET /api/tasks/my-tasks/:id` | Student | List or retrieve the student's tasks. |
| `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` | Admin | Update or delete a task. |
| `PATCH /api/tasks/:id/status`, `POST /api/tasks/submit` | Student | Update task status or submit a task. |
| `GET /api/tasks/pending`, `GET /api/tasks/details/:id` | Admin | List pending tasks or inspect task details. |
| `PATCH /api/tasks/approve/:id`, `PATCH /api/tasks/reject/:id` | Admin | Review a task. |
| `GET /api/admin/tasks/pending`, `GET /api/admin/tasks/approved` | Admin | List task approvals. |
| `GET /api/admin/tasks/:id` | Admin | Read task review details. |
| `PATCH /api/admin/tasks/:id/approve`, `PATCH /api/admin/tasks/:id/reject` | Admin | Approve or reject a task. |
| `POST /api/submissions` | Student | Create a course task submission. |
| `GET /api/submissions/my`, `GET /api/submissions/course/:courseSlug` | Student | List the student's submissions. |
| `GET /api/admin/submissions`, `GET /api/admin/submissions/:id`, `GET /api/admin/submissions/by-task/:taskId` | Admin | List or inspect submissions. |
| `PUT /api/admin/submissions/:id/approve`, `PUT /api/admin/submissions/:id/reject`, `PUT /api/admin/submissions/:id/extend` | Admin | Review or extend a submission. |

### Certificates and certificate payments

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/certificates/my` | Bearer | List the current user's certificates. |
| `GET /api/certificates/download/:id` | Bearer | Download a certificate. |
| `GET /api/certificates/verify/:token` | Public | Verify a certificate. |
| `POST /api/certificate-payments/create`, `/submit`, `/cancel` | Bearer | Create, submit, or cancel a manual certificate-payment session. |
| `GET /api/certificate-payments/my` | Bearer | Read payment status for the current user. |
| `GET /api/certificate-payments/admin/pending`, `/issued` | Admin | List certificate-payment review queues. |
| `GET /api/certificate-payments/admin/:id`, `/download/:id` | Admin | Inspect a payment or download its evidence. |
| `PATCH /api/certificate-payments/admin/:id/approve`, `/reject` | Admin | Approve or reject submitted payment. |

The payment workflow uses a manual QR payment and administrator review. The
backend source does not configure a card-payment gateway or automatically
issue a certificate when a student submits payment details.

`POST /api/certificate-payments/create` accepts exactly one of `courseId` or
`internshipId`; the amount is resolved server-side. The `submit` action
requires `paymentId` and accepts `payerName` and `transactionId`; `cancel`
requires `paymentId`. The `my` endpoint expects exactly one of `courseId` or
`internshipId` as a query parameter. A new payment session returns 201, while
reuse of an existing session returns 200.

### Notices, feedback, notifications, messaging, and support

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/notices` | Public | List notices. |
| `POST /api/notices`, `PUT /api/notices/:id`, `DELETE /api/notices/:id` | Admin | Create, update, or delete notices; create/update accept an `img` image field. |
| `GET /api/feedback/website` | Public | Read website feedback. |
| `GET /api/feedback/my/:type`, `POST /api/feedback` | Student | Read or submit student feedback. |
| `GET /api/feedback/admin`, `DELETE /api/feedback/admin/:id` | Admin | Review or delete feedback. |
| `POST /api/notifications` | Admin | Create a notification. |
| `GET /api/notifications` | Bearer | List the current user's notifications. |
| `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read` | Bearer | Mark notifications as read. |
| `DELETE /api/notifications/:id` | Bearer | Delete a notification. |
| `POST /api/follow/:userId`, `DELETE /api/follow/:userId` | Bearer | Follow or unfollow a user. |
| `GET /api/follow/:userId/followers`, `GET /api/follow/:userId/following` | Bearer | List followers or followed users. |
| `POST /api/messages` | Bearer | Send a message. |
| `GET /api/messages/users`, `GET /api/messages/:userId` | Bearer | List chat users or retrieve a conversation. |
| `GET /api/messages/search/:userId`, `GET /api/messages/page/:userId` | Bearer | Search or paginate messages. |
| `GET /api/messages/starred/:userId`, `PATCH /api/messages/star/:id` | Bearer | Read or toggle starred messages. |
| `PATCH /api/messages/seen/:userId` | Bearer | Mark conversation messages as seen. |
| `GET /api/messages/muted`, `GET /api/messages/blocked` | Bearer | List muted conversations or blocked users. |
| `PATCH /api/messages/mute/:userId`, `PATCH /api/messages/block/:userId` | Bearer | Toggle mute or block state. |
| `DELETE /api/messages/conversation/:userId`, `DELETE /api/messages/me/:id`, `DELETE /api/messages/everyone/:id` | Bearer | Delete a conversation or message for the supported scope. |
| `GET /api/messages/export/:userId` | Bearer | Export a conversation. |
| `GET /api/support/conversation` | Student | Get the student's support conversation. |
| `POST /api/support/conversation/:conversationId/messages`, `GET /api/support/conversation/:conversationId/messages` | Student or admin | Send or read support messages. |
| `DELETE /api/support/conversation/:conversationId` | Student | Clear the student's support conversation. |
| `GET /api/support/inbox`, `PATCH /api/support/conversation/:conversationId` | Admin | Review or update support conversations. |

`GET /api/messages/blocked` is registered twice in the message router; it is
listed once above because both registrations target the same handler.
Message search reads a `keyword` query parameter; paginated message retrieval
reads `page` and defaults to page 1.

### Analytics, reports, and server status

| Method and path | Access | Purpose |
|---|---|---|
| `GET /api/analytics/dashboard`, `GET /api/analytics/monthly` | Admin | Analytics summaries. |
| `GET /api/admin/reports/daily`, `/weekly`, `/monthly`, `/years`, `/yearly` | Admin | Read report summaries. |
| `GET /api/admin/reports/activity/users`, `/activity/users/:userId` | Admin | Read activity-user reports. |
| `GET /api/server/status` | Admin | Read backend, database, Cloudinary configuration status, and server time. |

The standalone `modules/activity/activity.routes.js` file is not imported or
mounted by `src/app.js`; its `/me` and `/all` declarations are therefore not
active API routes in the current app registration.

## Authentication and security

- `protect` verifies a JWT from the `Authorization: Bearer ...` header, loads
  the user, and attaches it to the request. `authorizeRoles` enforces explicit
  role lists for protected routes.
- Access tokens are signed using `JWT_SECRET`; refresh tokens use
  `JWT_REFRESH_SECRET` and are stored in MongoDB. The access-token expiry is
  controlled by `JWT_EXPIRES_IN` or defaults to seven days; refresh-token
  creation uses seven days.
- Passwords are hashed with bcrypt in the User model. Signup and login
  validation use Zod. OTP and password-reset flows use expiring database
  records and email services.
- Rate limiters are applied to login, signup, forgot-password, and OTP resend:
  respectively 10 per 15 minutes, 10 per hour, 3 per 15 minutes, and 3 per
  10 minutes.
- HTTP CORS uses a hard-coded origin allowlist and credentials. Socket.IO has
  a separate allowlist. Additions to `.env` do not alter either list.
- Multer accepts image MIME types only and limits uploads to 2 MiB.
- The centralized error handler maps common Mongoose, JWT, Multer, and
  Cloudinary errors. Development responses include stack/error details;
  other environments receive a reduced JSON response.
- Helmet, HPP, and compression appear as dependencies but are not applied in
  the current `src/app.js`. Do not assume those protections are active.

## Database models

Models are defined with Mongoose schemas in feature modules; no migration
framework is present.

| Model | Purpose and verified schema behavior |
|---|---|
| `User` | Identity, authentication, role, profile, education, and account state. Username and email are required and unique; role enum is `student` or `admin`; passwords are bcrypt-hashed before save. |
| `Course`, `Internship` | Learning catalog records with required unique slug, title, category, description, duration, and non-negative price; level is constrained to Beginner, Intermediate, or Advanced. |
| `StudentInternship` | Enrollment/progress references `User` and exactly one of `Course` or `Internship`; stores lesson, task, and completion progress. |
| `Task`, `Submission` | Assigned tasks and student work/review lifecycle. Submissions reference the student and course/internship data; a compound unique index prevents duplicate student/course/module/lesson/task submissions. |
| `Attendance`, `AttendanceActivity` | Attendance and activity tracking. |
| `Certificate`, `CertificatePayment` | Certificate records have unique certificate number and verification token. Payments snapshot the amount and link to exactly one course or internship; the payment model supports manual QR and admin review. |
| `OTP`, `RefreshToken` | Temporary one-time-password and refresh-token records. |
| `Feedback`, `Notice`, `Notification` | User feedback and public/admin notice and notification data. |
| `Message`, `ChatBlock`, `ChatMute`, `SupportConversation` | Direct messaging, mute/block state, and support conversations. |
| `Follow`, `ActivityLog`, `LearningDay`, `Badges`, `UserBadge`, `CertificateSequence`, `DeletedStudentBackup` | Social graph, activity history, learning-day tracking, badges, certificate numbering, and account recovery/support data. |

Only relationships and constraints explicitly present in schemas are described
above. Timestamps, indexes, and validation details vary by model; review the
individual schema before relying on additional constraints.

## Integrations and operational behavior

- **Email:** `src/infrastructure/email/mail.js` calls the Brevo SMTP email API.
  Feature services provide OTP, password-reset, welcome, task, badge,
  certificate, and other message templates. Email sending requires
  `BREVO_API_KEY`.
- **Uploads:** Multer keeps image uploads in memory; Cloudinary stores profile,
  course, internship, and other feature images. Credentials are required for
  upload operations.
- **Certificate payment:** students submit payer name and transaction ID for
  manual QR payment; an admin reviews the submission. No automatic external
  payment verification was found.
- **Realtime:** Socket.IO emits online-user, chat, notification, and task
  events. The server maintains in-memory online-user and active-chat maps;
  no Socket.IO authentication middleware is configured in the inspected
  initializer.
- **Scheduled jobs:** refresh-token cleanup runs daily and removes expired
  records; the submission deadline job runs every five minutes and marks
  expired submissions, then emits a user event.
- **Logging:** Morgan logs requests; Winston writes `logs/error.log`,
  `logs/combined.log`, `logs/exceptions.log`, and `logs/rejections.log`, with
  console logging outside production.
- **Catalog data:** JSON content is stored under `data/Courses/`,
  `data/Internships/`, and `data/support/`. `npm run seed:catalog` reads the
  course and internship catalog directories.

## Tests, CI, and deployment

There are no checked-in backend test files. Although Jest and Supertest are
dependencies, the package's `test` script is `echo "Error: no test specified"
&& exit 1`; it does not run a test suite. No backend lint or type-check script
is defined.

The GitHub Actions workflow uses Node.js 22 and detects optional scripts. It
will invoke the current backend `test` script because it exists, and that
script exits with an error. The workflow does not deploy the application.
There is no checked-in Docker/Compose file or verified backend deployment
configuration.

The Swagger UI is mounted at `/api/docs`, but `src/infrastructure/docs/swagger.js`
searches `./src/routes/*.js` while the current route modules live under
`src/modules/`. The UI is present; complete generated API documentation has
not been verified.

## Known gaps and troubleshooting

- **MongoDB connection failure:** check that `MONGODB_URI` is set and that the
  database is reachable. Startup waits for a successful connection.
- **Frontend cannot reach a local API:** set backend `PORT=8001`; the frontend
  selects that port for localhost. Its default backend `PORT` value is 8000.
- **CORS rejection:** inspect the static origins in `src/app.js` and the
  separate list in `src/infrastructure/socket/socket.js`.
- **Email failure:** configure `BREVO_API_KEY`; `CLIENT_URL` in the example
  file is not read by backend runtime code.
- **Cloud uploads fail:** configure `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- **Attendance employer route:** `/api/attendance/internship/:id` requires
  role `employer`, but the User schema's role enum contains only `student` and
  `admin`; the route's intended availability is therefore not established by
  the current schema.
- **CI test step fails:** the backend test script is a failing placeholder,
  not a working test suite.

For repository-level setup, see the [root README](../README.md). The
[frontend guide](../frontend/README.md) documents browser routes and API
client configuration.
