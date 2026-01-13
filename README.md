# ZenReader

A clean reading mode Chrome extension that extracts article content and provides a distraction-free reading experience.

## Features

- **Article Extraction**: Uses Mozilla's Readability.js to extract clean article content from any webpage
- **Theme Options**: Choose from 4 preset themes (White, Sepia, Dark, Green)
- **Style Isolation**: Shadow DOM ensures reader styles don't conflict with page styles
- **Persistent Settings**: Your preferences are saved automatically

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the ZenReader project directory

## Usage

1. Visit any article page
2. Click the ZenReader extension icon in the toolbar
3. Click "Enter Reader Mode" to extract and display the article
4. Use the popup to switch themes or exit reader mode

## Themes

| Theme | Background | Text |
|-------|------------|------|
| White | `#FFFFFF` | `#333333` |
| Sepia | `#F5F5DC` | `#2C2C2C` |
| Dark | `#1E1E1E` | `#E0E0E0` |
| Green | `#C7EDCC` | `#2C2C2C` |

## Architecture

```
Chrome Extension (Manifest V3)
├── manifest.json           # Extension configuration
├── background/             # Background service worker
│   └── background.js       # Message broker
├── content/                # Content scripts
│   ├── content.js          # Reader creation & management
│   └── readability.js      # Article extraction
├── popup/                  # Extension popup
│   ├── popup.html          # UI structure
│   ├── popup.js            # UI logic & messaging
│   └── popup.css           # Popup styles
├── styles/                 # Shared styles
│   └── reader.css          # Reader view styles
└── icons/                  # Extension icons
```

## Data Flow

```
User clicks extension icon
    ↓
Background Script receives click
    ↓
Sends message to Content Script
    ↓
Content Script extracts article via Readability.js
    ↓
Creates Shadow DOM reader view
    ↓
User adjusts settings via Popup
    ↓
Settings saved to chrome.storage.local
```

## Development

No build step required. Changes take effect immediately after reloading the extension:

1. Make your changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on ZenReader

## Permissions

- `activeTab`: Access the current tab when extension is clicked
- `storage`: Persist user preferences (theme)
- `<all_urls>`: Required to run on all web pages
