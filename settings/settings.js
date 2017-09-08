"use strict";

function logError(e) {
  console.log(`Error: ${e}`)
}

let defaults = {
  Center : true,
  Realsize : false,
  Showbackgroundimages : false
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
}

function set(field) {
  let setting = {}
  setting[field] = document.querySelector("#" + field + "ImageExtract").checked
  browser.storage.local.set(setting)
}

document.addEventListener("DOMContentLoaded", restore)

for (let property in defaults) {
  document.querySelector("#" + property + "ImageExtract").addEventListener("change", () => {
    set(property)
  })
}

