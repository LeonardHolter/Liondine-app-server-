# Deploy to Railway - Step by Step Guide

## 🚂 What is Railway?

Railway is a modern platform-as-a-service (PaaS) that makes it easy to deploy Node.js/Next.js applications. It's:
- ✅ Easy to use
- ✅ Free tier available ($5 credit/month)
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variables
- ✅ Custom domains
- ✅ Great for Next.js apps

---

## 📋 Prerequisites

Before you start:
- [ ] GitHub account
- [ ] Railway account (sign up at https://railway.app)
- [ ] Your OpenAI API key
- [ ] Code pushed to GitHub

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

#### 1.1 Create Railway Config (Optional but Recommended)

Create `railway.json` in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 1.2 Update package.json (Already Done ✅)

Your `package.json` already has the correct scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

Railway will automatically:
1. Run `npm install`
2. Run `npm run build`
3. Run `npm run start`

#### 1.3 Create .gitignore entries (Already Done ✅)

Your `.gitignore` already excludes:
- `.env` (environment secrets)
- `.cache/` (cache directory)
- `node_modules/`

---

### Step 2: Push to GitHub

If you haven't already:

```bash
# Initialize git (if not done)
cd /Users/leonardholter/code/liondine
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Lion Dine Menu API with caching"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/liondine-api.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy on Railway

#### 3.1 Create New Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `liondine-api` repository

#### 3.2 Configure Environment Variables

Railway will detect Next.js automatically. Now add your environment variable:

1. Go to your project on Railway
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"Add Variable"**
5. Add:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (your OpenAI API key)
6. Click **"Add"**

#### 3.3 Wait for Deployment

Railway will automatically:
1. ✅ Clone your repository
2. ✅ Detect Next.js
3. ✅ Run `npm install`
4. ✅ Run `npm run build`
5. ✅ Run `npm run start`
6. ✅ Deploy!

Watch the deployment logs in the Railway dashboard. Takes ~2-5 minutes.

---

### Step 4: Get Your Production URL

Once deployed:

1. Go to your project on Railway
2. Click on your service
3. Go to **"Settings"** tab
4. Under **"Domains"**, you'll see:
   - Generated domain: `your-app.up.railway.app`
   - Click **"Generate Domain"** if not shown

Your API is now live at:
```
https://your-app.up.railway.app
```

---

### Step 5: Test Your Deployment

#### Test the Home Page:
```bash
curl https://your-app.up.railway.app
```

#### Test the API:
```bash
curl "https://your-app.up.railway.app/api/menu?meal=breakfast"
```

Should take 20-30 seconds first time, then cached responses are instant!

#### Test Cache Stats:
```bash
curl https://your-app.up.railway.app/api/cache
```

---

## 🔧 Railway Configuration Details

### Automatic Detection

Railway automatically detects Next.js and configures:
- **Build Command:** `npm run build`
- **Start Command:** `npm run start`
- **Port:** Detected from Next.js (usually 3000)
- **Node Version:** Latest LTS

### Custom Configuration (Optional)

If you need custom settings, create `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
numReplicas = 1
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain:

1. Go to Railway project → Settings → Domains
2. Click **"Add Domain"**
3. Enter your domain: `api.liondine.com`
4. Add CNAME record to your DNS:
   - **Type:** CNAME
   - **Name:** `api` (or `@` for root)
   - **Value:** `your-app.up.railway.app`
5. Wait for DNS propagation (~5-60 minutes)

Your API will be available at: `https://api.liondine.com`

---

## 📱 Update iOS App with Production URL

### Update API Service:

```swift
class LionDineAPIService {
    #if DEBUG
    private let baseURL = "http://localhost:3000/api"
    #else
    private let baseURL = "https://your-app.up.railway.app/api"
    #endif
    
    // Or with custom domain:
    // private let baseURL = "https://api.liondine.com/api"
}
```

### Test from iOS:

```swift
// Should work from anywhere!
let url = URL(string: "https://your-app.up.railway.app/api/menu?meal=breakfast")!
```

---

## 💰 Pricing

### Railway Free Tier:
- **$5 credit per month** (trial)
- Covers ~500GB-hours of usage
- Perfect for development and low-traffic apps

### Estimated Usage:
- **Idle:** ~0.1 GB-hour
- **Light traffic:** ~5-10 GB-hours/month
- **Medium traffic:** ~20-50 GB-hours/month

### Cost Calculation:
```
Your API uses ~0.5GB RAM
Running 24/7 = 24 hours × 30 days × 0.5GB = 360 GB-hours
At $0.000231/GB-hour = ~$0.08/month
```

**With free tier:** First ~500 GB-hours free, so likely $0/month for low-medium traffic!

---

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub!

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push

# Railway automatically:
# 1. Detects push
# 2. Rebuilds
# 3. Deploys
# 4. Zero downtime!
```

Watch deployment in Railway dashboard.

---

## 📊 Monitoring

### View Logs:

1. Go to Railway dashboard
2. Click your service
3. Go to **"Deployments"** tab
4. Click latest deployment
5. View real-time logs

You'll see cache logs:
```
[Cache] MISS - No cache for breakfast
[Cache] STORED - Cached breakfast for today
[Cache] HIT - Returning cached breakfast
```

### Metrics:

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request counts

---

## 🐛 Troubleshooting

### Issue: "Application failed to respond"

**Solution:** Check environment variables are set correctly.

```bash
# In Railway dashboard → Variables
OPENAI_API_KEY=sk-proj-...
```

### Issue: Build fails

**Solution:** Check build logs in Railway dashboard.

Common fixes:
- Ensure `package.json` has correct scripts
- Check Node.js version compatibility
- Verify all dependencies in `package.json`

### Issue: API returns 500 error

**Solution:** Check deployment logs.

Common causes:
- Missing `OPENAI_API_KEY`
- OpenAI API rate limits
- Website scraping blocked

### Issue: Slow first request

**Expected behavior!** First request per meal per day takes 20-30 seconds to scrape and cache. Subsequent requests are instant.

### Issue: Cache not persisting

**Expected behavior!** In-memory cache is cleared on deployment. Consider upgrading to Redis (see below).

---

## 🚀 Production Optimizations

### 1. Add Redis for Persistent Cache

Railway offers Redis addon:

1. In Railway dashboard, click **"New"**
2. Select **"Database"** → **"Redis"**
3. Railway provides connection URL automatically
4. Update your code to use Redis

Install Redis:
```bash
npm install ioredis
```

Use the Redis cache instead:
```typescript
// lib/redis-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const redisCache = {
  async get(mealType: string): Promise<MenuData | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = `menu:${mealType}:${today}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  async set(mealType: string, data: MenuData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `menu:${mealType}:${today}`;
    await redis.set(key, JSON.stringify(data), 'EX', 86400); // 24 hours
  }
};
```

**Cost:** ~$5/month for Redis addon

### 2. Add Health Check Endpoint

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
```

Test: `https://your-app.up.railway.app/api/health`

### 3. Set Up Monitoring

Use Railway's built-in monitoring or integrate:
- Sentry for error tracking
- LogTail for log management
- Uptime Robot for availability monitoring

---

## 🔐 Security Best Practices

### 1. Environment Variables
✅ Already done - API key in environment, not in code

### 2. Rate Limiting (Optional)

Install rate limiting:
```bash
npm install @upstash/ratelimit @upstash/redis
```

Add to API route:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

// In API route:
const identifier = request.ip ?? "anonymous";
const { success } = await ratelimit.limit(identifier);

if (!success) {
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429 }
  );
}
```

### 3. CORS (If needed for web apps)

Already configured in Next.js, but you can customize:
```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed (in `.gitignore`)
- [ ] OpenAI API key ready
- [ ] Tested locally with `npm run build` and `npm run start`

During deployment:
- [ ] Created Railway project
- [ ] Connected GitHub repository
- [ ] Added `OPENAI_API_KEY` environment variable
- [ ] Watched deployment complete successfully

After deployment:
- [ ] Tested production URL
- [ ] Tested API endpoints
- [ ] Checked cache is working
- [ ] Updated iOS app with production URL
- [ ] Documented production URL for team

---

## 🎉 You're Live!

Your API is now:
- ✅ Deployed on Railway
- ✅ Accessible from anywhere
- ✅ Automatically deploying on git push
- ✅ Using environment variables
- ✅ Caching responses
- ✅ Production-ready!

**Next Steps:**
1. Share the API URL with your iOS developer
2. Test from the iOS app
3. Monitor usage in Railway dashboard
4. Add custom domain (optional)
5. Set up Redis for persistent cache (optional)

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## 🔗 Quick Links

After deployment:

- **Production API:** `https://your-app.up.railway.app`
- **API Endpoint:** `https://your-app.up.railway.app/api/menu?meal=breakfast`
- **Cache Stats:** `https://your-app.up.railway.app/api/cache`
- **Railway Dashboard:** https://railway.app/dashboard

---

## 💡 Pro Tips

1. **Watch Your Logs:** Railway logs show cache hits/misses
2. **Monitor Usage:** Check Railway dashboard for usage stats
3. **Use Redis:** For production, add Redis for persistent cache
4. **Custom Domain:** Looks more professional
5. **Set Up Alerts:** Railway can notify you of issues
6. **Version Control:** Tag releases in git for rollback capability

---

Good luck with your deployment! 🚀
