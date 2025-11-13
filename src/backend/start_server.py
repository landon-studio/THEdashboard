#!/usr/bin/env python3
"""
Simple startup script for the Roommate Management Backend
Run this to start the Flask server with proper initialization
"""

import os
import sys
import subprocess

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = ['flask', 'flask-cors', 'pillow', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nTo install missing packages, run:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🏠 Roommate Management Backend Startup")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    print(f"📁 Working directory: {backend_dir}")
    
    # Check dependencies
    print("🔍 Checking dependencies...")
    if not check_dependencies():
        print("\n❌ Please install missing dependencies and try again.")
        sys.exit(1)
    
    print("✅ All dependencies found!")
    
    # Create necessary directories
    os.makedirs('uploads/photos', exist_ok=True)
    print("📁 Created upload directories")
    
    # Start the Flask application
    print("\n🚀 Starting Flask server...")
    print("   URL: http://localhost:5000")
    print("   API: http://localhost:5000/api")
    print("   Press Ctrl+C to stop")
    print("=" * 50)
    
    try:
        # Import and run the app
        from roommate_app import app, init_database
        
        # Initialize database
        print("🗄️  Initializing database...")
        init_database()
        print("✅ Database initialized!")
        
        # Start the server
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ImportError as e:
        print(f"❌ Error importing roommate_app: {e}")
        print("Make sure roommate_app.py is in the current directory")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()