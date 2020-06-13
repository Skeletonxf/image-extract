import core from '/core/script.js'
import defaults from '/settings/defaults.js'

async function extractCurrent() {
    try {
        let tabs = await browser.tabs.query({
          active: true,
          currentWindow: true
        })
        // get the first (only) tab in the array to extract images from
        extract(tabs[0])
    } catch (error) {
        core.expect("Couldn't get active tab")(error)
    }
}

// launches the content script for the tab
function extract(tab) {
  /*
   * Result of browser.tabs.executeScript is
   * a Promise
   */
  function executeScript(filepath) {
    return browser.tabs.executeScript(tab.id, {
      file: filepath
    })
  }

  // CSS is not dependent on the JS injected into the page
  // and vice versa
  browser.tabs.insertCSS(tab.id, {
    file : "/content.css"
  }).catch(core.expect("Couldn't insert CSS into page"))

  async function insertJS() {
      try {
          // These can resolve in either order
          await Promise.all([
              executeScript('/content_scripts/build_ui.js'),
              executeScript('/content_scripts/extract_images.js')
          ])
          // This must run after its dependencies are added to the page
          await executeScript('/content_scripts/main.js')
      } catch (error) {
          core.expect("Couldn't insert JS into page")(error)
      }
  }
  insertJS()
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

// Expose a way to query the settings from the content script, this
// is not strictly necessary as it can be done directly from the content
// script, but the code to automatically consider default setting values
// is defined in /core/script.js which is used as a module and so cannot
// be a direct dependency of the content script code as that does not run
// as a JavaScript module. This avoids duplicating the logic.
browser.runtime.onConnect.addListener((port) => {
    if (port.name === 'querySettings') {
        port.onMessage.addListener((msg) => {
            if (msg.setting) {
                core.settings.doIf(msg.setting, defaults[msg.settingType], () => {
                    // respond that the setting is true
                    port.postMessage({
                        hasSetting: true,
                        settingValue: true,
                        settingType: msg.settingType,
                        settingName: msg.setting
                    })
                }, () => {
                    // respond that the setting is false
                    port.postMessage({
                        hasSetting: true,
                        settingValue: false,
                        settingType: msg.settingType,
                        settingName: msg.setting
                    })
                })
            }
        })
    }
})

// will be undefined on android
if (browser.commands) {
  browser.commands.onCommand.addListener((command) => {
    if (command === "extract-shortcut-1") {
      core.settings.doIf("keyboardShortcut1Enabled", defaults.shortcuts, () => {
        extractCurrent()
      })
    }
    if (command === "extract-shortcut-2") {
      core.settings.doIf("keyboardShortcut2Enabled", defaults.shortcuts, () => {
        extractCurrent()
      })
    }
    if (command === "extract-shortcut-3") {
      core.settings.doIf("keyboardShortcut3Enabled", defaults.shortcuts, () => {
        extractCurrent()
      })
    }
  })
}
