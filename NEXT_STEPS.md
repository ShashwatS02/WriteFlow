# WriteFlow - Next Steps & Feature Roadmap

## ✅ Current Status (Completed)

- [x] Next.js 15 App Router with React 19 and TypeScript
- [x] tRPC v11 with React Query v5 (URL-style HTTP endpoints)
- [x] Drizzle ORM with Postgres (Neon-compatible)
- [x] Database seeded with 6 categories and 5 demo posts
- [x] Homepage with latest posts and platform stats
- [x] Blog listing page with search, filters, and pagination
- [x] Admin dashboard scaffolding
- [x] Dark mode with next-themes
- [x] Tailwind CSS with Framer Motion animations
- [x] **Phase 1.1: Admin Dashboard - Posts Management** ✨
  - [x] Complete post editor at `/dashboard/posts/new`
  - [x] Edit post page at `/dashboard/posts/[id]`
  - [x] Auto-slug generation with validation
  - [x] Live markdown preview
  - [x] Image upload support
  - [x] Success/error toast notifications
  - [x] Posts list with Edit/Delete/Publish actions
- [x] **Phase 1.2: Admin Dashboard - Category Management** ✨ NEW!
  - [x] Categories list with stats dashboard
  - [x] Create category page at `/dashboard/categories/new`
  - [x] Edit category page at `/dashboard/categories/[id]`
  - [x] Color picker with 10 vibrant colors
  - [x] Auto-slug generation with validation
  - [x] Search and filtering
  - [x] Delete with confirmation

📄 **See `PHASE_1_COMPLETE.md` and `PHASE_1_2_COMPLETE.md` for detailed implementation notes**

## 🚀 Recommended Sequential Steps

### ✅ Phase 1: Admin Dashboard - Posts (COMPLETED!)

**Priority: HIGH** - Enable content management without database access

#### 1.1 Posts Management ✅ DONE

- [x] Wire up dashboard posts list to `posts.getAll`
- [x] Add "New Post" button linking to `/dashboard/posts/new`
- [x] Implement post editor with:
  - [x] Markdown preview (react-markdown + rehype-highlight)
  - [x] Title, slug (auto-generated), excerpt fields
  - [x] Category multi-select
  - [x] Cover image upload
  - [x] Publish/draft toggle
  - [x] Save/publish actions using `posts.create` mutation
- [x] Add admin token to mutation headers: `x-admin-token: dev-admin-token`
- [x] Test create, edit, delete flows
- [x] Real-time slug validation
- [x] Word count and reading time estimate
- [x] Toast notifications for all actions

**File locations:**

- `app/dashboard/posts/page.tsx` - Posts list
- `app/dashboard/posts/new/page.tsx` - New post editor
- `app/dashboard/posts/[id]/edit/page.tsx` - Edit post
- `server/trpc/posts.ts` - Already has CRUD mutations

**Admin auth:**
All admin mutations require header:

```typescript
headers: { 'x-admin-token': 'dev-admin-token' }
```

#### 1.2 Categories Management ✅ DONE

- [x] Wire up dashboard categories to `categories.getAll`
- [x] Add create/edit category pages with forms
- [x] Display post count and stats per category
- [x] Implement color picker (10 vibrant colors)
- [x] Auto-slug generation with validation
- [x] Search filtering by name/slug
- [x] Delete with confirmation dialog
- [x] Toast notifications for all actions
- [x] Test CRUD operations

**Files:**

- `app/dashboard/categories/page.tsx` - List with stats
- `app/dashboard/categories/new/page.tsx` - Create form
- `app/dashboard/categories/[id]/page.tsx` - Edit form
- `server/trpc/categories.ts` - CRUD mutations

#### 1.3 Dashboard Analytics (Next)

- [ ] Display stats from `categories.getStats`
- [ ] Add recent posts list
- [ ] Show draft vs published counts
- [ ] Quick actions (publish draft, edit recent)

---

### Phase 2: Enhanced Editor Experience

**Priority: MEDIUM** - Better content authoring

#### 2.1 Rich Markdown Editor

**Option A: MDX Editor (Recommended)**

```bash
npm install @mdxeditor/editor
```

- WYSIWYG with markdown toolbar
- Image uploads via drag-drop
- Code syntax highlighting
- Table support

**Option B: Tiptap**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-markdown
```

- More customizable
- Better for advanced formatting

#### 2.2 Slug Auto-generation

- [ ] Auto-generate slug from title (already have `slugify` util)
- [ ] Check slug uniqueness via `posts.checkSlug`
- [ ] Allow manual override

#### 2.3 Live Preview

- [ ] Split-pane editor with live markdown rendering
- [ ] Preview in light/dark mode
- [ ] Mobile preview toggle

---

### Phase 3: Image Uploads & Media

**Priority: MEDIUM** - Professional content needs images

#### 3.1 Choose Upload Strategy

**Option A: AWS S3 (Currently scaffolded)**
Required env vars in `.env.local`:

```ini
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
UPLOAD_MAX_BYTES=5242880
```

Endpoint: `POST /api/uploads/presign`

- Returns presigned upload URL
- Client uploads directly to S3
- Returns public file URL

**Option B: Uploadthing (Simpler)**

```bash
npm install uploadthing @uploadthing/react
```

Required env vars:

```ini
UPLOADTHING_URL=https://uploadthing.com/api
UPLOADTHING_SECRET=your-secret
```

#### 3.2 Wire Up Uploads

- [ ] Add image picker to post editor
- [ ] Upload cover images via chosen service
- [ ] Store `coverImageUrl` in post
- [ ] Test image display on blog pages

---

### Phase 4: Search & Discovery

**Priority: MEDIUM** - Help readers find content

#### 4.1 Enhanced Search

- [ ] Full-text search already works via `posts.search`
- [ ] Add search results page
- [ ] Highlight search terms in results
- [ ] Add search suggestions/autocomplete

#### 4.2 Related Posts

- [ ] Use existing `posts.getRelated` endpoint
- [ ] Display at bottom of single post pages
- [ ] Algorithm: posts sharing categories

#### 4.3 Category Pages

- [ ] Add `/blog/category/[slug]` route
- [ ] Filter posts by category
- [ ] Show category description

---

### Phase 5: Production Hardening

**Priority: HIGH before deployment**

#### 5.1 Authentication & Security

Current setup uses simple token auth. For production:

**Recommended: NextAuth.js v5**

```bash
npm install next-auth@beta
```

- GitHub/Google OAuth
- Session management
- CSRF protection

Or keep simple auth but:

- [ ] Hash `ADMIN_API_TOKEN` (bcrypt)
- [ ] Add rate limiting (upstash/redis)
- [ ] Implement session timeouts

#### 5.2 Error Handling

- [ ] Add global error boundary
- [ ] Implement tRPC error formatter
- [ ] Add Sentry or similar for monitoring
- [ ] Graceful DB connection failures

#### 5.3 Performance

- [ ] Add Redis caching for posts list
- [ ] Implement ISR for static blog pages
- [ ] Optimize images (next/image)
- [ ] Add CDN for static assets

#### 5.4 SEO & Metadata

- [ ] Generate dynamic sitemap (`app/sitemap.ts` exists)
- [ ] Add robots.txt rules (`app/robots.ts` exists)
- [ ] OpenGraph images per post (`app/blog/[slug]/opengraph-image.tsx` exists)
- [ ] Structured data (JSON-LD)

---

### Phase 6: Deployment

**Priority: When ready to go live**

#### 6.1 Choose Platform

**Option A: Vercel (Recommended for Next.js)**

```bash
npm install -g vercel
vercel login
vercel
```

- Auto-deploy on git push
- Edge functions
- Built-in CDN
- Free hobby tier

**Option B: Railway**

- Postgres included
- Simple pricing
- Good for full-stack apps

**Option C: Self-hosted (VPS)**

- More control
- Requires Docker knowledge
- Use PM2 for process management

#### 6.2 Production Checklist

- [ ] Set all production env vars
- [ ] Use strong `ADMIN_API_TOKEN`
- [ ] Enable SSL/HTTPS
- [ ] Configure custom domain
- [ ] Set up database backups
- [ ] Configure CORS if needed
- [ ] Add analytics (Plausible/Umami)

---

## 🛠 Quick Commands Reference

### Development

```powershell
# Start dev server
npm run dev:3001

# Run migrations
npm run migrate

# Seed database
npm run seed

# Type check
npm run typecheck

# Run tests
npm test
```

### Database

```powershell
# Generate new migration
npx drizzle-kit generate

# View database
npx drizzle-kit studio

# Direct DB query (Node)
node -e "require('dotenv').config({path: '.env.local'}); const { Client }=require('pg'); (async()=>{const c=new Client({connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}}); await c.connect(); const r=await c.query('SELECT * FROM posts LIMIT 5'); console.log(r.rows); await c.end();})();"
```

### Testing APIs

```powershell
# Test all endpoints
node scripts/test-api.mjs

# Health check
curl http://localhost:3001/api/trpc/health.ping

# Get stats
curl http://localhost:3001/api/trpc/categories.getStats

# Get posts (URL-encoded JSON)
$input = [uri]::EscapeDataString('{\"page\":1,\"pageSize\":3,\"isPublished\":true,\"sortBy\":\"newest\"}')
curl "http://localhost:3001/api/trpc/posts.getAll?input=$input"
```

---

## 📊 Current Data

**Seeded Content:**

- 6 categories: Tech, Design, Lifestyle, Productivity, Tutorials, Reviews
- 5 published posts with rich content
- 44 minutes total reading time

**Database Tables:**

- `categories` - Blog categories with color variants
- `posts` - Posts with markdown content, metadata
- `post_categories` - Many-to-many relationship

---

## 🎯 My Recommendation: Start Here

**Week 1: Admin Dashboard**

1. Wire up posts list (1 hour)
2. Build post editor with markdown (3-4 hours)
3. Add category management (2 hours)
4. Test full CRUD cycle (1 hour)

**Week 2: Uploads & Polish**

1. Set up S3 or Uploadthing (2 hours)
2. Add image uploads to editor (2 hours)
3. Enhance search UI (2 hours)
4. Add related posts (1 hour)

**Week 3: Production Prep**

1. Add NextAuth or harden token auth (3 hours)
2. Error handling & monitoring (2 hours)
3. Performance optimizations (2 hours)
4. SEO metadata (2 hours)

**Week 4: Deploy**

1. Choose platform and deploy (2 hours)
2. Configure production env (1 hour)
3. Test live site thoroughly (2 hours)
4. Set up backups and monitoring (1 hour)

---

## 🚦 Current Blockers: NONE

Everything is working and ready to build on. Your next immediate action should be:

**→ Open http://localhost:3001/dashboard/posts/new and start wiring the post editor**

The tRPC mutation `posts.create` is ready. You just need to:

1. Build the form UI
2. Add markdown textarea
3. Wire up the mutation with admin token
4. Test creating a post

Would you like me to build the post editor next, or do you want to focus on a different feature?
