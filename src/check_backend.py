#!/usr/bin/env python3
"""
Quick script to check if the Flask backend is running and provide setup guidance
"""

import requests
import os
import sys

def check_backend_status():
    """Check if the Flask backend is running"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running successfully!")
            print(f"📊 Status: {response.json()}")
            return True
        else:
            print(f"⚠️  Backend responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running or not accessible at http://localhost:5000")
        return False
    except requests.exceptions.Timeout:
        print("⏱️  Backend is taking too long to respond (timeout)")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def show_setup_instructions():
    """Show instructions to start the backend"""
    print("\n🔧 TO START THE BACKEND:")
    print("=" * 50)
    print("1. Open a new terminal/command prompt")
    print("2. Navigate to the backend directory:")
    print("   cd backend")
    print("\n3. Install dependencies (if not already installed):")
    print("   pip install flask flask-cors pillow requests")
    print("\n4. Start the server:")
    print("   python start_server.py")
    print("   OR")
    print("   python roommate_app.py")
    print("\n5. You should see output like:")
    print("   🏠 Starting Roommate Management Backend...")
    print("   * Running on http://0.0.0.0:5000")
    print("\n6. Return to your web app and refresh the page")
    print("=" * 50)

def main():
    print("🏠 Roommate Management - Backend Status Check")
    print("=" * 50)
    
    if check_backend_status():
        print("\n🎉 Everything looks good! Your roommate app should work properly.")
        print("💡 If you're still having issues, try refreshing your web browser.")
    else:
        show_setup_instructions()
        
        print("\n🔍 Current directory:", os.getcwd())
        if os.path.exists('backend'):
            print("✅ Backend directory found")
            if os.path.exists('backend/roommate_app.py'):
                print("✅ Backend script found")
            else:
                print("❌ Backend script (roommate_app.py) not found")
        else:
            print("❌ Backend directory not found")
            print("💡 Make sure you're running this from the project root directory")

if __name__ == "__main__":
    main()