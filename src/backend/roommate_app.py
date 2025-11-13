"""
Roommate Management App Backend - Flask Application
A comprehensive backend for managing roommate life including notes, photos, chores, expenses, and more.
"""

from flask import Flask, request, jsonify, send_file, session, redirect, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import json
from datetime import datetime, timedelta
import sqlite3
import io
import base64
from PIL import Image
import requests
from urllib.parse import urlencode

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, origins=["*"], supports_credentials=True)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads/photos'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['DATABASE'] = 'roommate_management.db'
app.config['SECRET_KEY'] = 'your-secret-key-change-this'  # Change this in production

# Google Calendar Configuration
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID = 'your-google-client-id'  # Replace with your actual client ID
GOOGLE_CLIENT_SECRET = 'your-google-client-secret'  # Replace with your actual client secret
GOOGLE_REDIRECT_URI = 'http://localhost:5000/api/auth/google/callback'
GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_image_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

def init_database():
    """Initialize the SQLite database with all required tables"""
    conn = sqlite3.connect(app.config['DATABASE'])
    cursor = conn.cursor()
    
    # Notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'general',
            pinned BOOLEAN DEFAULT FALSE,
            reactions TEXT DEFAULT '{}'
        )
    ''')
    
    # Photos table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            caption TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'memories',
            tags TEXT DEFAULT '[]',
            likes TEXT DEFAULT '[]'
        )
    ''')
    
    # Chores table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chores (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            assigned_to TEXT NOT NULL,
            due_date TEXT,
            status TEXT DEFAULT 'pending',
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            completed_at TEXT,
            recurring BOOLEAN DEFAULT FALSE,
            recurring_interval TEXT
        )
    ''')
    
    # Expenses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            paid_by TEXT NOT NULL,
            split_between TEXT NOT NULL,
            date TEXT NOT NULL,
            description TEXT,
            receipt_path TEXT,
            settled BOOLEAN DEFAULT FALSE
        )
    ''')
    
    # Weekly check-ins table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS checkins (
            id TEXT PRIMARY KEY,
            week_of TEXT NOT NULL,
            author TEXT NOT NULL,
            mood INTEGER NOT NULL,
            stress_level INTEGER NOT NULL,
            satisfaction INTEGER NOT NULL,
            highlights TEXT,
            concerns TEXT,
            suggestions TEXT,
            timestamp TEXT NOT NULL
        )
    ''')
    
    # House rules table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS house_rules (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            active BOOLEAN DEFAULT TRUE
        )
    ''')
    
    # Calendar events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS calendar_events (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            start_date TEXT NOT NULL,
            end_date TEXT,
            type TEXT NOT NULL DEFAULT 'event',
            created_by TEXT NOT NULL,
            attendees TEXT DEFAULT '[]',
            location TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

# Initialize database on startup
init_database()

# ===== UTILITY FUNCTIONS =====

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def dict_from_row(row):
    """Convert sqlite Row to dictionary"""
    return dict(zip(row.keys(), row)) if row else None

# ===== HEALTH CHECK =====

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'database': True,
            'file_storage': os.path.exists(app.config['UPLOAD_FOLDER'])
        }
    }
    return jsonify(status)

# ===== NOTES ENDPOINTS =====

@app.route('/api/notes', methods=['GET', 'POST'])
def handle_notes():
    """Get all notes or create a new note"""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM notes 
                ORDER BY pinned DESC, timestamp DESC
            ''')
            notes = [dict_from_row(row) for row in cursor.fetchall()]
            conn.close()
            
            # Parse JSON fields
            for note in notes:
                note['reactions'] = json.loads(note['reactions'] or '{}')
            
            return jsonify(notes)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            note_id = str(uuid.uuid4())
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO notes (id, title, content, author, timestamp, type, pinned, reactions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                note_id,
                data['title'],
                data['content'],
                data['author'],
                datetime.now().isoformat(),
                data.get('type', 'general'),
                data.get('pinned', False),
                json.dumps(data.get('reactions', {}))
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'id': note_id, 'message': 'Note created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/notes/<note_id>', methods=['PUT', 'DELETE'])
def handle_note(note_id):
    """Update or delete a specific note"""
    if request.method == 'PUT':
        try:
            data = request.json
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Update note
            cursor.execute('''
                UPDATE notes 
                SET title=?, content=?, type=?, pinned=?, reactions=?
                WHERE id=?
            ''', (
                data['title'],
                data['content'],
                data['type'],
                data['pinned'],
                json.dumps(data['reactions']),
                note_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Note updated successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM notes WHERE id=?', (note_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Note deleted successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/notes/<note_id>/react', methods=['POST'])
def add_reaction(note_id):
    """Add or toggle a reaction to a note"""
    try:
        data = request.json
        emoji = data['emoji']
        author = data['author']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT reactions FROM notes WHERE id=?', (note_id,))
        result = cursor.fetchone()
        
        if result:
            reactions = json.loads(result['reactions'] or '{}')
            
            if emoji not in reactions:
                reactions[emoji] = []
            
            if author in reactions[emoji]:
                reactions[emoji].remove(author)
                if not reactions[emoji]:
                    del reactions[emoji]
            else:
                reactions[emoji].append(author)
            
            cursor.execute('UPDATE notes SET reactions=? WHERE id=?', 
                         (json.dumps(reactions), note_id))
            conn.commit()
        
        conn.close()
        return jsonify({'message': 'Reaction updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== PHOTOS ENDPOINTS =====

@app.route('/api/photos', methods=['GET', 'POST'])
def handle_photos():
    """Get all photos or upload a new photo"""
    if request.method == 'GET':
        try:
            category = request.args.get('category', 'all')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            if category == 'all':
                cursor.execute('SELECT * FROM photos ORDER BY timestamp DESC')
            else:
                cursor.execute('SELECT * FROM photos WHERE category=? ORDER BY timestamp DESC', (category,))
            
            photos = [dict_from_row(row) for row in cursor.fetchall()]
            conn.close()
            
            # Parse JSON fields and add full URL
            for photo in photos:
                photo['tags'] = json.loads(photo['tags'] or '[]')
                photo['likes'] = json.loads(photo['likes'] or '[]')
                photo['url'] = f"/api/photos/{photo['id']}/file"
            
            return jsonify(photos)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            if 'photo' not in request.files:
                return jsonify({'error': 'No photo provided'}), 400
            
            file = request.files['photo']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            if not allowed_image_file(file.filename):
                return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400
            
            # Generate unique filename
            photo_id = str(uuid.uuid4())
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{photo_id}.{file_extension}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            # Save file
            file.save(file_path)
            
            # Get form data
            caption = request.form.get('caption', '')
            uploaded_by = request.form.get('uploadedBy', 'Unknown')
            category = request.form.get('category', 'memories')
            tags = json.loads(request.form.get('tags', '[]'))
            
            # Save to database
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO photos (id, filename, file_path, caption, uploaded_by, timestamp, category, tags, likes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                photo_id,
                filename,
                file_path,
                caption,
                uploaded_by,
                datetime.now().isoformat(),
                category,
                json.dumps(tags),
                json.dumps([])
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'id': photo_id, 'message': 'Photo uploaded successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/photos/<photo_id>/file', methods=['GET'])
def get_photo_file(photo_id):
    """Serve photo file"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT file_path FROM photos WHERE id=?', (photo_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result and os.path.exists(result['file_path']):
            return send_file(result['file_path'])
        else:
            return jsonify({'error': 'Photo not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/photos/<photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    """Delete a photo"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT file_path FROM photos WHERE id=?', (photo_id,))
        result = cursor.fetchone()
        
        if result:
            # Delete file
            if os.path.exists(result['file_path']):
                os.remove(result['file_path'])
            
            # Delete from database
            cursor.execute('DELETE FROM photos WHERE id=?', (photo_id,))
            conn.commit()
        
        conn.close()
        return jsonify({'message': 'Photo deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/photos/<photo_id>/like', methods=['POST'])
def toggle_photo_like(photo_id):
    """Toggle like on a photo"""
    try:
        data = request.json
        user = data['user']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT likes FROM photos WHERE id=?', (photo_id,))
        result = cursor.fetchone()
        
        if result:
            likes = json.loads(result['likes'] or '[]')
            
            if user in likes:
                likes.remove(user)
            else:
                likes.append(user)
            
            cursor.execute('UPDATE photos SET likes=? WHERE id=?', 
                         (json.dumps(likes), photo_id))
            conn.commit()
        
        conn.close()
        return jsonify({'message': 'Like updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== CHORES ENDPOINTS =====

@app.route('/api/chores', methods=['GET', 'POST'])
def handle_chores():
    """Get all chores or create a new chore"""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM chores ORDER BY due_date ASC')
            chores = [dict_from_row(row) for row in cursor.fetchall()]
            conn.close()
            
            return jsonify(chores)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            chore_id = str(uuid.uuid4())
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO chores (id, title, description, assigned_to, due_date, status, created_by, created_at, recurring, recurring_interval)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                chore_id,
                data['title'],
                data.get('description', ''),
                data['assigned_to'],
                data.get('due_date'),
                data.get('status', 'pending'),
                data['created_by'],
                datetime.now().isoformat(),
                data.get('recurring', False),
                data.get('recurring_interval')
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'id': chore_id, 'message': 'Chore created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/chores/<chore_id>', methods=['PUT', 'DELETE'])
def handle_chore(chore_id):
    """Update or delete a specific chore"""
    if request.method == 'PUT':
        try:
            data = request.json
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # If marking as completed, set completed_at
            completed_at = datetime.now().isoformat() if data.get('status') == 'completed' else None
            
            cursor.execute('''
                UPDATE chores 
                SET title=?, description=?, assigned_to=?, due_date=?, status=?, completed_at=?, recurring=?, recurring_interval=?
                WHERE id=?
            ''', (
                data['title'],
                data.get('description', ''),
                data['assigned_to'],
                data.get('due_date'),
                data['status'],
                completed_at,
                data.get('recurring', False),
                data.get('recurring_interval'),
                chore_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Chore updated successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM chores WHERE id=?', (chore_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Chore deleted successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ===== EXPENSES ENDPOINTS =====

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    """Get all expenses or create a new expense"""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
            expenses = [dict_from_row(row) for row in cursor.fetchall()]
            conn.close()
            
            # Parse JSON fields
            for expense in expenses:
                expense['split_between'] = json.loads(expense['split_between'])
            
            return jsonify(expenses)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            expense_id = str(uuid.uuid4())
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO expenses (id, title, amount, category, paid_by, split_between, date, description, settled)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                expense_id,
                data['title'],
                data['amount'],
                data['category'],
                data['paid_by'],
                json.dumps(data['split_between']),
                data['date'],
                data.get('description', ''),
                data.get('settled', False)
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'id': expense_id, 'message': 'Expense created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ===== WEEKLY CHECK-INS ENDPOINTS =====

@app.route('/api/checkins', methods=['GET', 'POST'])
def handle_checkins():
    """Get all check-ins or create a new check-in"""
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM checkins ORDER BY week_of DESC')
            checkins = [dict_from_row(row) for row in cursor.fetchall()]
            conn.close()
            
            return jsonify(checkins)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            checkin_id = str(uuid.uuid4())
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO checkins (id, week_of, author, mood, stress_level, satisfaction, highlights, concerns, suggestions, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                checkin_id,
                data['week_of'],
                data['author'],
                data['mood'],
                data['stress_level'],
                data['satisfaction'],
                data.get('highlights', ''),
                data.get('concerns', ''),
                data.get('suggestions', ''),
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'id': checkin_id, 'message': 'Check-in created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ===== GOOGLE CALENDAR INTEGRATION =====

@app.route('/api/auth/google', methods=['GET'])
def google_auth():
    """Initiate Google OAuth flow"""
    auth_url = 'https://accounts.google.com/o/oauth2/auth'
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': GOOGLE_REDIRECT_URI,
        'scope': GOOGLE_CALENDAR_SCOPE,
        'response_type': 'code',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url_with_params = f"{auth_url}?{urlencode(params)}"
    return jsonify({'auth_url': auth_url_with_params})

@app.route('/api/auth/google/callback', methods=['GET'])
def google_callback():
    """Handle Google OAuth callback"""
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'Authorization code not provided'}), 400
    
    # Exchange code for access token
    token_url = 'https://oauth2.googleapis.com/token'
    token_data = {
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': GOOGLE_REDIRECT_URI
    }
    
    try:
        response = requests.post(token_url, data=token_data)
        token_info = response.json()
        
        if 'access_token' in token_info:
            # Store tokens in session or database
            session['google_access_token'] = token_info['access_token']
            if 'refresh_token' in token_info:
                session['google_refresh_token'] = token_info['refresh_token']
            
            # Redirect to frontend with success
            return redirect('http://localhost:3000/calendar?auth=success')
        else:
            return redirect('http://localhost:3000/calendar?auth=error')
    except Exception as e:
        print(f"Google auth error: {e}")
        return redirect('http://localhost:3000/calendar?auth=error')

@app.route('/api/calendar/google/events', methods=['GET'])
def get_google_calendar_events():
    """Get events from Google Calendar"""
    access_token = session.get('google_access_token')
    if not access_token:
        return jsonify({'error': 'Not authenticated with Google'}), 401
    
    try:
        # Get calendar events
        calendar_url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Get events for the next month
        time_min = datetime.now().isoformat() + 'Z'
        time_max = (datetime.now() + timedelta(days=30)).isoformat() + 'Z'
        
        params = {
            'timeMin': time_min,
            'timeMax': time_max,
            'singleEvents': True,
            'orderBy': 'startTime'
        }
        
        response = requests.get(calendar_url, headers=headers, params=params)
        
        if response.status_code == 200:
            events_data = response.json()
            
            # Transform Google Calendar events to our format
            events = []
            for event in events_data.get('items', []):
                start_time = event.get('start', {})
                end_time = event.get('end', {})
                
                events.append({
                    'id': event['id'],
                    'title': event.get('summary', 'No Title'),
                    'description': event.get('description', ''),
                    'start_date': start_time.get('dateTime', start_time.get('date')),
                    'end_date': end_time.get('dateTime', end_time.get('date')),
                    'type': 'google_calendar',
                    'created_by': 'Google Calendar',
                    'attendees': [attendee.get('email', '') for attendee in event.get('attendees', [])],
                    'location': event.get('location', ''),
                    'source': 'google'
                })
            
            return jsonify(events)
        else:
            return jsonify({'error': 'Failed to fetch Google Calendar events'}), response.status_code
            
    except Exception as e:
        print(f"Error fetching Google Calendar events: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/google/create', methods=['POST'])
def create_google_calendar_event():
    """Create event in Google Calendar"""
    access_token = session.get('google_access_token')
    if not access_token:
        return jsonify({'error': 'Not authenticated with Google'}), 401
    
    try:
        data = request.json
        
        # Create Google Calendar event
        calendar_url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        event_data = {
            'summary': data['title'],
            'description': data.get('description', ''),
            'start': {
                'dateTime': data['start_date'],
                'timeZone': 'America/New_York'  # Adjust timezone as needed
            },
            'end': {
                'dateTime': data['end_date'],
                'timeZone': 'America/New_York'
            },
            'location': data.get('location', ''),
            'attendees': [{'email': email} for email in data.get('attendees', [])]
        }
        
        response = requests.post(calendar_url, headers=headers, json=event_data)
        
        if response.status_code == 200:
            google_event = response.json()
            
            # Also save to local database
            event_id = str(uuid.uuid4())
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO calendar_events (id, title, description, start_date, end_date, type, created_by, attendees, location, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                event_id,
                data['title'],
                data.get('description', ''),
                data['start_date'],
                data['end_date'],
                'google_sync',
                data.get('created_by', 'System'),
                json.dumps(data.get('attendees', [])),
                data.get('location', ''),
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
            
            return jsonify({
                'id': google_event['id'],
                'message': 'Event created in Google Calendar and synced locally'
            })
        else:
            return jsonify({'error': 'Failed to create Google Calendar event'}), response.status_code
            
    except Exception as e:
        print(f"Error creating Google Calendar event: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/sync', methods=['POST'])
def sync_google_calendar():
    """Manual sync with Google Calendar"""
    try:
        # Fetch Google Calendar events
        google_events_response = get_google_calendar_events()
        
        if google_events_response.status_code == 200:
            google_events = json.loads(google_events_response.data)
            
            # Update local database with Google events
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Clear existing Google sync events
            cursor.execute('DELETE FROM calendar_events WHERE type = "google_sync"')
            
            # Insert new Google events
            for event in google_events:
                event_id = str(uuid.uuid4())
                cursor.execute('''
                    INSERT INTO calendar_events (id, title, description, start_date, end_date, type, created_by, attendees, location, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    event_id,
                    event['title'],
                    event['description'],
                    event['start_date'],
                    event['end_date'],
                    'google_sync',
                    'Google Calendar',
                    json.dumps(event['attendees']),
                    event['location'],
                    datetime.now().isoformat()
                ))
            
            conn.commit()
            conn.close()
            
            return jsonify({'message': f'Synced {len(google_events)} events from Google Calendar'})
        else:
            return jsonify({'error': 'Failed to sync with Google Calendar'}), 500
            
    except Exception as e:
        print(f"Error syncing Google Calendar: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/google/status', methods=['GET'])
def google_auth_status():
    """Check Google authentication status"""
    access_token = session.get('google_access_token')
    return jsonify({'authenticated': bool(access_token)})

# ===== CALENDAR EVENTS ENDPOINTS =====

@app.route('/api/calendar/events', methods=['GET', 'POST'])
def handle_calendar_events():
    """Get all calendar events or create a new event"""
    if request.method == 'GET':
        try:
            view = request.args.get('view', 'month')
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            
            query = 'SELECT * FROM calendar_events'
            params = []
            
            if start_date and end_date:
                query += ' WHERE start_date >= ? AND start_date <= ?'
                params.extend([start_date, end_date])
            
            query += ' ORDER BY start_date ASC'
            
            cursor.execute(query, params)
            events = [dict_from_row(row) for row in cursor.fetchall()]
            conn.close()
            
            # Parse JSON fields
            for event in events:
                event['attendees'] = json.loads(event['attendees'] or '[]')
            
            return jsonify(events)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            event_id = str(uuid.uuid4())
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO calendar_events (id, title, description, start_date, end_date, type, created_by, attendees, location, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                event_id,
                data['title'],
                data.get('description', ''),
                data['start_date'],
                data.get('end_date'),
                data.get('type', 'event'),
                data['created_by'],
                json.dumps(data.get('attendees', [])),
                data.get('location', ''),
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'id': event_id, 'message': 'Event created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/calendar/events/<event_id>', methods=['PUT', 'DELETE'])
def handle_calendar_event(event_id):
    """Update or delete a specific calendar event"""
    if request.method == 'PUT':
        try:
            data = request.json
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE calendar_events 
                SET title=?, description=?, start_date=?, end_date=?, type=?, attendees=?, location=?
                WHERE id=?
            ''', (
                data['title'],
                data.get('description', ''),
                data['start_date'],
                data.get('end_date'),
                data.get('type', 'event'),
                json.dumps(data.get('attendees', [])),
                data.get('location', ''),
                event_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Event updated successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM calendar_events WHERE id=?', (event_id,))
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Event deleted successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ===== DATA EXPORT/IMPORT =====

@app.route('/api/export', methods=['GET'])
def export_data():
    """Export all data as JSON"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        export_data = {}
        
        # Export all tables
        tables = ['notes', 'photos', 'chores', 'expenses', 'checkins', 'house_rules', 'calendar_events']
        
        for table in tables:
            cursor.execute(f'SELECT * FROM {table}')
            export_data[table] = [dict_from_row(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Create downloadable JSON file
        output = io.BytesIO()
        output.write(json.dumps(export_data, indent=2, default=str).encode())
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/json',
            as_attachment=True,
            download_name=f'roommate_data_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== ERROR HANDLERS =====

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🏠 Starting Roommate Management Backend...")
    print("📋 Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/notes - Get all notes")
    print("  POST /api/notes - Create new note")
    print("  PUT  /api/notes/<id> - Update note")
    print("  DELETE /api/notes/<id> - Delete note")
    print("  POST /api/notes/<id>/react - Add reaction")
    print("  GET  /api/photos - Get all photos")
    print("  POST /api/photos - Upload photo")
    print("  DELETE /api/photos/<id> - Delete photo")
    print("  POST /api/photos/<id>/like - Toggle photo like")
    print("  GET  /api/chores - Get all chores")
    print("  POST /api/chores - Create new chore")
    print("  PUT  /api/chores/<id> - Update chore")
    print("  DELETE /api/chores/<id> - Delete chore")
    print("  GET  /api/expenses - Get all expenses")
    print("  POST /api/expenses - Create new expense")
    print("  GET  /api/checkins - Get all check-ins")
    print("  POST /api/checkins - Create new check-in")
    print("  GET  /api/export - Export all data")
    print("\\n🌐 Frontend should connect to: http://localhost:5000/api")
    
    # Start Flask development server
    app.run(debug=True, host='0.0.0.0', port=5000)