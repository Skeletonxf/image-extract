import settings from '/src/settings.js'

export default class Shortcuts {
    async extractActiveTab(listener /* (Tab) -> () */, key /* string */) {
        let shortcutEnabled = await settings.getKeyValue(key)
        if (shortcutEnabled !== true) {
            return
        }
        let tabs = await browser.tabs.query({
            active: true,
            currentWindow: true
        })
        // get the first (only) tab in the array to extract
        let tab = tabs[0]
        listener(tab)
    }

    registerKeyboardShortcuts(
        listener /* (Tab) -> () */,
    ) {
        // will be undefined on android
        if (browser.commands) {
            browser.commands.onCommand.addListener((command) => {
                if (command === 'extract-shortcut-1') {
                    this.extractActiveTab(listener, 'keyboardShortcut1Enabled')
                }
                if (command === 'extract-shortcut-2') {
                    this.extractActiveTab(listener, 'keyboardShortcut2Enabled')
                }
                if (command === 'extract-shortcut-3') {
                    this.extractActiveTab(listener, 'keyboardShortcut3Enabled')
                }
            })
        }
    }
}
