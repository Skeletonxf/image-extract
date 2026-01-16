// Background service worker for Image Extract (Chrome MV3)

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  
  // Don't run on chrome:// or edge:// pages
  if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://') || tab.url?.startsWith('about:')) {
    console.log('Cannot run on browser internal pages');
    return;
  }

  try {
    // Inject the content script to extract images
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractImages
    });

    if (results && results[0] && results[0].result) {
      const imageData = results[0].result;
      
      // Create a new tab with the extracted images
      const viewerTab = await chrome.tabs.create({
        url: chrome.runtime.getURL('viewer.html')
      });

      // Wait for the tab to load, then send the image data
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === viewerTab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(viewerTab.id, {
            type: 'IMAGES_DATA',
            images: imageData.images,
            sourceUrl: imageData.sourceUrl,
            sourceTitle: imageData.sourceTitle
          });
        }
      });
    }
  } catch (error) {
    console.error('Error extracting images:', error);
  }
});

// This function runs in the context of the web page
function extractImages() {
  const images = new Set();
  
  // Get all <img> elements
  document.querySelectorAll('img').forEach(img => {
    // Get the actual displayed source (handles srcset, lazy loading, etc.)
    const src = img.currentSrc || img.src;
    if (src && !src.startsWith('data:') && src.length > 0) {
      images.add(src);
    }
    
    // Also check srcset for higher resolution versions
    if (img.srcset) {
      img.srcset.split(',').forEach(srcsetEntry => {
        const url = srcsetEntry.trim().split(/\s+/)[0];
        if (url && !url.startsWith('data:')) {
          images.add(url);
        }
      });
    }
  });

  // Get background images from all elements
  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    const bgImage = style.backgroundImage;
    
    if (bgImage && bgImage !== 'none') {
      // Extract URLs from background-image (handles multiple backgrounds)
      const urlMatches = bgImage.matchAll(/url\(["']?([^"')]+)["']?\)/g);
      for (const match of urlMatches) {
        const url = match[1];
        if (url && !url.startsWith('data:')) {
          // Resolve relative URLs
          try {
            const absoluteUrl = new URL(url, window.location.href).href;
            images.add(absoluteUrl);
          } catch (e) {
            // Invalid URL, skip
          }
        }
      }
    }
  });

  // Get images from <picture> elements
  document.querySelectorAll('picture source').forEach(source => {
    if (source.srcset) {
      source.srcset.split(',').forEach(srcsetEntry => {
        const url = srcsetEntry.trim().split(/\s+/)[0];
        if (url && !url.startsWith('data:')) {
          try {
            const absoluteUrl = new URL(url, window.location.href).href;
            images.add(absoluteUrl);
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
    }
  });

  // Get images from <video> poster attributes
  document.querySelectorAll('video[poster]').forEach(video => {
    const poster = video.poster;
    if (poster && !poster.startsWith('data:')) {
      try {
        const absoluteUrl = new URL(poster, window.location.href).href;
        images.add(absoluteUrl);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });

  // Get SVG images
  document.querySelectorAll('svg image').forEach(svgImage => {
    const href = svgImage.getAttribute('href') || svgImage.getAttribute('xlink:href');
    if (href && !href.startsWith('data:')) {
      try {
        const absoluteUrl = new URL(href, window.location.href).href;
        images.add(absoluteUrl);
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });

  return {
    images: Array.from(images),
    sourceUrl: window.location.href,
    sourceTitle: document.title
  };
}
