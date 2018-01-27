"use strict";

document.addEventListener("DOMContentLoaded", () => {
  syncPage(defaults.ui)
  syncPage(defaults.shortcuts)
})

for (let property in
    Object.assign({},
        defaults.ui,
        defaults.shortcuts)) {
  document.querySelector("#" + property).addEventListener("change", () => {
    syncLocalStorage(property)
  })
}
