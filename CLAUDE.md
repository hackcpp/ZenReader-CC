# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZenReader is a Chrome extension that provides a clean reading mode. It extracts article content using Readability.js and displays it in a distraction-free interface with Shadow DOM style isolation.

## Development

This is a Chrome Extension (Manifest V3) - no build step required. Load the extension directly in Chrome:

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project directory

## Architecture

**Data Flow:**
```
Popup (theme controls) ↔ Background Script ↔ Content Script ↔ Shadow DOM Reader
                                          ↓
                               chrome.storage.local (persistence)
```

**Key Components:**
- `manifest.json` - Extension configuration, permissions, content scripts registration
- `background/background.js` - Message broker between popup and content scripts
- `content/content.js` - Creates Shadow DOM reader, loads Readability.js, handles theme updates
- `popup/popup.js` - UI controls, sends messages to toggle reader mode and change themes
- `styles/reader.css` - Reader styling with CSS variables (`--bg-color`, `--text-color`)

**Communication:**
- `chrome.runtime.sendMessage` / `chrome.runtime.onMessage` for cross-context messaging
- `chrome.storage.local` for user preferences (theme)

**Presets:**
- White: `#FFFFFF` bg, `#333333` text
- Sepia: `#F5F5DC` bg, `#2C2C2C` text
- Dark: `#1E1E1E` bg, `#E0E0E0` text
- Green: `#C7EDCC` bg, `#2C2C2C` text
