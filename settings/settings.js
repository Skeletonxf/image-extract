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
