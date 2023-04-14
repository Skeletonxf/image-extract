import settings from '/src/settings.js'
import console from '/src/logger.js'
import ContextMenus from '/src/context-menus.js'
import ImageExtract from '/src/image-extract.js'
import Shortcuts from '/src/shortcuts.js'

let imageExtract = new ImageExtract()
let contextMenus = new ContextMenus()
let shortcuts = new Shortcuts()

let extractTab = imageExtract.extractImages.bind(imageExtract)

// listen for clicks on the icon to run the extract function
browser.action.onClicked.addListener(extractTab)

contextMenus.registerContextMenu(extractTab)
shortcuts.registerKeyboardShortcuts(extractTab)

function refreshContextMenus() {
    // will be undefined on android
    if (browser.contextMenus) {
        // add a right click extract menu to tabs
        contextMenus.addContextMenu(extractTab)
    }
}

browser.runtime.onInstalled.addListener(() => {
    console.log('Installed')
    refreshContextMenus()
})

browser.runtime.onStartup.addListener(() => {
    console.log('Started')
})

browser.runtime.onSuspend.addListener(() => {
    console.log('Suspending')
})

let querySettings = async (port, msg) => {
    try {
        if (msg.setting) {
            let value = await settings.getKeyValue(msg.setting)
            // respond with the setting value
            port.postMessage({
                hasSetting: true,
                settingValue: value,
                settingType: msg.settingType,
                settingName: msg.setting
            })
        }
    } catch (error) {
        console.error('Error responding to message', error, msg)
    }
    return true
}

browser.runtime.onConnect.addListener((port) => {
    // From MDN: If you only want the listener to respond to messages of a
    // certain type, you must define the listener as a non-async function,
    // and return a Promise only for the messages the listener is meant to
    // respond to and otherwise return false or undefined:
    if (port.name === 'querySettings') {
        port.onMessage.addListener((msg) => {
            return querySettings(port, msg)
        })
    } else {
        return false
    }
})
