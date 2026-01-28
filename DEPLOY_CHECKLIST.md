# 🚀 Railway Deployment Checklist

Use this checklist to deploy your Lion Dine Menu API to Railway.

---

## ✅ Pre-Deployment Checklist

### Local Setup
- [ ] Code is working locally (`npm run dev`)
- [ ] `.env` file exists with valid `OPENAI_API_KEY`
- [ ] Tested API endpoints locally
- [ ] Production build works (`npm run build && npm start`)
- [ ] All dependencies installed (`npm install`)

### Files to Verify
- [ ] `.gitignore` includes `.env` and `.cache/`
- [ ] `package.json` has correct scripts
- [ ] `railway.json` exists (optional but recommended)
- [ ] `.railwayignore` exists (optional)

---

## 📦 Step 1: Prepare Git Repository

### Option A: Use Setup Script (Easiest)
```bash
./setup-and-deploy.sh
```

### Option B: Manual Setup
```bash
# Initialize git (if not done)
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Lion Dine Menu API"
```

**Checklist:**
- [ ] Git initialized
- [ ] Files committed
- [ ] `.env` NOT committed (should be in .gitignore)

---

## 🐙 Step 2: Push to GitHub

1. **Create GitHub Repository:**
   - [ ] Go to https://github.com/new
   - [ ] Name: `liondine-api` (or your choice)
   - [ ] Public or Private
   - [ ] DO NOT add README, .gitignore, or license

2. **Connect and Push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/liondine-api.git
   git branch -M main
   git push -u origin main
   ```

**Checklist:**
- [ ] Repository created on GitHub
- [ ] Code pushed successfully
- [ ] Can see files on GitHub
- [ ] `.env` is NOT visible on GitHub

---

## 🚂 Step 3: Deploy on Railway

### 3.1 Create Project
- [ ] Go to https://railway.app
- [ ] Sign up / Log in (free account)
- [ ] Click **"New Project"**
- [ ] Select **"Deploy from GitHub repo"**
- [ ] Authorize Railway to access GitHub
- [ ] Select your `liondine-api` repository

### 3.2 Configure Environment Variables
- [ ] Click your service in Railway
- [ ] Go to **"Variables"** tab
- [ ] Click **"Add Variable"**
- [ ] Add: `OPENAI_API_KEY` = `sk-proj-...`
- [ ] Click **"Add"**

### 3.3 Watch Deployment
- [ ] Go to **"Deployments"** tab
- [ ] Watch build logs
- [ ] Wait for "Deploy successful" (2-5 minutes)

### 3.4 Get Your Domain
- [ ] Go to **"Settings"** tab
- [ ] Scroll to **"Domains"**
- [ ] Click **"Generate Domain"**
- [ ] Copy URL: `https://your-app.up.railway.app`

**Checklist:**
- [ ] Deployment succeeded
- [ ] No errors in logs
- [ ] Domain generated

---

## 🧪 Step 4: Test Deployment

Run these tests:

### Health Check
```bash
curl https://your-app.up.railway.app/api/health
```
- [ ] Returns status: "ok"

### API Test
```bash
curl "https://your-app.up.railway.app/api/menu?meal=breakfast"
```
- [ ] Takes 20-40 seconds (first time)
- [ ] Returns valid JSON
- [ ] Has diningHalls array

### Cache Test (Second Request)
```bash
curl "https://your-app.up.railway.app/api/menu?meal=breakfast"
```
- [ ] Takes ~0.1 seconds (instant!)
- [ ] Returns same data

### Cache Stats
```bash
curl https://your-app.up.railway.app/api/cache
```
- [ ] Shows cached entries

**All tests passed?**
- [ ] Yes! ✅ Continue to Step 5
- [ ] No? Check troubleshooting below

---

## 📱 Step 5: Update iOS App

Update your iOS developer:

### 5.1 Share Information
- [ ] Production URL: `https://your-app.up.railway.app`
- [ ] Documentation files (FOR_IOS_DEVELOPER.md, etc.)
- [ ] Confirm API is working

### 5.2 Code Update Needed
iOS app needs to update base URL:

```swift
#if DEBUG
private let baseURL = "http://localhost:3000/api"
#else
private let baseURL = "https://your-app.up.railway.app/api"
#endif
```

**Checklist:**
- [ ] Shared production URL
- [ ] iOS developer updated code
- [ ] Tested from iOS app

---

## 📊 Step 6: Monitor

### In Railway Dashboard:
- [ ] Check **Deployments** tab for logs
- [ ] Check **Metrics** tab for usage
- [ ] Check **Variables** tab for config

### Look for in Logs:
```
[Cache] MISS - No cache for breakfast
[Cache] STORED - Cached breakfast for today
[Cache] HIT - Returning cached breakfast
```

**Checklist:**
- [ ] Can see logs
- [ ] Cache is working (HIT/MISS logs)
- [ ] No error messages

---

## 🔄 Step 7: Future Updates

For updates:
```bash
# Make changes
git add .
git commit -m "Your update message"
git push

# Railway automatically redeploys!
```

**Checklist:**
- [ ] Know how to deploy updates
- [ ] Tested git push triggers redeployment

---

## ✅ Final Checklist

- [ ] API deployed to Railway
- [ ] Environment variables configured
- [ ] All endpoints tested and working
- [ ] Cache system functioning
- [ ] Production URL documented
- [ ] iOS app updated with production URL
- [ ] Team notified of deployment
- [ ] Monitoring set up

---

## 🆘 Troubleshooting

### Issue: Build Fails
- **Check:** Railway deployment logs
- **Fix:** Ensure `package.json` has correct scripts
- **Fix:** Verify all dependencies are installed

### Issue: API Returns 500
- **Check:** Environment variable `OPENAI_API_KEY` is set
- **Check:** OpenAI API key is valid
- **Fix:** View logs for specific error message

### Issue: Cannot Connect to Railway
- **Check:** Domain is generated
- **Check:** Deployment is complete (not building)
- **Fix:** Wait for deployment to finish

### Issue: Slow Responses
- **Expected:** First request per meal takes 20-40s
- **Expected:** Subsequent requests are instant (cached)
- **Check:** Cache stats with `/api/cache` endpoint

### Issue: Cache Not Working
- **Check:** Logs show `[Cache] HIT` messages
- **Fix:** Restart deployment in Railway
- **Consider:** Upgrade to Redis for persistent cache

---

## 📚 Additional Resources

- Full guide: **RAILWAY_DEPLOYMENT.md**
- Quick guide: **DEPLOY.md**
- iOS integration: **FOR_IOS_DEVELOPER.md**
- How it works: **HOW_IT_WORKS.md**
- Caching guide: **CACHING_GUIDE.md**

---

## 🎉 Success!

If all checkboxes are checked, congratulations! Your API is:
- ✅ Deployed to Railway
- ✅ Accessible from anywhere
- ✅ Automatically deploying on updates
- ✅ Using smart caching
- ✅ Production-ready!

**What you achieved:**
- Built a full-stack API
- Integrated AI (OpenAI GPT-4o)
- Implemented web scraping
- Added intelligent caching
- Deployed to production
- Made it accessible to your iOS app

🦁 **Lion Dine Menu API is live!** 🚀
