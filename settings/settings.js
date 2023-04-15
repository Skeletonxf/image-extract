import settings from '/src/settings.js'
import console from '/src/logger.js'

/**
 * Syncs the property checkboxes on the webpage to the default values
 * of these properties from local storage or their default value.
 */
let syncPage = async (properties /* [string] */) => {
    for (let property of properties) {
        let value = await settings.getKeyValue(property)
        document.querySelector("#" + property).checked = value
    }
}

let settingKeys = [
    'centerImages',
    'realSizeImages',
    'showBackgroundImages',
    'keyboardShortcut1Enabled',
    'keyboardShortcut2Enabled',
    'keyboardShortcut3Enabled'
]

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await syncPage(settingKeys)
    } catch (error) {
        console.error('Error syncing page to current setting values', error)
    }
})

/**
 * Syncs the corresponding local storage setting
 * to this value on the page
 */
let syncLocalStorage = async (property /* string */) => {
    await settings.setKeyValue(property, document.querySelector('#' + property).checked)
}

for (let property of settingKeys) {
    document.querySelector('#' + property).addEventListener('change', async () => {
        try {
            await syncLocalStorage(property)
        } catch (error) {
            console.error('Error syncing page to current setting values', error)
        }
    })
}

// will be undefined on android
if (browser.commands === undefined) {
    document.addEventListener('DOMContentLoaded', () => {
        // Disable settings that don't work on Android
        function disable(setting) {
            setting.style.opacity = 0.5
            setting.style.pointerEvents = 'none'
            let text = document.createElement('strong')
            text.textContent = 'Unsupported on your device/browser version'
            text.style.fontSize = 'large'
            text.style.color = 'darkred'
            setting.prepend(text)
        }
        disable(document.querySelector('#commandSettings'))
    })
}
