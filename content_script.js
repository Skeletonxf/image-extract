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
    return image
  }

  function toggleCenter() {
    for (let i = 0; i < images.length; i++) {
      images[i].classList.toggle("imageExtractCenterStyle")
    }
  }

  function center() {
    for (let i = 0; i < images.length; i++) {
      images[i].classList.add("imageExtractCenterStyle")
    }
  }

  // walk over images
  for (let i = 0; i < items.length; i++) {
    // copy images in body
    images.push(copyImage(items[i]))
  }

  console.log(images.length + " images extracted")

  // delete everything under the body
  while (document.body.firstChild) {
      document.body.firstChild.remove();
  }

  // create container
  let container = document.createElement("div")
  container.setAttribute("id", "imageExtractUI")

  // add small checkbox
  let checkbox = document.createElement("input")
  checkbox.setAttribute("type", "checkbox")
  checkbox.setAttribute("name", "toggleDisplay")
  checkbox.setAttribute("value", "toggleDisplay")
  checkbox.setAttribute("id", "imageExtractToggle")
  checkbox.setAttribute("checked", "true")

  // add toggle function as event listen on change
  checkbox.addEventListener('change', toggleCenter)

  // add label
  let label = document.createElement("label")
  label.setAttribute("for", "imageExtractToggle")
  label.setAttribute("id", "imageExtractToggleLabel")
  label.innerHTML = "Center"

  // add to page
  document.body.appendChild(container)
  container.appendChild(checkbox)
  container.appendChild(label)

  // fill the body with the copied images
  for (let i = 0; i < images.length; i++) {
    document.body.appendChild(images[i])
  }

  // add message to user
  document.title = "Refresh page to return - " + document.title

  // center the images
  center()
}

run()
