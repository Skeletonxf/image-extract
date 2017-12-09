"use strict";

function logError(e) {
  console.log(`Error: ${e}`)
}

let defaults = {
  Center : true,
  Realsize : false,
  Showbackgroundimages : false
}

let launchDefaults = {
  keyboardShortcut1Enabled : false,
  keyboardShortcut2Enabled : false,
  keyboardShortcut3Enabled : false
}

function restore() {
  for (let property in defaults) {
    browser.storage.local.get(property).then((r) => {
      let value = defaults[property]
      if (property in r) {
        value = r[property]
      }
      document.querySelector("#" + property + "ImageExtract").checked = value
    }, logError)
  }
  // TODO Refactor
  for (let property in launchDefaults) {
    browser.storage.local.get(property).then((r) => {
      let value = launchDefaults[property]
      if (property in r) {
        value = r[property]
      }
      document.querySelector("#" + property).checked = value
    }, logError) 
  }
}

function set(field, suffix) {
  suffix = suffix || ""
  let setting = {}
  setting[field] = document.querySelector("#" + field + suffix).checked
  browser.storage.local.set(setting)
}

document.addEventListener("DOMContentLoaded", restore)

for (let property in defaults) {
  document.querySelector("#" + property + "ImageExtract").addEventListener("change", () => {
    set(property, "ImageExtract")
  })
}

for (let property in launchDefaults) {
  document.querySelector("#" + property).addEventListener("change", () => {
    set(property)
  })
}
