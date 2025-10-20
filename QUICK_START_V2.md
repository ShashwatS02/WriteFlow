# ⚡ WriteFlow v2.0 - Quick Start Guide

**Version**: 2.0.0  
**Date**: October 20, 2025

---

## 🚀 Getting Started

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd WriteFlow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev:3001
```

**Access**: http://localhost:3001

---

## 🎨 Using Animation Components

### Scroll Reveal Animation

Animate elements when they scroll into view:

```tsx
import { ScrollReveal } from "@/components/animations";

<ScrollReveal variant="fadeInUp" delay={0.2}>
  <div>Your content here</div>
</ScrollReveal>;
```

**Variants**: `fadeInUp`, `fadeInLeft`, `fadeInRight`, `scaleIn`, `slideUp`

### Stagger Animation

Animate lists with staggered timing:

```tsx
import { StaggerContainer, StaggerItem } from "@/components/animations";

<StaggerContainer staggerDelay={0.1}>
  {items.map((item) => (
    <StaggerItem key={item.id} variant="scaleIn">
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerContainer>;
```

**Variants**: `fadeInUp`, `fadeInLeft`, `scaleIn`, `slideUp`

### Page Transitions

Add smooth page transitions:

```tsx
import { PageTransition } from "@/components/animations";

export default function MyPage() {
  return (
    <PageTransition>
      <div>Your page content</div>
    </PageTransition>
  );
}
```

---

## 📊 Using Chart Components

### Line Chart

```tsx
import { LineChartCard } from "@/components/charts/ChartComponents";

const data = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 150 },
  { name: "Mar", value: 200 },
];

<LineChartCard
  title="Monthly Growth"
  data={data}
  color="#6366f1"
  description="Last 3 months"
/>;
```

### Area Chart (Multiple Series)

```tsx
import { AreaChartCard } from "@/components/charts/ChartComponents";

const data = [
  { name: "Jan", posts: 10, categories: 5 },
  { name: "Feb", posts: 15, categories: 7 },
];

<AreaChartCard
  title="Content Growth"
  data={data}
  dataKeys={[
    { key: "posts", color: "#10b981", name: "Posts" },
    { key: "categories", color: "#f59e0b", name: "Categories" },
  ]}
/>;
```

### Bar Chart

```tsx
import { BarChartCard } from "@/components/charts/ChartComponents";

<BarChartCard title="Posts Published" data={weeklyData} color="#6366f1" />;
```

### Pie Chart

```tsx
import { PieChartCard } from "@/components/charts/ChartComponents";

<PieChartCard
  title="Post Status"
  data={[
    { name: "Published", value: 80, color: "#10b981" },
    { name: "Draft", value: 20, color: "#f59e0b" },
  ]}
/>;
```

---

## 🎨 Using UI Components

### Button

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>;
```

**Variants**: `primary`, `secondary`, `ghost`, `danger`, `success`, `outline`  
**Sizes**: `sm`, `md`, `lg`, `xl`

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>;
```

**Variants**: `default`, `glass`, `bordered`, `gradient`, `elevated`

### Badge

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="success" size="md">
  Published
</Badge>;
```

**Variants**: `default`, `primary`, `success`, `warning`, `danger`, `info`, `outline`  
**Sizes**: `sm`, `md`, `lg`

### Input

```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error={errors.email}
/>;
```

### Skeleton (Loading States)

```tsx
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

{
  isLoading ? <SkeletonCard /> : <Card>Content</Card>;
}
```

---

## 🔍 SEO Configuration

### Page-Specific SEO

```tsx
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
```

### Global SEO (Already configured in `app/layout.tsx`)

All pages inherit these tags:

- ✅ Open Graph
- ✅ Twitter Cards
- ✅ Robots directives
- ✅ Icons & manifest

---

## 📱 PWA Features

### Installation

**Desktop**:

1. Visit your site in Chrome/Edge
2. Click install icon in address bar
3. App opens in standalone window

**Mobile**:

- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Install app

### Offline Support

PWA automatically caches:

- All dashboard pages
- Static assets (CSS, JS, images)
- API responses (configurable)

### App Shortcuts

Right-click app icon to access:

- New Post
- All Posts

---

## 📊 Analytics Dashboard

### Access

Navigate to: `/dashboard/analytics`

### Features

1. **Key Metrics Cards**:
   - Total views with trend
   - Average time on site
   - Bounce rate
   - Engagement rate

2. **Charts**:
   - Views & Visitors (line chart)
   - Content Growth (area chart)
   - Posts Published (bar chart)
   - Post Status (pie chart)
   - Category Distribution (pie chart)

3. **Performance Summary**:
   - Total posts
   - Total categories
   - Total reading time

### Customization

Replace mock data with real analytics:

```tsx
// Install analytics package
npm install @vercel/analytics

// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🎬 Animation Best Practices

### Performance

```tsx
// ✅ Good: Animate on scroll
<ScrollReveal variant="fadeInUp">
  <Card />
</ScrollReveal>

// ❌ Avoid: Too many animations at once
<div>
  {Array(100).map(i => (
    <ScrollReveal key={i}>
      <Card />
    </ScrollReveal>
  ))}
</div>
```

### Accessibility

```tsx
// Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Mobile Performance

```tsx
// Use simpler animations on mobile
const variant = isMobile ? "fadeIn" : "fadeInUp";

<ScrollReveal variant={variant}>
  <Card />
</ScrollReveal>;
```

---

## 🛠️ Development Workflow

### Local Development

```bash
# Start dev server
npm run dev:3001

# In another terminal, watch Tailwind
npm run dev

# Database studio
npm run db:studio
```

### Production Build

```bash
# Build for production
npm run build

# Test production build
npm start

# Analyze bundle
npm run analyze
```

### Deployment

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create file in `app/` directory
2. Add animations:

   ```tsx
   import { ScrollReveal, StaggerContainer } from "@/components/animations";

   export default function MyPage() {
     return (
       <div>
         <ScrollReveal variant="fadeInUp">
           <h1>Title</h1>
         </ScrollReveal>
       </div>
     );
   }
   ```

### Adding SEO to Page

```tsx
export const metadata = {
  title: "Page Title",
  description: "Page description",
  openGraph: {
    title: "Page Title",
    description: "Page description",
  },
};
```

### Creating Custom Chart

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function MyChart({ data }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>My Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#6366f1" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 📱 Responsive Design

All components are responsive by default. Use Tailwind classes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
</div>
```

**Breakpoints**:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🌙 Dark Mode

Dark mode is automatic! All components support it.

### Testing Dark Mode

1. Click theme toggle (bottom-right)
2. Or set system preference
3. Colors adapt automatically

### Custom Dark Mode Styles

```tsx
<div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
  Content
</div>
```

---

## 🚨 Troubleshooting

### Animations Not Working

```bash
# Check Framer Motion is installed
npm list framer-motion

# Reinstall if needed
npm install framer-motion
```

### Charts Not Displaying

```bash
# Check Recharts is installed
npm list recharts

# Reinstall if needed
npm install recharts
```

### PWA Not Installing

1. Check `manifest.json` exists in `/public`
2. Verify `next.config.js` has PWA config
3. Build for production (`npm run build`)
4. PWA only works in production mode

### SEO Tags Missing

1. Check `app/layout.tsx` has metadata
2. Verify `NEXT_PUBLIC_APP_URL` in `.env.local`
3. Build and check page source

---

## 📚 Additional Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

### Project Docs

- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `ADVANCED_FEATURES_COMPLETE.md` - Feature details
- `FINAL_PROJECT_SUMMARY_V2.md` - Complete summary

### Support

- GitHub Issues
- Discord Community
- Email: support@writeflow.com

---

## ✅ Quick Checklist

### Before Deploying

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Production build successful
- [ ] PWA manifest configured
- [ ] SEO metadata complete
- [ ] Icons generated
- [ ] Performance tested
- [ ] Accessibility verified

### After Deploying

- [ ] Site loads correctly
- [ ] All pages accessible
- [ ] Forms working
- [ ] CRUD operations work
- [ ] PWA installable
- [ ] SEO tags present
- [ ] Analytics tracking
- [ ] Error monitoring active

---

**Need Help?** Check the comprehensive documentation or reach out for support!

**Happy Building!** 🚀✨
