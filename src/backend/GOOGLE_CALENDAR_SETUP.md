# Google Calendar Integration Setup

This guide will help you set up Google Calendar integration for your roommate management app, allowing you to sync events between your shared Google Calendar and the dashboard.

## 🔧 Prerequisites

1. **Google Cloud Console Account** - You'll need a Google account
2. **Flask Backend Running** - Make sure your roommate backend is running

## 📋 Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Name your project (e.g., "Roommate Calendar Integration")
4. Note your Project ID

### 2. Enable Google Calendar API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Calendar API"
3. Click on it and press **"Enable"**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for testing with roommates)
   - App name: **"Roommate Calendar"**
   - User support email: Your email
   - Scopes: Add `../auth/calendar` scope
   - Test users: Add Nick, Alex, and Landon's emails

4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **"Roommate Dashboard"**
   - Authorized redirect URIs: 
     ```
     http://localhost:5000/api/auth/google/callback
     ```

5. **Download the credentials JSON** or copy the Client ID and Client Secret

### 4. Configure Backend

Update your `roommate_app.py` file with your credentials:

```python
# Replace these with your actual credentials
GOOGLE_CLIENT_ID = 'your-actual-client-id.googleusercontent.com'
GOOGLE_CLIENT_SECRET = 'your-actual-client-secret'
```

### 5. Install Additional Dependencies

```bash
cd backend
pip install requests
```

### 6. Set Up Shared Google Calendar

1. **Create a new Google Calendar:**
   - Go to [Google Calendar](https://calendar.google.com/)
   - Click the "+" next to "Other calendars"
   - Select "Create new calendar"
   - Name: "Roommate House Calendar"
   - Share with Nick, Alex, and Landon with "Make changes to events" permission

2. **Get Calendar ID:**
   - Click on your new calendar settings
   - Scroll down to find the Calendar ID (looks like: `abc123@group.calendar.google.com`)
   - You can use this for specific calendar operations

## 🚀 How It Works

### **Two-Way Sync:**
1. **Dashboard → Google:** Events created in your roommate dashboard can be pushed to Google Calendar
2. **Google → Dashboard:** Events from your shared Google Calendar sync to the dashboard

### **Features:**
- ✅ **Multiple Calendar Views:** Day, Week, 2 Weeks, Month, Year
- ✅ **Real-time Sync:** Manual sync button or automatic periodic sync
- ✅ **Event Types:** Roommate events, Kepler care, chores, social events
- ✅ **Attendee Management:** Automatically invite roommates to events
- ✅ **Cross-Platform:** Works on all devices with calendar access

## 🎯 Usage Instructions

### **For Roommates:**

1. **First Time Setup:**
   - One person clicks "Connect Google" in the calendar
   - Authorizes the app with Google
   - All roommates get access to synced events

2. **Creating Events:**
   - **Option 1:** Create in dashboard → automatically syncs to Google Calendar
   - **Option 2:** Create in Google Calendar → click "Sync Google" in dashboard

3. **Event Types:**
   - **Roommate Event:** General house activities
   - **Kepler Care:** Dog walking, vet appointments, etc.
   - **Chore:** Cleaning schedules, maintenance
   - **Social:** Parties, gatherings, visitors

### **Sharing with Nick and Alex:**

When you create events in either location:
1. Add their emails as attendees
2. They'll receive Google Calendar invitations
3. Events appear on everyone's personal calendars
4. Dashboard shows unified view for all roommates

## 🔒 Security & Privacy

- **OAuth 2.0:** Secure Google authentication
- **Limited Scope:** Only calendar access, no other Google data
- **Local Storage:** Events cached locally for offline viewing
- **Revocable:** Can disconnect Google Calendar anytime

## 🛠 Troubleshooting

### **"Backend not connected" Error:**
```bash
cd backend
python roommate_app.py
```

### **"Google Calendar not connecting" Error:**
1. Check your Client ID and Secret in `roommate_app.py`
2. Verify redirect URI in Google Cloud Console
3. Make sure Google Calendar API is enabled

### **Events not syncing:**
1. Click the "Sync Google" button manually
2. Check internet connection
3. Verify calendar permissions in Google

### **Can't see roommate events:**
1. Make sure you're added as an attendee
2. Check the calendar sharing permissions
3. Verify you have the correct Google Calendar selected

## 📱 Mobile Access

- **Dashboard:** Access via browser on any device
- **Google Calendar:** Use official Google Calendar app
- **Notifications:** Get push notifications through Google Calendar app

## 🎉 Benefits

1. **Never Miss Events:** Get notifications on all devices
2. **Easy Scheduling:** See everyone's availability in one place
3. **Automatic Reminders:** Google Calendar handles notifications
4. **Backup & Sync:** Events saved in Google and locally
5. **Integration:** Works with all calendar apps that sync with Google

Now your roommate management app has professional-grade calendar integration! 📅✨