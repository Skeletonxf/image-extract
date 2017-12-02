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

  browser.runtime.sendMessage({
    "images" : images.map(jsonify)
  }).then(null, logError)

  // TODO Perform what was below in seperate content script
}

run()
