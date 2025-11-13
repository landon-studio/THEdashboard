# Google Gemini AI Integration Setup Guide

## Overview

Your AI Assistant can now be powered by **Google Gemini AI** for advanced natural language understanding and intelligent responses! This enables your assistant to:

- ✨ Understand natural, conversational language
- 🎯 Execute complex commands and multi-step tasks
- 🧠 Remember context within conversations
- 🔄 Perform real actions (log walks, complete chores, navigate, etc.)
- 📊 Provide intelligent insights based on your data

## How It Works

### Without AI (Default)
- Uses rule-based pattern matching
- Responds to specific commands and keywords
- Fast and works offline
- Limited understanding of variations

### With Gemini AI (Enabled)
- Powered by Google's advanced language model
- Understands natural language and intent
- Can handle complex, multi-part requests
- Contextually aware of your roommate setup
- Function calling to execute actual actions

## Getting Your Free Gemini API Key

### Step 1: Visit Google AI Studio
Go to: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Step 2: Sign in with Google
Use any Google account (Gmail, etc.)

### Step 3: Create API Key
1. Click the **"Create API Key"** button
2. Choose to create a new project or use an existing one
3. Your API key will be generated instantly

### Step 4: Copy the Key
Copy the entire API key (starts with `AIza...`)

### Step 5: Add to Dashboard
1. Open your AI Assistant (default home screen)
2. Click the **"Enable AI"** button
3. Paste your API key
4. Click **"Save & Enable AI"**

That's it! Your AI Assistant is now supercharged! 🚀

## Free Tier Limits

Google Gemini offers a **generous free tier**:
- ✅ **60 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **No credit card required**

This is more than enough for typical roommate management usage!

## Privacy & Security

- 🔒 Your API key is stored locally in your browser
- 🔒 Never shared or sent to any third party
- 🔒 Only used to communicate with Google's Gemini API
- 🔒 You can remove it anytime

**Note:** This dashboard is designed for household management. Don't store sensitive personal information (SSN, passwords, medical records, etc.)

## Example Commands

Once Gemini AI is enabled, try these natural language commands:

### Walking Kepler
- "Hey, log a morning walk for Kepler"
- "I just took Kepler for a 30-minute walk around the neighborhood"
- "Mark down that we walked Kepler"

### Checking Schedule
- "What do I have on my schedule today?"
- "Show me what's planned for tomorrow"
- "Do we have any events this week?"

### Managing Chores
- "What chores do I need to do?"
- "Mark the dishes as done"
- "Who's supposed to clean the bathroom?"

### Navigation
- "Take me to Kepler's care page"
- "Open the calendar"
- "Show me the analytics dashboard"

### General Help
- "What can you help me with?"
- "How many times did we walk Kepler today?"
- "What are the house rules about quiet hours?"

## Function Calling

Gemini AI can execute real actions through function calling:

| Function | What It Does |
|----------|--------------|
| `logKeplerWalk` | Records a walk with time, duration, location |
| `getSchedule` | Retrieves calendar events for a date |
| `getChores` | Lists chores, filtered by assignee or status |
| `completeChore` | Marks a chore as completed |
| `navigate` | Switches to different dashboard screens |
| `getKeplerStats` | Shows walk statistics and health info |
| `getHouseRules` | Displays house rules and guidelines |
| `getRoommateInfo` | Provides info about roommates |

The AI automatically decides when to call these functions based on your request!

## Troubleshooting

### "AI is not configured" Error
- Make sure you've added a valid API key
- Check that you clicked "Save & Enable AI"
- Try refreshing the page

### API Key Not Working
- Verify the key is copied completely (starts with `AIza`)
- Check your Google Cloud project has the Gemini API enabled
- Ensure you haven't exceeded the free tier limits

### Slow Responses
- First response may be slower (initializing)
- Check your internet connection
- Consider the complexity of your request

### Want to Switch Back?
- Click "Enable AI" button
- Click "Disable AI & Remove Key"
- You'll return to rule-based responses

## Cost Information

**Free Tier:** Plenty for personal use
- 60 requests/min
- 1,500 requests/day

**If you exceed free tier:**
- Gemini 1.5 Flash: ~$0.000035 per 1K characters input, ~$0.00014 per 1K characters output
- Still very affordable for personal use
- Most household use stays within free limits

## Architecture

```
User Voice/Text Input
    ↓
Speech Recognition (Web Speech API)
    ↓
Gemini AI Processing
    ↓
Function Calls (if needed) → Execute actions
    ↓
Natural Language Response
    ↓
Speech Synthesis (Text-to-Speech)
```

## Next Steps

1. ✅ Get your Gemini API key
2. ✅ Enable AI in the dashboard
3. ✅ Try voice commands
4. ✅ Explore natural language interactions
5. ✅ Enjoy your intelligent AI assistant!

## Questions?

Check the tutorial (Help button) or try asking your AI Assistant:
- "What can you do?"
- "Help me get started"
- "Show me around"

Happy automating! 🏠✨
