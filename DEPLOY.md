# 🚀 Quick Deploy Guide

## One-Command Deploy to Railway

### Prerequisites
- GitHub account
- Railway account (https://railway.app - sign up free)
- OpenAI API key

---

## Step 1: Push to GitHub

If you haven't already pushed to GitHub:

```bash
# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Lion Dine Menu API"

# Create a new repository on GitHub (https://github.com/new)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/liondine-api.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Railway

### Option A: One-Click Deploy (Easiest)

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your `liondine-api` repository
5. Railway automatically detects Next.js and deploys!

### Option B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to new project
railway init

# Add environment variable
railway variables set OPENAI_API_KEY=your_key_here

# Deploy
railway up
```

---

## Step 3: Configure Environment Variables

In Railway dashboard:

1. Click your project
2. Go to **Variables** tab
3. Add variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (your OpenAI API key)
4. Save

Railway will automatically redeploy with the new variable.

---

## Step 4: Get Your URL

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Your URL: `https://your-app.up.railway.app`

---

## Step 5: Test It!

```bash
# Test health check
curl https://your-app.up.railway.app/api/health

# Test API
curl "https://your-app.up.railway.app/api/menu?meal=breakfast"

# Check cache
curl https://your-app.up.railway.app/api/cache
```

---

## Step 6: Update iOS App

Update your iOS app's base URL:

```swift
// Change from:
private let baseURL = "http://localhost:3000/api"

// To:
private let baseURL = "https://your-app.up.railway.app/api"
```

---

## 🎉 Done!

Your API is now:
- ✅ Live on Railway
- ✅ Automatically deploying on git push
- ✅ Using environment variables
- ✅ Production-ready!

---

## 📱 Share with iOS Developer

Send them:
1. **API URL:** `https://your-app.up.railway.app`
2. **Documentation:** The `FOR_IOS_DEVELOPER.md` file
3. **Quick reference:** The `QUICK_REFERENCE.md` file

---

## 🔄 Future Updates

To deploy updates:

```bash
# Make changes
git add .
git commit -m "Your update message"
git push

# Railway automatically redeploys!
```

---

## 💡 Pro Tips

1. **Custom Domain:** Add in Railway Settings → Domains
2. **Monitor Logs:** Railway dashboard shows real-time logs
3. **Usage Stats:** Check Railway dashboard for usage/costs
4. **Redis Cache:** Add Redis database in Railway for persistent cache
5. **Rate Limiting:** Consider adding if traffic grows

---

## 🆘 Troubleshooting

### Deployment fails?
- Check build logs in Railway dashboard
- Verify `package.json` has correct scripts
- Ensure all dependencies are listed

### API returns 500?
- Check environment variable `OPENAI_API_KEY` is set
- View deployment logs for errors
- Test OpenAI API key is valid

### Slow responses?
- First request per meal per day takes 20-30s (normal!)
- Subsequent requests are instant (cached)
- Check cache with `/api/cache` endpoint

---

**Need more details?** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for comprehensive guide!
