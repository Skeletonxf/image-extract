import core from '/core/script.js'
import defaults from '/settings/defaults.js'

document.addEventListener('DOMContentLoaded', () => {
  core.settings.syncPage(defaults.ui)
  core.settings.syncPage(defaults.shortcuts)
})

for (let property in
    Object.assign({},
        defaults.ui,
        defaults.shortcuts)) {
  document.querySelector('#' + property).addEventListener('change', () => {
    core.settings.syncLocalStorage(property)
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
