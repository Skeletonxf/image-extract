// Viewer script for Image Extract

let allImages = [];
let sourceUrl = '';
let sourceTitle = '';

// Listen for image data from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'IMAGES_DATA') {
    allImages = message.images;
    sourceUrl = message.sourceUrl;
    sourceTitle = message.sourceTitle;
    
    document.querySelector('.source').innerHTML = 
      `From: <a href="${escapeHtml(sourceUrl)}" target="_blank">${escapeHtml(sourceTitle || sourceUrl)}</a>`;
    
    renderImages(allImages);
    document.getElementById('loading').classList.add('hidden');
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFilename(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || url;
    const decoded = decodeURIComponent(filename);
    return decoded.length > 50 ? decoded.substring(0, 47) + '...' : decoded;
  } catch (e) {
    return url.substring(0, 50);
  }
}

function getFullFilename(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'image';
    return decodeURIComponent(filename);
  } catch (e) {
    return 'image';
  }
}

function getFormat(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    // Remove query params from extension check
    const cleanPath = pathname.split('?')[0];
    const ext = cleanPath.split('.').pop();
    
    const knownFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif', 'tiff', 'tif'];
    if (knownFormats.includes(ext)) {
      return ext === 'jpeg' ? 'JPG' : ext.toUpperCase();
    }
    return '—';
  } catch (e) {
    return '—';
  }
}

function formatFileSize(bytes) {
  if (bytes === 0 || !bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Open image in a new window
function openImage(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Download image using fetch + blob
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'image';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (e) {
    // CORS blocked - try opening in new tab instead
    console.warn('Download failed (CORS), opening in new tab:', e);
    window.open(url, '_blank');
  }
}

function renderImages(images) {
  const grid = document.getElementById('grid');
  const noImages = document.getElementById('no-images');
  const totalCount = document.getElementById('total-count');
  const visibleCount = document.getElementById('visible-count');
  
  totalCount.textContent = allImages.length;
  visibleCount.textContent = images.length;
  
  if (images.length === 0) {
    grid.innerHTML = '';
    noImages.classList.remove('hidden');
    return;
  }
  
  noImages.classList.add('hidden');
  grid.innerHTML = '';
  
  images.forEach((url, index) => {
    const filename = getFilename(url);
    const fullFilename = getFullFilename(url);
    const format = getFormat(url);
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'image-card';
    card.dataset.url = url;
    card.dataset.filename = fullFilename;
    
    card.innerHTML = `
      <div class="image-container">
        <img src="${escapeHtml(url)}" alt="Image ${index + 1}" loading="lazy">
      </div>
      <div class="image-info">
        <div class="filename" title="${escapeHtml(url)}">${escapeHtml(filename)}</div>
        <div class="meta">
          <span class="meta-resolution">—</span>
          <span class="meta-separator">•</span>
          <span class="meta-format">${format}</span>
          <span class="meta-separator">•</span>
          <span class="meta-size">—</span>
        </div>
        <div class="image-actions">
          <button class="btn-open">Open</button>
          <button class="btn-download">Download</button>
        </div>
      </div>
    `;
    
    // Get references to elements
    const img = card.querySelector('img');
    const resolutionEl = card.querySelector('.meta-resolution');
    const sizeEl = card.querySelector('.meta-size');
    const formatEl = card.querySelector('.meta-format');
    const btnOpen = card.querySelector('.btn-open');
    const btnDownload = card.querySelector('.btn-download');
    
    // Image click -> open
    img.addEventListener('click', () => openImage(url));
    
    // Image load -> update resolution
    img.addEventListener('load', () => {
      if (img.naturalWidth && img.naturalHeight) {
        resolutionEl.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
      }
      
      // Try to get file size (may fail due to CORS)
      fetchImageMeta(url, sizeEl, formatEl);
    });
    
    // Image error
    img.addEventListener('error', () => {
      img.classList.add('error');
      img.title = 'Failed to load';
      resolutionEl.textContent = 'Error';
    });
    
    // Button clicks
    btnOpen.addEventListener('click', () => openImage(url));
    btnDownload.addEventListener('click', () => downloadImage(url, fullFilename));
    
    grid.appendChild(card);
  });
}

async function fetchImageMeta(url, sizeEl, formatEl) {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      sizeEl.textContent = formatFileSize(parseInt(contentLength, 10));
    }
    
    // Update format from content-type if not detected from URL
    if (formatEl.textContent === '—') {
      const contentType = response.headers.get('content-type');
      if (contentType) {
        const mimeFormat = contentType.split('/')[1]?.split(';')[0]?.toUpperCase();
        if (mimeFormat) {
          formatEl.textContent = mimeFormat === 'JPEG' ? 'JPG' : mimeFormat;
        }
      }
    }
  } catch (e) {
    // CORS blocked, can't get size - that's ok
  }
}

// Filter functionality
document.getElementById('filter').addEventListener('input', (e) => {
  const filterText = e.target.value.toLowerCase();
  const filtered = allImages.filter(url => url.toLowerCase().includes(filterText));
  renderImages(filtered);
});

// Sort functionality
document.getElementById('sort').addEventListener('change', (e) => {
  const sortType = e.target.value;
  const filterText = document.getElementById('filter').value.toLowerCase();
  
  let filtered = allImages.filter(url => url.toLowerCase().includes(filterText));
  
  if (sortType === 'name') {
    filtered.sort((a, b) => {
      const nameA = getFilename(a).toLowerCase();
      const nameB = getFilename(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
  
  renderImages(filtered);
});
