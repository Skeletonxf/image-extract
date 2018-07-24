function run() {
  if (window.hasRun) {
    // don't run twice
    return
  }

  // flag to avoid running twice
  window.hasRun = true

  // get all image data from the page
  let imageDatas = extractImages()

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

  // delete everything under the body
  while (document.body.firstChild) {
      document.body.firstChild.remove();
  }

  // Add the UI to the page
  let ui = buildUI()

  let images = []

  // fill the body with the copied images
  imageDatas.forEach((imageData) => {
    let image = document.createElement('img')
    setAttributes(image, [
      {
        name: 'src',
        value: imageData.url
      },
      {
        name: 'width',
        value: imageData.width
      },
      {
        name: 'height',
        value: imageData.height
      },
    ])
    document.body.appendChild(image)
    image.sizeType = 'webpage'
    image.dataType = imageData.type
    images.push(image)
  })

  // add message to user
  document.title = 'Refresh page to return - ' + document.title

  // Make UI elements perform changes to page

  function toggleCenter() {
    // toggle the center style of each image
    images.forEach((image) => {
      image.classList.toggle('imageExtractCenterStyle')
    })
  }
  ui.center.checkbox.addEventListener('change', toggleCenter)

  function toggleSize() {
    // flip each image between its natural size and
    // the size it had on the webpage
    images.forEach((image) => {
      if (image.sizeType === 'webpage') {
        image.sizeType = 'naturalSize'
        // set image size to natural size of its url
        image.width = image.naturalWidth
        image.height = image.naturalHeight
      } else {
        image.sizeType = 'webpage'
        // find will always return exactly 1 result as both
        // arrays are the same length and contain exactly
        // the same set of urls in their respective elements
        image.width = imageDatas.find(i => i.url === image.src).width
        image.height = imageDatas.find(i => i.url === image.src).height
      }
    })
  }
  ui.size.checkbox.addEventListener('change', toggleSize)

  function toggleShowBackground() {
    // flip the .hideImage style
    images.forEach((image) => {
      if (image.dataType === 'background') {
        image.classList.toggle("hideImage")
      }
    })
  }
  ui.background.checkbox.addEventListener('change', toggleShowBackground)

  // now apply user defaults
  // these must be last because the fetching from
  // local storage is async

  doIf('centerImages', defaults.ui, () => {
    toggleCenter()
    ui.center.checkbox.setAttribute('checked', 'true')
  }, () => {
    ui.center.checkbox.removeAttribute('checked')
  })

  doIf('realSizeImages', defaults.ui, () => {
    toggleSize()
    ui.size.checkbox.setAttribute('checked', 'true')
  }, () => {
    ui.size.checkbox.removeAttribute('checked')
  })

  doIf('showBackgroundImages', defaults.ui, () => {
    ui.background.checkbox.setAttribute('checked', 'true')
  }, () => {
    toggleShowBackground()
    ui.background.checkbox.removeAttribute('checked')
  })

  console.log('done')
}

run()
