function run() {
  if (window.hasRun) {
    // don't run twice
    return
  }
  // flag to avoid running twice
  window.hasRun = true

  // get all images in the body
  let items = document.body.getElementsByTagName("img")

  // store copies of the images in the body
  let images = []

  // makes a copy of the image from the src and height/width
  function copyImage(old) {
    let image = new Image()
    image.src = old.src
    image.width = old.width
    image.height = old.height
    // for restoring webpage sizes
    image.webpageWidth = old.width
    image.webpageHeight = old.height
    image.webpageSize = true
    return image
  }

  // runs a consumer on each image
  function forEachImage(consumer) {
    for (let i = 0; i < images.length; i++) {
      consumer(images[i])
    }
  }

  // walk over the images and copy them
  for (let i = 0; i < items.length; i++) {
    // copy images in body
    images.push(copyImage(items[i]))
  }

  //console.log(images.length + " images extracted")

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
    label.innerHTML = name
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

  // create container for UI elements
  let container = document.createElement("div")
  container.setAttribute("id", "imageExtractUIContainer")

  // add UI to page
  document.body.appendChild(container)
  container.appendChild(center)
  container.appendChild(size)

  // fill the body with the copied images
  forEachImage((image) => {
    document.body.appendChild(image)
  })

  // add message to user
  document.title = "Refresh page to return - " + document.title

  // center the images by default
  forEachImage((image) => {
      image.classList.add("imageExtractCenterStyle")
  })
}

run()
