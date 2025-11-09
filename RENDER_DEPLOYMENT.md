# Render Deployment Guide / Render पर Deploy करने की Guide

## English Instructions

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Grant Render access to your repositories

### Step 3: Deploy on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure settings:
   - **Name**: chat-mode-app (or any name you like)
   - **Runtime**: Node
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

### Step 4: Add Environment Variables
In the "Environment" section, add these variables:

**Required:**
- `NODE_ENV` = `production`
- `GROQ_API_KEY` = (your GROQ API key)
- `MONGODB_URI` = (your MongoDB connection string)
- `SESSION_SECRET` = (any random 32+ character string)

**Optional (for email features):**
- `GMAIL_USER` = (your Gmail address)
- `GMAIL_APP_PASSWORD` = (your Gmail app password)

**Optional (if using PostgreSQL instead of MongoDB):**
- `DATABASE_URL` = (your PostgreSQL connection string)

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete (5-10 minutes)
3. Your app will be live at: `https://your-app-name.onrender.com`

---

## हिंदी निर्देश (Hindi Instructions)

### स्टेप 1: GitHub पर Push करें
1. GitHub पर नया repository बनाएं
2. अपना code push करें:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### स्टेप 2: Render Account बनाएं
1. https://render.com पर जाएं
2. अपने GitHub account से sign up करें
3. Render को अपनी repositories का access दें

### स्टेप 3: Render पर Deploy करें
1. "New +" → "Web Service" पर क्लिक करें
2. अपनी GitHub repository connect करें
3. Settings configure करें:
   - **Name**: chat-mode-app (या कोई भी नाम)
   - **Runtime**: Node
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

### स्टेप 4: Environment Variables Add करें
"Environment" section में ये variables add करें:

**ज़रूरी (Required):**
- `NODE_ENV` = `production`
- `GROQ_API_KEY` = (आपकी GROQ API key)
- `MONGODB_URI` = (आपकी MongoDB connection string)
- `SESSION_SECRET` = (कोई भी random 32+ character string)

**Optional (email features के लिए):**
- `GMAIL_USER` = (आपका Gmail address)
- `GMAIL_APP_PASSWORD` = (आपका Gmail app password)

**Optional (अगर PostgreSQL use कर रहे हैं):**
- `DATABASE_URL` = (आपकी PostgreSQL connection string)

### स्टेप 5: Deploy करें
1. "Create Web Service" पर क्लिक करें
2. Build complete होने तक wait करें (5-10 मिनट)
3. आपका app live होगा: `https://your-app-name.onrender.com`

---

## Important Notes / महत्वपूर्ण बातें

### Free Tier Limitations:
- App sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month of free runtime

### Free Tier की सीमाएं:
- 15 मिनट की inactivity के बाद app sleep हो जाता है
- Sleep के बाद पहली request को 30-60 सेकंड लगते हैं
- महीने में 750 घंटे का free runtime

### Tips / सुझाव:
- Use MongoDB Atlas Free Tier for database
- Database के लिए MongoDB Atlas का Free Tier use करें
- Keep your SESSION_SECRET safe and random
- अपनी SESSION_SECRET को safe और random रखें
- Monitor your app in Render dashboard
- Render dashboard में अपने app को monitor करें

## Troubleshooting / समस्या निवारण

**Build fails?**
- Check if all environment variables are set correctly
- Verify MongoDB/PostgreSQL connection strings
- सभी environment variables सही से set हैं verify करें
- MongoDB/PostgreSQL connection strings check करें

**App not starting?**
- Check logs in Render dashboard
- Ensure PORT environment variable is not set (Render sets it automatically)
- Render dashboard में logs check करें
- PORT environment variable set न करें (Render automatically set करता है)

**Database connection issues?**
- Whitelist 0.0.0.0/0 in MongoDB Atlas network access
- Check if DATABASE_URL or MONGODB_URI is correct
- MongoDB Atlas के network access में 0.0.0.0/0 whitelist करें
- DATABASE_URL या MONGODB_URI सही है check करें
