function run() {
// TODO Call only after recieving the images

  // sets all attributes in an image
  function setAttributes(element, attributes) {
    for (let i = 0; i < attributes.length; i++) {
      element.setAttribute(attributes[i].name, attributes[i].value)
    }
  }

  // creates a toggle and label wrapped in a container for
  // injecting a basic UI into the page
  function makeToggle(name, checked, listener) {
    // make div to go around container
    let container = document.createElement("div")
    container.classList.add("imageExtractUI")
    // create an id from the name
    // remove spaces in the label name for creating the id
    let id = name.split(' ').join('') + "ImageExtract"
    // make the checkbox
    let checkbox = document.createElement("input")
    checkbox.classList.add("imageExtractCheckbox")
    setAttributes(checkbox, [
      {name: "type", value: "checkbox"},
      {name: "name", value: name},
      {name: "value", value: name},
      {name: "id", value: id}
    ])
    if (checked) {
      checkbox.setAttribute("checked", "true")
    }
    // make label
    let label = document.createElement("label")
    label.classList.add("imageExtractLabel")
    setAttributes(label, [
      {name: "for", value: id}
    ])
    label.appendChild(document.createTextNode(name))
    // add event listener on change
    checkbox.addEventListener('change', listener)
    // attatch the checkbox and label to the container
    container.appendChild(checkbox)
    container.appendChild(label)
    return container
  }

  // create a checkbox to toggle centering items
  let center = makeToggle("Center",
    true,
    () => {
      // toggle the center style of each image
      forEachImage((image) => {
      image.classList.toggle("imageExtractCenterStyle")
      })
    }
  )

  function toggleSize() {
    // flip each image between its natural size and
    // the size it had on the webpage
    forEachImage((image) => {
      if (image.webpageSize) {
        image.webpageSize = false
        image.width = image.naturalWidth
        image.height = image.naturalHeight
      } else {
        image.webpageSize = true
        image.width = image.webpageWidth
        image.height = image.webpageHeight
      }
    })
  }

  // create a checkbox to toggle between webpage image sizes
  // and their actual dimensions
  let size = makeToggle("Real size",
    false,
    toggleSize
  )

  // create a checkbox to hide background images
  let hide = makeToggle("Show background images",
    false,
    () => {
      // flip the .hideImage style
      forEachImage((image) => {
        if (image.isBackgroundImage) {
          image.classList.toggle("hideImage")
        }
      })
    }
  )

  // create container for UI elements
  let container = document.createElement("div")
  container.setAttribute("id", "imageExtractUIContainer")

  // add UI to page
  document.body.appendChild(container)
  container.appendChild(center)
  container.appendChild(size)
  container.appendChild(hide)

  // fill the body with the copied images
  forEachImage((image) => {
    document.body.appendChild(image)
  })

  // add message to user
  document.title = "Refresh page to return - " + document.title

  // now apply user defaults
  // these must be last because the fetching from
  // local storage is async

  doIf("Center", () => {
    forEachImage((image) => {
      // center the images if set as default
      image.classList.add("imageExtractCenterStyle")
    })
  }, () => {
    center.firstElementChild.removeAttribute("checked")
  })

  doIf("Realsize", () => {
    toggleSize()
    size.firstElementChild.setAttribute("checked", "true")
  }, null)

  doIf("Showbackgroundimages", () => {
    hide.firstElementChild.setAttribute("checked", "true")
  }, () => {
    forEachImage((image) => {
      // hide background images by default
      if (image.isBackgroundImage) {
        image.classList.add("hideImage")
      }
    })
  })
}

run()
