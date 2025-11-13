# Roommate Management Backend Setup

This Flask backend provides real data persistence and cross-device sync for your roommate management app.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   pip install flask flask-cors pillow
   ```

2. **Start the Backend**
   ```bash
   python roommate_app.py
   ```

3. **Verify Connection**
   - The backend runs on `http://localhost:5000`
   - Visit `http://localhost:5000/api/health` to check status
   - Your React app will show "Connected" status when working

## Features

### ✅ What Works Now
- **Notes Board**: Create, edit, delete, pin notes with reactions
- **Photo Gallery**: Upload, categorize, like, and manage photos  
- **Real-time sync**: All roommates see updates instantly
- **Cross-device**: Access from any device
- **Proper file storage**: Photos stored efficiently on server
- **Data persistence**: SQLite database with backups

### 🔄 API Endpoints

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note  
- `PUT /api/notes/<id>` - Update note
- `DELETE /api/notes/<id>` - Delete note
- `POST /api/notes/<id>/react` - Add emoji reaction

- `GET /api/photos` - Get all photos
- `POST /api/photos` - Upload photo
- `DELETE /api/photos/<id>` - Delete photo
- `POST /api/photos/<id>/like` - Toggle like

- `GET /api/health` - Health check
- `GET /api/export` - Export all data

## Database

SQLite database is automatically created at `roommate_management.db` with tables for:
- Notes with reactions and pinning
- Photos with metadata and likes  
- Chores with assignments and status
- Expenses with splitting logic
- Check-ins with mood tracking
- House rules and calendar events

## Next Steps

To connect more features:
1. Update ChoresAndCommunication.tsx to use `choresAPI` 
2. Update ExpenseTracker.tsx to use `expensesAPI`
3. Update WeeklyCheckins.tsx to use `checkinsAPI`

## Troubleshooting

**"Backend not connected" error:**
- Make sure Flask server is running on port 5000
- Check console for CORS or network errors
- Restart both frontend and backend

**Photo uploads not working:**
- Check `uploads/photos` directory exists
- Verify file permissions
- Check file size (50MB limit)

**Data not persisting:**
- Database file should be in backend directory
- Check SQLite permissions
- Verify no database locking issues