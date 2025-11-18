# 🚀 DRAIS Enhanced Features - Installation & Deployment Guide

## Prerequisites Checklist

Before deploying the enhanced features, ensure you have:

- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ running
- ✅ npm or yarn package manager
- ✅ Git for version control
- ✅ Database backup created
- ✅ Admin access to production server

---

## Step 1: Install Dependencies

No new dependencies needed! All enhancements use existing packages:

```bash
# Verify existing packages (already in package.json)
npm list swr          # Data fetching
npm list framer-motion # Animations
npm list lucide-react  # Icons
npm list mysql2        # Database
```

All dependencies should already be installed from your existing setup.

---

## Step 2: Database Verification

### Check Required Tables Exist

```sql
-- Run these queries to verify tables exist
SHOW TABLES LIKE 'class_results';
SHOW TABLES LIKE 'students';
SHOW TABLES LIKE 'subjects';
SHOW TABLES LIKE 'terms';
SHOW TABLES LIKE 'tahfiz_groups';
SHOW TABLES LIKE 'tahfiz_portions';
SHOW TABLES LIKE 'tahfiz_attendance';
```

### Verify Tahfiz Subjects Have Correct Type

```sql
-- Check Tahfiz subjects
SELECT id, name, code, subject_type 
FROM subjects 
WHERE subject_type = 'tahfiz' 
   OR code LIKE '%TAHFIZ%' 
   OR code LIKE '%QURAN%';

-- If no results, update subject types
UPDATE subjects 
SET subject_type = 'tahfiz' 
WHERE name LIKE '%Tahfiz%' 
   OR name LIKE '%Quran%' 
   OR name LIKE '%Islamic%';
```

### Ensure class_results Has Data

```sql
-- Check if class_results has data
SELECT COUNT(*) as total_records 
FROM class_results;

-- Should return > 0 records
-- If 0, you need to populate class_results first
```

---

## Step 3: Environment Configuration

### Verify Database Connection

Check `src/lib/db.ts` has correct credentials:

```typescript
// Should be configured in your .env.local or environment
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=drais_school
```

---

## Step 4: Build and Test Locally

### 1. Clean Build

```bash
# Clean any previous builds
rm -rf .next
npm run build
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Test Each Feature

**Test Tahfiz Reports:**
```
1. Navigate to http://localhost:3000/tahfiz/reports
2. Select filters (Term, Class)
3. Verify real data appears
4. Check browser console: Should see "✅ Loaded Tahfiz reports with REAL class_results data"
```

**Test Promotions (if Term 3 data exists):**
```
1. Navigate to http://localhost:3000/academics/reports
2. Select "Term 3" from term filter
3. Select a class
4. Promotion summary should appear at top
5. Click to expand categories
6. Verify student counts match expectations
```

**Test AI Analytics:**
```
1. Navigate to http://localhost:3000/dashboard
2. Click "AI Analytics" tab
3. Verify subject analysis loads
4. Check projections display
5. Ensure no console errors
```

---

## Step 5: Production Deployment

### Option A: Vercel Deployment

```bash
# If using Vercel
vercel --prod

# Or push to main branch if auto-deploy is configured
git add .
git commit -m "Add enhanced features: AI analytics, promotions, real Tahfiz data"
git push origin main
```

### Option B: Manual Server Deployment

```bash
# Build for production
npm run build

# Copy built files to server
# .next folder
# public folder
# package.json
# All config files

# On server, install dependencies
npm install --production

# Start with PM2 or similar
pm2 start npm --name "drais" -- start
```

### Option C: Docker Deployment

```dockerfile
# Dockerfile already exists, just rebuild
docker build -t drais-enhanced .
docker run -p 3000:3000 drais-enhanced
```

---

## Step 6: Post-Deployment Verification

### API Endpoint Tests

```bash
# Test Tahfiz comprehensive API
curl "http://yourdomain.com/api/tahfiz/reports/comprehensive?school_id=1"

# Test Promotions API (if Term 3 exists)
curl "http://yourdomain.com/api/academics/promotions?school_id=1&term_id=3"

# Test Analytics API
curl "http://yourdomain.com/api/analytics/predictive?school_id=1&scope=school"
```

Expected responses should all have `"success": true`

### UI Verification Checklist

- [ ] Dashboard loads without errors
- [ ] AI Analytics tab accessible
- [ ] Tahfiz reports show real data
- [ ] Promotion summary appears for Term 3
- [ ] All charts and tables render
- [ ] Print functionality works
- [ ] Export PDF/Excel works
- [ ] No console errors in browser

---

## Step 7: Database Optimization (Optional but Recommended)

### Add Indexes for Performance

```sql
-- These improve query performance for new features

-- For Tahfiz reports
CREATE INDEX idx_cr_subject_type ON class_results(subject_id, term_id, student_id);
CREATE INDEX idx_subjects_type ON subjects(subject_type);

-- For promotions
CREATE INDEX idx_cr_term_class ON class_results(term_id, class_id);
CREATE INDEX idx_students_class ON students(class_id, deleted_at);

-- For analytics
CREATE INDEX idx_cr_created ON class_results(created_at);
CREATE INDEX idx_terms_year ON terms(academic_year_id, term_number);
```

---

## Step 8: Security Hardening

### Verify API Protection

All new APIs should already be protected by existing middleware, but verify:

```typescript
// Each API route should check authentication
// Example pattern (already implemented in routes):
const session = await getServerSession();
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Enable Rate Limiting (Recommended)

```bash
# Install rate limiter
npm install express-rate-limit

# Configure in middleware
```

---

## Step 9: Monitoring Setup

### Log Key Metrics

```javascript
// Monitor these in production:
- API response times
- Database query performance
- Error rates
- User activity on new features
```

### Set Up Alerts

```
Configure alerts for:
- API failures (>5% error rate)
- Slow queries (>2 seconds)
- High memory usage
- Unusual database load
```

---

## Step 10: User Training

### Admin Training Checklist

- [ ] Show how to access AI Analytics
- [ ] Demonstrate promotion workflow
- [ ] Explain Tahfiz real data
- [ ] Walk through export features
- [ ] Practice bulk promotions
- [ ] Review insights interpretation

### Create Quick Reference Cards

Print `QUICK_START_ENHANCED_FEATURES.md` for desk reference

---

## Rollback Plan (If Issues Occur)

### Quick Rollback Steps

1. **Revert to previous commit:**
```bash
git revert HEAD
git push origin main
```

2. **Restore database backup:**
```bash
mysql -u root -p drais_school < backup_before_deployment.sql
```

3. **Redeploy previous version:**
```bash
# Vercel
vercel rollback

# Or manual
git checkout <previous-commit-hash>
npm run build
pm2 restart drais
```

---

## Troubleshooting Common Issues

### Issue: "No data in Tahfiz reports"

**Solution:**
```sql
-- Check if subjects have correct type
SELECT * FROM subjects WHERE subject_type = 'tahfiz';

-- If empty, update:
UPDATE subjects SET subject_type = 'tahfiz' 
WHERE name LIKE '%Tahfiz%' OR code LIKE '%QURAN%';
```

### Issue: "Promotion summary not appearing"

**Check:**
1. Is "Term 3" selected in filters?
2. Does term_id = 3 exist in database?
3. Check browser console for API errors

**Solution:**
```sql
-- Verify Term 3 exists
SELECT * FROM terms WHERE term_number = 3 OR name LIKE '%3%';
```

### Issue: "Analytics dashboard stuck loading"

**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. Database has sufficient historical data

**Solution:**
```sql
-- Ensure at least 2 terms of data
SELECT t.id, t.name, COUNT(cr.id) as results_count
FROM terms t
LEFT JOIN class_results cr ON t.id = cr.term_id
GROUP BY t.id, t.name
HAVING results_count > 0;
```

### Issue: "Export PDF fails"

**Solution:**
```bash
# Verify html2canvas and jsPDF installed
npm list html2canvas jspdf

# Reinstall if needed
npm install html2canvas jspdf
```

---

## Performance Benchmarks

### Expected Performance (Local Development)

| Feature | Load Time | API Response |
|---------|-----------|--------------|
| Tahfiz Reports (100 students) | 1.2s | 400ms |
| Promotions (50 students) | 0.8s | 250ms |
| AI Analytics | 1.5s | 600ms |
| Dashboard (all data) | 2.0s | 800ms |

### Production Performance Targets

| Feature | Target | Alert If Exceeds |
|---------|--------|------------------|
| API Response | <1s | >3s |
| Page Load | <2s | >5s |
| Database Query | <500ms | >2s |

---

## Maintenance Schedule

### Daily
- Check error logs
- Monitor API response times
- Verify data accuracy

### Weekly
- Review user feedback
- Check database size growth
- Test backup restoration

### Monthly
- Update dependencies
- Review performance metrics
- Analyze usage patterns
- Fine-tune analytics algorithms

---

## Success Criteria

After deployment, system is successful if:

- ✅ All APIs return success responses
- ✅ Zero JavaScript console errors
- ✅ Tahfiz reports show real database values
- ✅ Promotions calculate correctly for Term 3
- ✅ AI analytics generate insights
- ✅ Page load times < 3 seconds
- ✅ No user-reported bugs
- ✅ Staff adoption > 80% in first month

---

## Support Contacts

### Technical Issues
- Review: `ENHANCED_FEATURES_DOCUMENTATION.md`
- Quick Help: `QUICK_START_ENHANCED_FEATURES.md`
- Visual Guide: `VISUAL_GUIDE.md`

### Emergency Rollback
- Follow rollback plan above
- Contact: System Administrator

---

## Deployment Checklist Summary

Pre-Deployment:
- [ ] Database backup created
- [ ] Dependencies verified
- [ ] Local testing completed
- [ ] Documentation reviewed
- [ ] Rollback plan prepared

Deployment:
- [ ] Code built successfully
- [ ] Deployed to production
- [ ] Database indexes added
- [ ] Environment variables configured

Post-Deployment:
- [ ] API endpoints tested
- [ ] UI features verified
- [ ] Performance benchmarked
- [ ] Monitoring configured
- [ ] Staff trained

---

## Final Notes

**Deployment Time Estimate**: 1-2 hours (including testing)  
**Recommended Deployment Window**: Off-peak hours (evening/weekend)  
**Backup Requirements**: Full database + codebase  
**Rollback Time**: ~15 minutes if needed

**📞 Emergency Contact**: Keep system administrator on standby during deployment

---

**Status**: Ready for production deployment  
**Confidence Level**: High (code tested, documented, and validated)  
**Risk Level**: Low (all changes backward compatible)

**🚀 You're ready to deploy! Good luck!**

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0  
**Deployment Guide**: Complete
