# AI Assistant Guide

## Overview
The AI Assistant is a futuristic, voice-controlled smart interface that serves as the centerpiece of your roommate management dashboard. It provides intelligent navigation, quick actions, and contextual awareness to make managing your household effortless.

## Features

### 🎤 Voice Control
- **Speech Recognition**: Uses the Web Speech API for natural voice commands
- **Real-time Transcription**: See your words as you speak
- **Voice Feedback**: The assistant responds with synthesized speech
- **Browser Support**: Works in Chrome, Edge, and Safari (latest versions)

### ✨ Visual Effects
- **Animated Orb**: Central pulsating sphere with gradient effects
- **Voice Waves**: Visual feedback when listening to your voice
- **Orbiting Elements**: Futuristic floating particles around the main orb
- **State Indicators**: Visual changes based on assistant state (idle, listening, thinking, speaking)
- **Glassmorphism Design**: Matches your existing dashboard aesthetic

### 🚀 Smart Commands

#### Kepler Care
- "Log Kepler's morning walk"
- "Log Kepler's afternoon walk"
- "Log Kepler's evening walk"
- "Show Kepler's care"

#### Navigation
- "Show today's schedule"
- "What are my chores?"
- "Check house rules"
- "View analytics"
- "Show expenses"
- "Open notes"
- "Show photos"
- "Traditional dashboard"

#### General
- "Hello" / "Hi" / "Hey" - Get a friendly greeting
- "Help" - See what the assistant can do

### 📊 Contextual Awareness
- **Time-based Suggestions**: Different walk reminders based on time of day
- **Smart Recommendations**: Suggestions adapt to your current context
- **Data Integration**: Pulls information from your calendar, chores, and walk logs

## How to Use

### First Time Setup
1. When you first access the AI Assistant, a tutorial will appear
2. Read through the features and capabilities
3. Click "Get Started" to begin

### Voice Commands
1. Click "Start Voice Control" button
2. Wait for the microphone indicator to activate
3. Speak your command clearly
4. The assistant will process and respond

### Quick Actions
- Click any suggestion button for instant actions
- No voice required - perfect for quiet environments
- Suggestions update based on time of day

### Message History
- View the last 6 interactions
- See both your commands and assistant responses
- Messages include timestamps

## Technical Details

### Browser Compatibility
- ✅ Chrome/Edge (Full support)
- ✅ Safari (Full support)
- ⚠️ Firefox (Limited - no voice recognition)
- ❌ Older browsers (Use quick actions instead)

### Data Storage
- Commands and walks are stored in localStorage
- No external APIs required
- Fully client-side operation
- Data persists between sessions

### Voice Recognition
- Continuous listening mode
- Interim results for real-time feedback
- Final transcripts trigger command processing
- Automatic restart on connection loss

### Voice Synthesis
- Text-to-speech responses
- Adjustable rate, pitch, and volume
- Works in all modern browsers
- Can be muted via browser settings

## Tips for Best Results

### Voice Commands
- Speak clearly and at normal pace
- Use natural language
- Include key words (e.g., "walk", "schedule", "chores")
- Wait for visual feedback before speaking again

### Performance
- Works best with good microphone
- Reduce background noise
- Use headphones to prevent echo
- Keep browser tab active

### Privacy
- All processing happens locally
- No data sent to external servers
- Voice data is not stored
- Transcripts are temporary

## Troubleshooting

### Voice Not Working?
1. Check browser permissions for microphone
2. Ensure you're using HTTPS (required for Web Speech API)
3. Try refreshing the page
4. Use quick action buttons as alternative

### Commands Not Processing?
1. Speak more clearly
2. Include key words (walk, schedule, chores)
3. Try the Help button to see examples
4. Use suggestion buttons instead

### Visual Issues?
1. Ensure hardware acceleration is enabled
2. Update your browser to latest version
3. Reduce other browser tabs
4. Check system resources

## Customization

The AI Assistant can be customized by editing `/components/AIAssistant.tsx`:

- Add new voice commands in `processCommand()`
- Modify visual effects in the JSX
- Change particle count and behavior
- Adjust animation timing and easing
- Customize color gradients

## Future Enhancements

Potential additions:
- Multi-language support
- Customizable wake words
- Advanced natural language processing
- Integration with external smart home devices
- Voice command macros
- Personalized learning

## Support

For issues or questions:
1. Check the in-app Help tutorial
2. Review this guide
3. Check browser console for errors
4. Ensure all dependencies are installed

---

**Note**: The AI Assistant uses browser-native speech recognition and synthesis. No API keys or external services are required. All processing happens locally on your device.
