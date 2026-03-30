# Deployment Guide for Holloween Project

## Overview

Your Next.js project needs these preparation steps before deployment. This guide covers everything a beginner needs.

---

## Step 1: Set Up Environment Variables

### Create `.env.local` (for local development)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001
ADMIN_TOKEN=your_admin_token_here
```

### Create `.env.production` (for production deployment)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
API_BASE_URL=https://your-api-domain.com
ADMIN_TOKEN=your_production_admin_token_here
```

### Key Points:

- `NEXT_PUBLIC_*` = visible in browser (safe, non-secret data only)
- Other variables = server-only (secret tokens, private keys)
- Never commit `.env.local` or `.env.production` — add to `.gitignore` (already done)

**❓ Where to get these values?**

- `API_BASE_URL`: Your backend server URL (e.g., `api.yourdomain.com` or AWS/Vercel hosted API)
- `ADMIN_TOKEN`: Secret token from your backend for authentication

---

## Step 2: Test the Build Locally

Run this command to test if your app builds correctly:

```bash
pnpm build
```

**What to watch for:**

- ❌ Errors with red text = Fix before deploying
- ✅ "Ready" message = Good to deploy!

---

## Step 3: Choose a Deployment Platform

### **Option A: Vercel (Easiest for Next.js) ⭐ RECOMMENDED**

**Why?** Made by Next.js creators, zero-config deployment.

1. Go to [vercel.com](https://vercel.com) and sign up (free tier available)
2. Click "New Project" → Connect GitHub/GitLab
3. Select your `holloween` repository
4. **Environment Variables:**
   - Click "Environment Variables"
   - Add each variable from your `.env.production`
   - Select "Production" environment
5. Click "Deploy"
6. Your site is live! (Vercel gives you a free `.vercel.app` domain)

**Pros:**

- Free
- Automatic deployments on every push
- Built-in analytics & monitoring
- Custom domain support

**Cost for upgrade:** ~$50/month for serious projects

---

### **Option B: AWS Amplify**

1. Go to [aws.amazon.com/amplify](https://aws.amazon.com/amplify)
2. Click "Create App" → Connect Git
3. Follow the setup wizard
4. Add environment variables in the console
5. Deploy

**Pros:** Scalable, enterprise-grade

**Cons:** More complex, potential costs

---

### **Option C: Heroku (Deprecated but simpler alternative exists)**

Consider **Railway.app** or **Render.com** as modern Heroku alternatives.

---

## Step 4: Database/Backend Setup

**⚠️ Important:** Your app needs a backend server running!

Your API client looks for:

```
NEXT_PUBLIC_API_BASE_URL = https://your-api-domain.com
```

**You need to:**

1. Deploy your backend API separately (not part of this Next.js app)
2. Get the URL (e.g., `https://api.yourdomain.com`)
3. Add it to environment variables

**Where is your backend code?**

- If you have backend in separate repo → deploy it first
- If you have API routes in `app/api/` → they'll deploy with this app

---

## Step 5: Pre-Deployment Checklist

Before hitting deploy, verify:

```
✅ `.env.production` created with correct values
✅ `pnpm build` runs without errors
✅ Backend API URL is reachable
✅ ADMIN_TOKEN is kept secret (not in code)
✅ Images optimized (you're using Leaflet maps - good!)
✅ No console errors when you run: pnpm build && pnpm start
```

---

## Step 6: Deploy!

### **If using Vercel (recommended):**

1. Push your code to GitHub
2. Vercel automatically deploys
3. Check the deployment at `your-project.vercel.app`

### **If using other platforms:**

- Follow their specific instructions
- Usually involves connecting GitHub + selecting branch to deploy from

---

## Step 7: After Deployment (Post-Launch)

1. **Test your live site:**
   - Visit your domain
   - Try creating a house
   - Check map functionality
   - Verify language switcher works (EN/NL)

2. **Monitor for errors:**
   - Vercel/AWS provide error logging
   - Check browser console (F12) for issues
   - Check your backend logs

3. **Set up custom domain (Optional):**
   - Point your domain to Vercel/AWS
   - Add SSL certificate (automatic with Vercel)

---

## Common Issues & Fixes

### ❌ "Cannot find module" after deployment

→ Run `pnpm install` before build

### ❌ "API calls failing" after deployment

→ Check environment variables are set correctly in production

### ❌ "Font not loading" or "Map not showing"

→ Clear browser cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+F5)

### ❌ "Build fails with error X"

→ Check error message and fix locally first, then re-deploy

---

## Quick Start Summary

```bash
# 1. Create .env.production file with your API URL and token

# 2. Test build locally
pnpm build

# 3. Test production locally
pnpm start

# 4. Push to GitHub

# 5. Go to Vercel.com → Create Project → Select your repo

# 6. Add environment variables in Vercel dashboard

# 7. Click Deploy

# 8. Share your live URL!
```

---

## Need Help?

- **Vercel deployment docs:** https://vercel.com/docs
- **Next.js deployment:** https://nextjs.org/docs/deployment
- **Environment variables in Next.js:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

**You've got this! Start with Vercel—it's the easiest path forward.** 🚀
