# WriteFlow

Production-grade single-admin blogging platform scaffold.

Getting started:

1. Copy `.env.example` to `.env.local` and fill values
2. npm install
3. (optional) Start a local Postgres via Docker Compose
4. Run migrations
5. (optional) Seed demo data
6. npm run dev

Tech stack:

- Next.js 15 (App Router), React 19, TypeScript
- tRPC v11 with React Query v5 and SuperJSON
- Drizzle ORM + Postgres (Neon compatible)
- Tailwind CSS + Framer Motion + Sonner

Environment variables:

- `DATABASE_URL` or `NEON_DATABASE_URL`: Postgres connection string
- `ADMIN_API_TOKEN`: Token used by admin-only tRPC procedures (send in `x-admin-token`)
- `UPLOADTHING_URL`, `UPLOADTHING_SECRET`: Optional Uploadthing proxy
- `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Optional S3 presigned uploads
- `UPLOAD_MAX_BYTES`: Optional max upload size (default 5MB)

Scripts:

- `npm run dev` — start dev server
- `npm run build && npm start` — production build/start
- `npm run migrate` — run Drizzle SQL migrations in `migrations/`
- `npm run seed` — seed demo content (requires DB env set)

Local database (Postgres):

Option A — Docker Compose

1. Start the DB

```powershell
docker compose up -d
```

2. Create `.env.local`

```ini
DATABASE_URL=postgres://writeflow:writeflow@localhost:5432/writeflow
ADMIN_API_TOKEN=dev-admin-token
```

3. Run migrations and seed

```powershell
npm run migrate
npm run seed
```

Option B — Neon (or other Postgres)

1. Set `DATABASE_URL` (or `NEON_DATABASE_URL`) in `.env.local`
2. Run `npm run migrate`
3. Optionally run `npm run seed`
