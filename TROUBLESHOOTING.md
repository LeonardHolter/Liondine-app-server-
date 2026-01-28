# 🔧 Troubleshooting Guide

Common issues and solutions for Lion Dine Menu API.

---

## 🚂 Railway Deployment Issues

### ❌ Build Error: "Failed to collect page data for /api/menu"

**Error Message:**
```
> Build error occurred
[Error: Failed to collect page data for /api/menu] { type: 'Error' }
"npm run build" did not complete successfully: exit code: 1
```

**Cause:**
Next.js is trying to statically generate your API routes during build time, but they contain dynamic code that should only run at request time.

**Solution: ✅ FIXED**
Added `export const dynamic = 'force-dynamic'` to all API routes to force runtime rendering.

**Files Updated:**
- `app/api/menu/route.ts`
- `app/api/cache/route.ts`
- `app/api/health/route.ts`
- `next.config.ts`

**Verify Fix:**
```bash
npm run build
# Should complete successfully
# API routes should show: ƒ (Dynamic)
```

---

### ❌ Environment Variable Not Set

**Error Message:**
```
Error: OpenAI API key not configured
```

**Cause:**
`OPENAI_API_KEY` environment variable is not set in Railway.

**Solution:**
1. Go to Railway dashboard
2. Click your service
3. Go to **Variables** tab
4. Add variable:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (your OpenAI API key)
5. Railway will automatically redeploy

**Verify:**
```bash
curl https://your-app.up.railway.app/api/health
# Should return: {"status":"ok",...}
```

---

### ❌ Deployment Timeout

**Error Message:**
```
Deployment timed out after 10 minutes
```

**Cause:**
Build or deployment taking too long, or process hanging.

**Solution:**
1. Check Railway logs for specific errors
2. Verify `package.json` scripts are correct:
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     }
   }
   ```
3. Try redeploying:
   - Railway dashboard → Deployments → Redeploy

---

### ❌ Application Crashed

**Error Message:**
```
Application failed to start
```

**Cause:**
Runtime error when starting the application.

**Solution:**
1. Check Railway logs for error details
2. Common issues:
   - Missing environment variables
   - Port binding issues (Railway sets PORT automatically)
   - Node version mismatch

**Fix:**
Railway automatically detects Next.js and sets the correct start command. If issues persist, add to `railway.json`:
```json
{
  "deploy": {
    "startCommand": "npm start"
  }
}
```

---

## 🌐 API Issues

### ❌ 500 Internal Server Error

**Error Response:**
```json
{
  "error": "Failed to process menu data",
  "details": "..."
}
```

**Possible Causes:**

#### 1. OpenAI API Key Invalid
```bash
# Test your key locally
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Solution:** Update key in Railway Variables

#### 2. OpenAI Rate Limit
**Error:** `Rate limit exceeded`

**Solution:**
- Wait a few minutes
- Upgrade OpenAI plan
- Check OpenAI usage dashboard

#### 3. Website Scraping Failed
**Error:** `Failed to retrieve menu data from website`

**Possible causes:**
- liondine.com is down
- Website blocking requests
- Network timeout

**Solution:**
- Check if https://liondine.com is accessible
- Wait and retry
- Check Railway logs for specific error

---

### ❌ Request Timeout

**Error:**
```
Request timed out after 30 seconds
```

**Cause:**
First request per meal takes 20-45 seconds (normal behavior).

**Not a Bug! This is Expected:**
- First request: Scrapes website + AI processing (20-45s)
- Subsequent requests: Instant from cache (<0.1s)

**Solutions:**
1. **Increase timeout in your client:**
   ```swift
   let configuration = URLSessionConfiguration.default
   configuration.timeoutIntervalForRequest = 60 // 60 seconds
   let session = URLSession(configuration: configuration)
   ```

2. **Pre-warm the cache:**
   ```bash
   # Make initial requests to cache all meals
   curl "https://your-app.up.railway.app/api/menu?meal=breakfast" &
   curl "https://your-app.up.railway.app/api/menu?meal=lunch" &
   curl "https://your-app.up.railway.app/api/menu?meal=dinner" &
   curl "https://your-app.up.railway.app/api/menu?meal=latenight" &
   ```

---

### ❌ Cache Not Working

**Symptom:**
Every request takes 20-45 seconds, no speedup.

**Check:**
```bash
curl https://your-app.up.railway.app/api/cache
```

**Should show:**
```json
{
  "cache": {
    "entries": 2,
    "keys": ["breakfast_2026-01-28", "lunch_2026-01-28"]
  }
}
```

**If cache is empty:**

#### Cause 1: Server Restarts
In-memory cache is cleared on deployment/restart.

**Solution:** Use Redis for persistent cache (see CACHING_GUIDE.md)

#### Cause 2: Cache Expired
Cache automatically expires after 24 hours.

**Expected behavior:** This is normal and intentional.

---

### ❌ CORS Errors (Web Apps)

**Error in browser:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
Add CORS headers to API routes:

```typescript
export async function GET(request: NextRequest) {
  const data = await fetchData();
  const response = NextResponse.json(data);
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}
```

---

## 💻 Local Development Issues

### ❌ Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

### ❌ Module Not Found

**Error:**
```
Module not found: Can't resolve '@/lib/...'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

### ❌ Build Works Locally But Fails on Railway

**Common causes:**

#### 1. Environment-Specific Code
Code that works locally but not in production environment.

**Solution:** Test production build locally:
```bash
npm run build
npm start
# Test at http://localhost:3000
```

#### 2. Missing Files in Git
Files exist locally but not committed.

**Solution:**
```bash
git status
git add .
git commit -m "Add missing files"
git push
```

#### 3. .gitignore Issues
Important files are ignored.

**Solution:** Check `.gitignore` doesn't exclude:
- `package.json`
- `package-lock.json`
- Source files
- Config files

Should exclude:
- `.env`
- `node_modules`
- `.cache`

---

## 📱 iOS Integration Issues

### ❌ Cannot Connect from Simulator

**Error:**
```
The Internet connection appears to be offline
```

**Solution:**
1. Use `localhost` not IP for simulator:
   ```swift
   private let baseURL = "http://localhost:3000/api"
   ```

2. Check API is running:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

### ❌ Cannot Connect from Physical Device

**Solution:**
1. Get your Mac's IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Example output: inet 192.168.1.100
   ```

2. Update iOS app:
   ```swift
   private let baseURL = "http://192.168.1.100:3000/api"
   ```

3. Ensure both on same WiFi network

4. Add to Info.plist:
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsLocalNetworking</key>
       <true/>
   </dict>
   ```

---

### ❌ JSON Decoding Failed

**Error:**
```swift
dataCorrupted(Swift.DecodingError.Context(...))
```

**Solution:**

1. **Print raw response:**
   ```swift
   let string = String(data: data, encoding: .utf8)
   print("Response:", string ?? "nil")
   ```

2. **Check API response format:**
   ```bash
   curl https://your-app.up.railway.app/api/menu?meal=breakfast | jq
   ```

3. **Verify Swift models match API:**
   - Check property names match
   - Check types match (String, Array, etc.)
   - Check optional vs required fields

---

## 🔍 Debugging Tools

### Check API Health
```bash
curl https://your-app.up.railway.app/api/health
```

### Check Cache Status
```bash
curl https://your-app.up.railway.app/api/cache | jq
```

### Test Specific Meal
```bash
curl "https://your-app.up.railway.app/api/menu?meal=breakfast" | jq
```

### Force Refresh (Bypass Cache)
```bash
curl "https://your-app.up.railway.app/api/menu?meal=breakfast&refresh=true"
```

### Clear Cache
```bash
curl -X DELETE https://your-app.up.railway.app/api/cache
```

### View Railway Logs
1. Go to Railway dashboard
2. Click your service
3. Go to Deployments tab
4. Click latest deployment
5. View real-time logs

---

## 🆘 Still Having Issues?

### 1. Check Railway Status
https://status.railway.app

### 2. Check OpenAI Status
https://status.openai.com

### 3. Check Lion Dine Website
https://liondine.com

### 4. View Logs
Railway dashboard → Deployments → Latest → Logs

Look for:
- Error messages
- Stack traces
- Cache logs: `[Cache] HIT` or `[Cache] MISS`

### 5. Test Local Build
```bash
npm run build
npm start
# Test at http://localhost:3000
```

### 6. Verify Environment
```bash
# Check Railway variables
railway variables
# Or in Railway dashboard → Variables tab
```

---

## 📋 Pre-Deployment Checklist

Before deploying or if issues occur:

- [ ] `npm run build` succeeds locally
- [ ] `.env` has valid `OPENAI_API_KEY`
- [ ] `.env` is in `.gitignore` (not committed)
- [ ] Railway has `OPENAI_API_KEY` set
- [ ] All files committed and pushed to GitHub
- [ ] API routes have `export const dynamic = 'force-dynamic'`
- [ ] `package.json` has correct scripts

---

## 📞 Get Help

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **OpenAI Docs:** https://platform.openai.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Remember:** Most "errors" are actually expected behavior:
- ✅ First request slow (20-45s) = Normal
- ✅ Subsequent requests fast = Cache working!
- ✅ Cache clears on restart = In-memory cache (upgrade to Redis for persistence)

Happy debugging! 🐛➡️✅
