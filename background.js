function extractCurrent() {
  // get a Promise to retrieve the current tab
  var gettingActiveTab = browser.tabs.query({
    active: true, 
    currentWindow: true
  })

  // get the activate tab to extract from the Promise
  gettingActiveTab.then((tabs) => {
    // get the first (only) tab in the array to duplicate
    extract(tabs[0])
  })
}

// launches the content script for the tab
function extract(tab) {
  browser.tabs.executeScript(tab.id, {
    file: "content_script.js"
  })
}

// listen for clicks on the icon to run the duplicate function
browser.browserAction.onClicked.addListener(extractCurrent)

let contextMenuId = "image-extract-menu"

// add a right click extract menu to tabs
browser.contextMenus.create({
  id: contextMenuId,
  title: "Extract Images",
  contexts: ["tab"]
})

// listen to the context menu being clicked
browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case contextMenuId:
      extract(tab)
      break;
  }
})
