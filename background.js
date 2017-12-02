"use strict";

function logError(e) {
  console.log(`Error: ${e}`)
}

let defaults = {
  keyboardShortcut1Enabled : false,
  keyboardShortcut2Enabled : false,
  keyboardShortcut3Enabled : false,
  extractInNewTab : false
}

// TODO put single copy in one file
function doIf(setting, action, ifNot) {
  browser.storage.local.get(setting).then((r) => {
    // check user setting
    let doAction = defaults[setting]
    if (setting in r) {
      doAction = r[setting]
    }
    if (doAction) {
      action()
    } else {
      if (ifNot) {
        ifNot()
      }
    }
  })
}

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

// launches the content script for the tab
function extract(tab) {
  browser.tabs.insertCSS(tab.id, {
    file : "/content.css"
  }).then(null, logError)
  browser.tabs.executeScript(tab.id, {
    file: "find_images.js"
  }).then(null, logError)
}

function logImageDetails(i) {
  console.log(i.src)
}

const extractUrl = browser.extension.getURL("extracted/extracted.html");

browser.runtime.onMessage.addListener((message) => {
  //message.images.forEach(logImageDetails)
  browser.tabs.create({"url":extractUrl}).then((tab) => {
    console.log("created the tab " + tab.id)
    browser.tabs.insertCSS(tab.id, {
      file : "/content.css"
    }).then(null, logError)
    // TODO Insert split second half of build_page.js
    // Hand over message image data to display in page
  }, logError)
})

// listen for clicks on the icon to run the extract function
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
      doIf("keyboardShortcut1Enabled", () => {
        extractCurrent()
      })
    }
    if (command === "extract-shortcut-2") {
      doIf("keyboardShortcut2Enabled", () => {
        extractCurrent()
      })
    }
    if (command === "extract-shortcut-3") {
      doIf("keyboardShortcut3Enabled", () => {
        extractCurrent()
      })
    }
  })
}
