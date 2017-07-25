function run() {
  if (window.hasRun) {
    // don't run twice
    return
  }
  // flag to avoid running twice
  window.hasRun = true

  // get all items in the body
  let items = document.body.getElementsByTagName("*")

  // store copies of the images in the body
  let images = []

  // makes a copy of the image from the src and height/width
  function copyImage(old) {
    let image = new Image()
    image.src = old.src
    image.width = old.width
    image.height = old.height
    // centred in the page
    image.style.marginLeft = "auto"
    image.style.marginRight = "auto"
    image.style.display = "block"
    return image
  }

  // walk over entire body
  for (let i = 0; i < items.length; i++) {
    // check if the item is an Image element
    if (items[i] instanceof HTMLImageElement) {
      // copy images in body
      images.push(copyImage(items[i]))
    }
  }

  // delete everything under the body
  while (document.body.firstChild) {
      document.body.firstChild.remove();
  }

  // fill the body with the copied images
  for (let i = 0; i < images.length; i++) {
    document.body.appendChild(images[i])
  }

  // add message to user
  document.title = "Refresh page to return - " + document.title
}

run()
