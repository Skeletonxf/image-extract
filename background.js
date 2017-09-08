"use strict";

function logError(e) {
  console.log(`Error: ${e}`)
}

function extractCurrent() {
  //console.log("being ran, getting active tab")
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
  //console.log("inserting css")
  browser.tabs.insertCSS(tab.id, {
    file : "/content.css"
  }).then((r) => {
    //console.log("css ok")
  }, logError)
  //console.log("and running script")
  browser.tabs.executeScript(tab.id, {
    file: "content_script.js"
  }).then((r) => {
    //console.log("js ok")
  }, logError)
  //console.log("finished")
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

//console.log("Image extract loaded")

//console.log("listening " + browser.browserAction.onClicked.hasListener(extractCurrent))
