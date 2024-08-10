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
    // add a right click extract menu to tabs
    contextMenus.addContextMenu(extractTab)
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

// Expose the UI settings to the content script
let getAllUISettings = async () => {
    try {
        const { centerImages, realSizeImages, showBackgroundImages } = await settings.getMultipleKeyValues(
            ['centerImages', 'realSizeImages', 'showBackgroundImages']
        )
        return {
            uiSettings: true,
            centerImages: centerImages,
            realSizeImages: realSizeImages,
            showBackgroundImages: showBackgroundImages
        }
    } catch (error) {
        console.error('Failed to get UI settings', error)
    }
    return true
}
browser.runtime.onMessage.addListener((data, sender) => {
    // From MDN: If you only want the listener to respond to messages of a
    // certain type, you must define the listener as a non-async function,
    // and return a Promise only for the messages the listener is meant to
    // respond to and otherwise return false or undefined:
    if (data.getAllUISettings === true) {
        return getAllUISettings()
    } else {
        return false;
    }
})
