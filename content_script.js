function run() {
  if (window.hasRun) {
    // don't run twice
    return
  }
  // flag to avoid running twice
  window.hasRun = true

  // get all elements in the body
  let items = document.body.getElementsByTagName("*")

  // store copies of the images in the body
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
  function makeToggle(name, attributes, listener) {
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
    if (attributes.checked) { checkbox.setAttribute("checked", "true") }
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
  let center = makeToggle("Center", {
    checked : true
    },
    () => {
      // toggle the center style of each image
      forEachImage((image) => {
      image.classList.toggle("imageExtractCenterStyle")
      })
    }
  )

  // create a checkbox to toggle between webpage image sizes
  // and their actual dimensions
  let size = makeToggle("Real size", {
    checked : false
    },
    () => {
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
  )

  // create a checkbox to hide background images
  let hide = makeToggle("Show background images", {
    checked : false
    },
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

  forEachImage((image) => {
      // center the images by default
      image.classList.add("imageExtractCenterStyle")
      // hide background images by default
      if (image.isBackgroundImage) {
        image.classList.add("hideImage")
      }
  })
}

run()
