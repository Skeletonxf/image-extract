"use strict";

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
  }, logError)
}

//launches the content script for the tab
function extract(tab) {
  browser.tabs.insertCSS(tab.id, {
    file : "/content.css"
  }).then(null, logError)

  // TODO Find a way to not indent forever
  browser.tabs.executeScript(tab.id, {
    file: "/core/util.js"
  }).then(() => {
    browser.tabs.executeScript(tab.id, {
      file: "/settings/defaults.js"
    }).then(() => {
      browser.tabs.executeScript(tab.id, {
        file: '/content_scripts/extract_images.js'
      }).then(() => {
        browser.tabs.executeScript(tab.id, {
          file: "/content_scripts/build_ui.js"
        }).then(() => {
          browser.tabs.executeScript(tab.id, {
            file: "content_script.js"
          }).then(null, logError)
        }, logError)
      }, logError)
    }, logError)
  }, logError)
}

// listen for clicks on the icon to run the duplicate function
browser.browserAction.onClicked.addListener(extractCurrent)

let contextMenuId = "image-extract-menu"

// these will be undefined on android
if (browser.contextMenus) {
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
}

// will be undefined on android
if (browser.commands) {
  browser.commands.onCommand.addListener((command) => {
    if (command === "extract-shortcut-1") {
      doIf("keyboardShortcut1Enabled", defaults.shortcuts, () => {
        extractCurrent()
      })
    }
    if (command === "extract-shortcut-2") {
      doIf("keyboardShortcut2Enabled", defaults.shortcuts, () => {
        extractCurrent()
      })
    }
    if (command === "extract-shortcut-3") {
      doIf("keyboardShortcut3Enabled", defaults.shortcuts, () => {
        extractCurrent()
      })
    }
  })
}
