# 🚀 Quick Start Guide - Roommate Management App

## ❌ Getting "Failed to fetch" Errors?

Your **Flask backend server** is not running! Here's how to fix it:

## 🔧 Step 1: Start the Backend Server

### Option A: Using the startup script (Recommended)
```bash
cd backend
python start_server.py
```

### Option B: Direct method
```bash
cd backend
pip install flask flask-cors pillow requests
python roommate_app.py
```

## ✅ Step 2: Verify It's Working

You should see output like this:
```
🏠 Starting Roommate Management Backend...
📋 Available endpoints:
  GET  /api/health - Health check
  GET  /api/notes - Get all notes
  ...
🌐 Frontend should connect to: http://localhost:5000/api
 * Running on http://0.0.0.0:5000
```

## 🌐 Step 3: Check Your Web App

1. **Refresh your browser** where the roommate app is running
2. Look for the **green "Connected"** status in the top-right corner
3. If you still see **red "Offline"**, click it to retry the connection

## 🔍 Still Having Issues?

### Quick Health Check
Run this to check if everything is working:
```bash
python check_backend.py
```

### Common Issues:

**Port 5000 already in use?**
```bash
# Kill any existing processes on port 5000
lsof -ti:5000 | xargs kill -9
# Then restart the backend
cd backend && python start_server.py
```

**Missing dependencies?**
```bash
cd backend
pip install flask flask-cors pillow requests
```

**Windows users:**
- Use `python` instead of `python3`
- Make sure you're in the correct directory

## 📱 What You Should See

### ✅ When Working:
- Green **"Connected"** button in the dashboard
- Notes load properly
- Photos can be uploaded
- All features work normally

### ❌ When Broken:
- Red **"Offline"** button
- Error messages like "Failed to fetch"
- Components show loading states indefinitely

## 🏗 Development Setup

### Terminal 1 (Backend):
```bash
cd backend
python start_server.py
```

### Terminal 2 (Frontend):
```bash
# Your frontend development server
# (varies by setup - Vite, Create React App, etc.)
npm run dev
# OR
npm start
```

## 🔄 Daily Usage

1. **Start Backend:** `cd backend && python start_server.py`
2. **Open Frontend:** Go to your web app URL
3. **Verify Connection:** Look for green "Connected" status
4. **Start Managing:** Add notes, photos, chores, etc!

---

## 🆘 Need Help?

If you're still having issues:

1. **Check the backend terminal** for error messages
2. **Open browser console** (F12) and look for errors
3. **Try the health check script:** `python check_backend.py`
4. **Restart everything** (backend first, then refresh frontend)

**The app is designed to work offline with mock data, but for full functionality (data persistence, photos, etc.), you need the backend running!** 🏠✨