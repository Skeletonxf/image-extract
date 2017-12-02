function run() {
  if (window.hasRun) {
    // don't run twice
    return
  }

  // runs the action function if the
  // setting is resolved to true, either
  // by the default being true or the
  // setting from the browser's local storage
  // being true, and runs the ifNot function
  // when not running the action function
  // if the ifNot function exists
  function doIf(setting, action, ifNot) {
    browser.storage.local.get(setting).then((r) => {
      // check user setting
      let doAction = defaults[setting]
      if (setting in r) {
        doAction = r[setting]
      }
      if (doAction) {
        action()
      } else {
        if (ifNot) {
          ifNot()
        }
      }
    })
  }

  let defaults = {
    Center : true,
    Realsize : false,
    Showbackgroundimages : false
  }

  // flag to avoid running twice
  window.hasRun = true

  // get all elements in the body
  let items = document.body.getElementsByTagName("*")

  // store copies of the data from the images
  let images = []

  // makes a copy of the image from the src and height/width
  function copyImage(old) {
    let image = new Image()
    image.src = old.src
    image.width = old.width
    image.height = old.height
    // use webpage image dimensions unless they are 0
    if (image.width === 0 || image.height === 0) {
      // set natural width on both to avoid distortion
      image.width = image.naturalWidth
      image.height = image.naturalWidth
    }
    // for restoring webpage sizes
    image.webpageWidth = image.width
    image.webpageHeight = image.height
    image.webpageSize = true
    // flag for hiding background images
    image.isBackgroundImage = old.isBackgroundImage
    return image
  }

  // runs a consumer on each image
  function forEachImage(consumer) {
    for (let i = 0; i < images.length; i++) {
      consumer(images[i])
    }
  }

  // avoid duplicates of the same background image
  let urls = new Set()

  // walk over the items and copy the images
  for (let i = 0; i < items.length; i++) {
    let element = items[i]
    if (element instanceof HTMLImageElement) {
      // copy images in body
      images.push(copyImage(element))
    }
    let computedStyle = window.getComputedStyle(element, null)
    if (computedStyle["backgroundImage"]) {
      if (computedStyle["backgroundImage"].substring(0, 3) === "url") {
        let style = computedStyle["backgroundImage"]
        // drop off url(" and ")
        let url = style.substring(5, style.length - 2)
        if (!urls.has(url)) {
          urls.add(url)
          // mock the background image into an object
          // for copyImage to work with
          images.push(copyImage({
            src: url,
            width: element.width,
            height: element.height,
            isBackgroundImage: true
          }))
        }
      }
    }
  }

  function logError(e) {
    console.log(`Error: ${e}`)
  }

  function jsonify(image) {
    return {
      "src" : image.src,
      "width" : image.width,
      "height" : image.height,
      "webpageWidth" : image.webpageWidth,
      "webpageHeight" : image.webpageHeight,
      "webpageSize" : image.webpageSize,
      "isBackgroundImage" : image.isBackgroundImage
    }
  }

  console.log("sending images")
  browser.runtime.sendMessage({
    "images" : images.map(jsonify)
  }).then(null, logError)

  // delete everything under the body
  while (document.body.firstChild) {
      document.body.firstChild.remove();
  }

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
