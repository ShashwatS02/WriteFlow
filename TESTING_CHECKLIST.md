# ⚡ WriteFlow - Quick Testing Checklist

**Use this for rapid testing before deployment**

---

## 🚀 5-Minute Smoke Test

```powershell
# 1. Start server
npm run dev:3001

# 2. Open browser
http://localhost:3001
```

### Critical Path Testing (5 minutes)

- [ ] **Homepage loads** - No errors in console
- [ ] **Dashboard loads** - http://localhost:3001/dashboard
- [ ] **Stat cards display** - All 4 cards visible with numbers
- [ ] **Create post** - Navigate to `/dashboard/posts/new`, type title, save
- [ ] **View posts** - Go to `/dashboard/posts`, see post list
- [ ] **Create category** - Go to `/dashboard/categories/new`, create one
- [ ] **Analytics page** - Go to `/dashboard/analytics`, charts load
- [ ] **Dark mode** - Toggle works (bottom-right)
- [ ] **Mobile view** - Press F12, toggle device toolbar, looks good

**If all ✓ → Ready to deploy!**

---

## 🧪 15-Minute Full Test

### Setup (2 min)

```powershell
npm install
npm run db:push
npm run dev:3001
```

### Feature Tests (10 min)

#### Posts (3 min)

- [ ] List shows posts
- [ ] Search works
- [ ] Create new post
- [ ] Edit existing post
- [ ] Delete post (with confirmation)
- [ ] Publish/unpublish toggle

#### Categories (2 min)

- [ ] List shows categories
- [ ] Create new category
- [ ] Color picker works
- [ ] Edit category
- [ ] Delete category

#### Dashboard (2 min)

- [ ] All stat cards show correct numbers
- [ ] Animations play smoothly
- [ ] Widgets display correctly
- [ ] Links work

#### Analytics (2 min)

- [ ] Page loads
- [ ] All 5 charts render
- [ ] Hover tooltips work
- [ ] Responsive (resize window)

#### UI/UX (1 min)

- [ ] Dark mode toggle works
- [ ] All buttons clickable
- [ ] Forms validate
- [ ] Toasts appear

### Quick Checks (3 min)

- [ ] No console errors
- [ ] Page loads < 3 seconds
- [ ] Responsive on mobile (F12)
- [ ] Animations smooth, not janky

---

## 🏗️ Production Build Test

```powershell
# Build (1-2 minutes)
npm run build

# Expected: ✓ Compiled successfully

# Start (immediate)
npm start

# Test (5 minutes)
# Open: http://localhost:3000
```

### Production Checklist

- [ ] All pages load
- [ ] No console errors
- [ ] PWA installable (look for install icon)
- [ ] Service worker active (DevTools → Application)
- [ ] Lighthouse score > 90

---

## 🐛 Common Issues Quick Fix

### Port in use

```powershell
Get-NetTCPConnection -LocalPort 3001 | ForEach-Object {Stop-Process -Id $_.OwningProcess -Force}
```

### Module not found

```powershell
npm install
```

### Database error

```powershell
npm run db:push
```

### Build fails

```powershell
Remove-Item .next -Recurse -Force
npm run build
```

---

## ✅ Pre-Deployment Final Check

### Must Pass (5 min)

- [ ] `npm run build` - ✓ success
- [ ] `npm start` - starts without errors
- [ ] All pages accessible
- [ ] No critical console errors
- [ ] Forms submit successfully
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Lighthouse > 90

### Environment Ready

- [ ] `.env.local` configured with production values
- [ ] `DATABASE_URL` points to production DB
- [ ] `NEXT_PUBLIC_APP_URL` set correctly
- [ ] Secrets secured (not in git)

### Documentation Updated

- [ ] README has correct instructions
- [ ] DEPLOYMENT_GUIDE reviewed
- [ ] Known issues documented

---

## 🎯 Pass Criteria

**Minimum requirements to deploy**:

✅ Zero critical errors  
✅ All core features work  
✅ Production build successful  
✅ Performance acceptable (Lighthouse > 80)  
✅ Works on Chrome + one other browser  
✅ Responsive on mobile

**Nice to have**:

- Lighthouse > 90
- All browsers tested
- PWA installable
- All animations smooth

---

## 📊 Quick Test Results

```
Date: ___________
Tester: ___________

Smoke Test: PASS / FAIL
Full Test: PASS / FAIL
Build Test: PASS / FAIL

Issues Found: ___ (critical) ___ (minor)

Deploy: YES / NO / NEEDS WORK
```

---

**For detailed testing instructions, see `TESTING_GUIDE.md`**
