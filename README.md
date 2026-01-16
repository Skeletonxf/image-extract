# Image Extract for Chrome

A minimal Chrome extension that extracts all images from the current tab and displays them in a new tab. Chrome/Edge port of [Skeletonxf's Firefox extension](https://github.com/Skeletonxf/image-extract).

## Features

- Click the extension icon or press `Alt+Shift+I` to extract images
- Finds images from `<img>` tags, CSS backgrounds, `<picture>` elements, video posters, and SVG images
- Displays all found images in a clean dark-themed grid view
- Shows **resolution**, **format**, and **file size** for each image
- Filter images by URL
- Sort by filename
- Click any image to open it in a new window
- Download images directly

## Installation

### Method 1: Load unpacked (Developer Mode)

1. Unzip `image-extract-chrome.zip`
2. Open Chrome and go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top right)
4. Click **"Load unpacked"**
5. Select the `image-extract-chrome` folder
6. Done! Click the extension icon on any page to extract images.

### Method 2: Edge Browser

Works the same way in Microsoft Edge:
1. Go to `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the folder

## Usage

1. Navigate to any webpage with images
2. Click the Image Extract icon in the toolbar (or press `Alt+Shift+I`)
3. A new tab opens showing all extracted images with metadata
4. Use the filter box to search for specific images
5. Click any image to open it full size, or click Download to save it

## Fork & Contribute

This is an unofficial Chrome port. To contribute or create your own version:

1. **Fork the original repo**: Go to https://github.com/Skeletonxf/image-extract and click "Fork"
2. **Create a Chrome branch**: 
   ```bash
   git checkout -b chrome-port
   ```
3. **Replace the files** with the ones from this zip
4. **Push and create a PR** (or maintain your own fork)

Alternatively, create a new repo for the Chrome version:
1. Create a new GitHub repository
2. Extract this zip and push the contents
3. Link back to the original project in your README

## Changelog

### v1.1.0
- Added resolution, format, and file size display for each image
- Fixed buttons (CSP compliance)
- Open now opens in new window while keeping viewer open
- Download actually downloads the file (falls back to open if CORS blocks)

### v1.0.0
- Initial Chrome port
- Manifest V3 with service worker
- Dark theme viewer with filter/sort

## Differences from Firefox version

- Uses Manifest V3 (Chrome's modern extension format)
- Service worker instead of background page
- Different UI with dark theme and metadata display
- Added filtering and sorting features

## License

GPL-3.0 (same as original)

## Credits

Original Firefox extension by [Skeletonxf](https://github.com/Skeletonxf/image-extract)
