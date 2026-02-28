# FRONTEND LOCAL TESTING - QUICK START REFERENCE

**Status:** 🟢 Ready for Testing
**Date:** 2026-02-28
**Frontend Version:** 7.0.0
**Next Step:** Copy files → Install → Test locally

---

## ⚡ 5-MINUTE SETUP

### Step 1: Create Frontend Directory & Copy Files
```bash
cd /workspaces/eka-ai-Auto-Intelligence-

# Create frontend directory with src folder
mkdir -p frontend/src

# Copy all frontend files from repo root to frontend directory
cp frontend-package.json frontend/package.json
cp frontend-index.html frontend/index.html
cp src-app.jsx frontend/src/App.jsx
cp frontend-tsconfig.json frontend/tsconfig.json
cp frontend-vite.config.js frontend/vite.config.js
cp frontend-.env.example frontend/.env.local
```

### Step 2: Install Dependencies (2 minutes)
```bash
cd frontend
npm install
```

Expected output: Shows installation of React, Vite, Tailwind CSS, Axios, Recharts, and 20+ other dependencies

### Step 3: Start Development Server (30 seconds)
```bash
npm run dev
```

Expected output:
```
✨ Built in 450ms
VITE v5.0.0  ready in 450 ms
➜  Local:   http://localhost:3000
➜  Press h for help
```

### Step 4: Open in Browser
Navigate to: **http://localhost:3000**

### Step 5: Login with Test Credentials
```
Email:    admin@eka-ai.com
Password: admin123
```

Expected: Dashboard loads with KPI cards showing real data

---

## ✅ 10-POINT VERIFICATION TEST

### 1. Authentication ✅
- [ ] Login page loads
- [ ] Can login with test credentials
- [ ] Token saved in localStorage (F12 → Application → localStorage → access_token)
- [ ] Dashboard appears after login
- [ ] Logout works
- [ ] Returns to login page after logout

### 2. Navigation ✅
- [ ] Sidebar shows all 7 pages
- [ ] Can click pages to navigate
- [ ] Active page highlighted
- [ ] Menu collapses/expands
- [ ] User profile section visible

### 3. Dashboard ✅
- [ ] Shows 4 KPI cards (Jobs, Revenue, Vehicles, Approvals)
- [ ] Displays revenue trend chart
- [ ] Data loads correctly
- [ ] Numbers are not zeros

### 4. Vehicles ✅
- [ ] Can view list of vehicles
- [ ] Add button works (opens modal)
- [ ] Can fill vehicle form including VARIANT field
- [ ] Can submit and see success message
- [ ] New vehicle appears in list
- [ ] Edit button works
- [ ] Delete button works

### 5. Job Cards ✅
- [ ] Can view all job cards
- [ ] Can create new job
- [ ] State transitions work (OPEN → DIAGNOSIS → etc.)
- [ ] All 11 states available
- [ ] Job statuses display correctly

### 6. Invoices ✅
- [ ] Can view invoice list
- [ ] Shows summary cards (Pending, Approved, Paid)
- [ ] Can view invoice details
- [ ] PDF download button is visible

### 7. Insurance (MG Engine) ✅
- [ ] Form loads with all fields
- [ ] VARIANT field is visible and working
- [ ] Can fill vehicle details
- [ ] Calculate button works
- [ ] Shows premium amount
- [ ] Breakdown chart appears

### 8. Chat ✅
- [ ] Message input visible
- [ ] Can type and send message
- [ ] Response appears
- [ ] Message history displays

### 9. UI Responsiveness ✅
- [ ] Desktop (1920px): Full layout works
- [ ] Tablet (768px): Sidebar collapses, content adapts
- [ ] Mobile (375px): Single column, touch-friendly

### 10. Error Handling ✅
- [ ] Stop backend, try to load data
- [ ] Should show error message (not crash)
- [ ] Restart backend
- [ ] Data loads successfully again

---

## 🔍 IN BROWSER DEVELOPER TOOLS

### Check Network Traffic (F12 → Network tab)
1. Try logging in
2. Look for: POST /api/v1/auth/login
3. Response should have: `access_token`, `refresh_token`
4. Headers should show: `Authorization: Bearer <token>`

### Check Console (F12 → Console tab)
- Should be clean (no red errors)
- Warnings about PropTypes are OK
- Look for any API errors (red text)

### Check Storage (F12 → Application → localStorage)
- Should see: `access_token`
- Should see: `refresh_token`
- Should see: `user` (JSON object)

---

## 🧪 DETAILED TESTING PROCEDURE

### Test Vehicles CRUD (5 minutes)
```
1. Click "Vehicles" in sidebar
2. Click "Add Vehicle"
3. Fill form:
   Plate: KA-01-TEST-001
   Make: Maruti
   Model: Swift
   Variant: VXI (IMPORTANT - BRD requirement)
   Year: 2020
   Fuel: Petrol
   Owner: Test Owner
   VIN: ABC123DEF456
   Monthly KM: 1500
4. Click "Create"
5. Success message should appear
6. New vehicle should appear in list
7. Click "Edit" on vehicle, verify fields
8. Click "Delete", confirm deletion
Result: ✓ CRUD operations work
```

### Test Job Card Workflow (5 minutes)
```
1. Click "Job Cards" in sidebar
2. Click "New Job"
3. Select vehicle from dropdown
4. Fill form:
   Complaint: Test brake issue
   Priority: High
   Expected Completion: (next day)
   Assigned Mechanic: Test Mechanic
5. Click "Create"
6. Job appears in list with number
7. Click "View" on job
8. Click state transition button
9. Select next state from dropdown
10. Transition completes
11. Repeat steps 8-10 for multiple states
Result: ✓ FSM state machine works
```

### Test Insurance Calculation (3 minutes)
```
1. Click "Insurance" in sidebar
2. Fill form:
   Make: Tata
   Model: Nexon
   Variant: XZA+ (IMPORTANT)
   Year: 2021
   Fuel: Diesel
   City: Mumbai
   Monthly KM: 2500
   Warranty: Out of Warranty
   Usage: Commercial
3. Click "Calculate"
4. Should show:
   - Annual premium (e.g., ₹15,000)
   - Monthly premium (e.g., ₹1,250)
   - Cost breakdown
   - Pie chart
Result: ✓ MG Engine calculation works
```

---

## 📊 SUCCESS CRITERIA

**Frontend is working correctly when:**
- ✅ All 10 verification tests pass
- ✅ No red errors in console
- ✅ API calls show 200/201 responses
- ✅ Token appears in localStorage
- ✅ All pages load without crashing
- ✅ Forms submit successfully
- ✅ Charts and tables display data
- ✅ Responsive design responsive on all screen sizes

**Expected Result: 150/150 tests pass (100%)**

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "Cannot find module 'react'"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
npm run dev
```

### Issue: "CORS error" or "API unreachable"
```
Check: Is backend API running on http://localhost:8000?
Run: python -m uvicorn app.main:app --reload
Or check: .env.local has REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Issue: "401 Unauthorized"
```
Check: localStorage has access_token
Token might be expired - clear localStorage and login again
```

### Issue: "Blank page"
```
Check: Browser console (F12) for errors
Check: Network tab to see if index.html loads
Try: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

---

## 🎯 NEXT STEPS AFTER TESTING

### When All Tests Pass ✅
1. Share results with project team
2. Provide confirmation that frontend is ready
3. Decision point: Deploy to staging or production

### Testing Against Staging API ⏳
After local testing confirms all features work:
1. Update `.env.local`: `REACT_APP_API_URL=http://staging-api.eka-ai.com/api/v1`
2. Restart dev server: `npm run dev`
3. Repeat all 10-point verification tests
4. Confirm data flows correctly from staging backend

### Final Production Deployment ⏳
See: `FRONTEND_SETUP_DEPLOYMENT_GUIDE.md` for 4 deployment options:
- Option 1: Vercel (Recommended)
- Option 2: Netlify
- Option 3: Docker
- Option 4: AWS S3 + CloudFront

---

## 📞 TROUBLESHOOTING

### Port 3000 Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

### Module Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall everything
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Try building for production
npm run build

# Check for any warnings/errors
```

---

## ✨ SUMMARY

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Copy files to frontend/ | 1 min | 📋 instruction |
| 2 | npm install | 2 min | 📋 instruction |
| 3 | npm run dev | 1 min | 📋 instruction |
| 4 | Open localhost:3000 | <1 min | 📋 instruction |
| 5 | Run 10-point verification | 10 min | 📋 instruction |
| 6 | Test against staging API | 5 min | ⏳ next |
| 7 | Report results | <1 min | ⏳ next |
| 8 | Deploy to production | 10-20 min | ⏳ after approval |

**Total Time:** ~30 minutes from start to verification complete

---

## 🎉 FINAL STATUS

Frontend application is **READY FOR TESTING**.

All files are committed to GitHub at:
```
https://github.com/tanmayug24-alt/eka-ai-Auto-Intelligence-.git
```

Follow the 5-minute setup above to begin testing.

---

**Status:** 🟢 Ready to test
**Next:** User performs local testing
**Then:** Report results and proceed to deployment
**Timeline:** 30 minutes for local testing + approval = ready for production

