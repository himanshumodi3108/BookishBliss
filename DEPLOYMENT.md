# Deployment Guide

This guide will help you deploy Bookish Bliss to Vercel (Frontend) and Render (Backend).

## Prerequisites

- GitHub account
- Vercel account
- Render account
- MongoDB Atlas account (or MongoDB instance)
- Firebase project (for authentication)

## Backend Deployment (Render)

### 1. Prepare Backend

1. Push your code to GitHub
2. In Render dashboard, create a new **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `bookishbliss` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node index.js`
   - **Root Directory**: Leave empty (or set to `server` if needed)

### 2. Environment Variables (Render)

Add these environment variables in Render dashboard:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=10000
FRONTEND_URL=https://bookish-bliss-six.vercel.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
ADMIN_EMAILS=admin1@example.com,admin2@example.com
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CHANNEL_ID=WEB
PAYTM_INDUSTRY_TYPE_ID=Retail
PAYTM_ENABLE=false
```

**Important Notes:**
- `FRONTEND_URL` should be your Vercel deployment URL
- `FIREBASE_SERVICE_ACCOUNT` should be the entire JSON as a string (escape quotes properly)
- Render automatically assigns a port, but you can set `PORT=10000` or use `process.env.PORT`

### 3. Create `.env` file in `server/` directory

```env
FRONTEND_URL=https://bookish-bliss-six.vercel.app
```

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

1. Push your code to GitHub
2. In Vercel dashboard, click **Add New Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2. Environment Variables (Vercel)

Add these environment variables in Vercel dashboard:

```env
VITE_API_URL=https://bookishbliss.onrender.com
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important Notes:**
- All Vite environment variables must start with `VITE_`
- `VITE_API_URL` should be your Render backend URL
- After adding environment variables, redeploy the application

### 3. Create `.env` file in `client/` directory

```env
VITE_API_URL=https://bookishbliss.onrender.com
```

## Local Development Setup

### Backend (`server/.env`)

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Vercel URL
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working
- [ ] Firebase authentication is working
- [ ] Admin emails are configured
- [ ] Payment gateway (if enabled) is configured
- [ ] File uploads are working (check Render file system limitations)

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check that CORS origins include your Vercel URL
- Verify credentials are enabled in CORS config

### API Connection Issues
- Verify `VITE_API_URL` in frontend matches your Render URL
- Check that backend is running and accessible
- Ensure no trailing slashes in URLs

### Environment Variables Not Working
- In Vercel: Variables must start with `VITE_` to be accessible in client
- In Render: Restart the service after adding environment variables
- Clear browser cache and rebuild frontend

### File Upload Issues
- Render has ephemeral file system - files are lost on restart
- Consider using cloud storage (AWS S3, Cloudinary) for production
- Update multer configuration to use cloud storage

## Notes

- Render free tier spins down after inactivity - first request may be slow
- Vercel has generous free tier for frontend hosting
- Consider using MongoDB Atlas for database hosting
- For production, use proper cloud storage for file uploads

