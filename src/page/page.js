/**
 * Sets a list of attributes onto an element.
 * @param element element to set attributes on
 * @param attributes list of objects where name field
 *    is attribute name and value field is value of attribute to set.
 */
function setAttributes(element, attributes) {
    attributes.forEach((attribute) => {
        element.setAttribute(attribute.name, attribute.value)
    })
}

// makes a copy of the image from the src and height/width data
function copyImage(data) {
    let image = new Image()
    image.src = data.src
    image.width = data.width
    image.height = data.height
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
    image.type = data.type
    return image
}

function getTabIDForImages() {
    let params = new URLSearchParams(window.location.search)
    return params.get('sourceid')
}

function displayImages(imageDatas /* [ImageData] */) {
    // Lookup checkboxes
    let ui = {
        center: {
            checkbox: document.getElementById('CenterImageExtract')
        },
        size: {
            checkbox: document.getElementById('RealsizeImageExtract')
        },
        background: {
            checkbox: document.getElementById('ShowbackgroundimagesImageExtract')
        }
    }

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
        imageData.image = image
    })

    // Inform user how many background images were actually extracted
    let backgroundImagesCount = document.getElementById('BackgroundImagesCount')
    backgroundImagesCount.textContent = ` (${imageDatas.filter((i) => i.type === 'background').length})`

    // Make UI elements perform changes to page

    function toggleCenter() {
        // toggle the center style of each image
        imageDatas.forEach((imageData) => {
            imageData.image.classList.toggle('imageExtractCenterStyle')
        })
    }
    ui.center.checkbox.addEventListener('change', toggleCenter)

    function toggleSize() {
        // flip each image between its natural size and
        // the size it had on the webpage
        imageDatas.forEach((imageData) => {
            let image = imageData.image
            if (image.sizeType === 'webpage') {
                image.sizeType = 'naturalSize'
                // set image size to natural size of its url
                image.width = image.naturalWidth
                image.height = image.naturalHeight
            } else {
                image.sizeType = 'webpage'
                image.width = imageData.width
                image.height = imageData.height
            }
        })
    }
    ui.size.checkbox.addEventListener('change', toggleSize)

    function toggleShowBackground() {
        // flip the .hideImage style
        imageDatas.forEach((imageData) => {
            let image = imageData.image
            if (image.dataType === 'background') {
                image.classList.toggle("hideImage")
            }
        })
    }
    ui.background.checkbox.addEventListener('change', toggleShowBackground)

    // now apply user defaults
    // these must be last because the fetching from local storage
    // and port communication is async
    browser.runtime.sendMessage({getAllUISettings: true})
        .then((response) => {
            if (response.uiSettings) {
                if (response.centerImages) {
                    toggleCenter()
                    ui.center.checkbox.setAttribute('checked', 'true')
                } else {
                    ui.center.checkbox.removeAttribute('checked')
                }
                if (response.realSizeImages) {
                    toggleSize()
                    ui.size.checkbox.setAttribute('checked', 'true')
                } else {
                    ui.size.checkbox.removeAttribute('checked')
                }
                if (response.showBackgroundImages) {
                    ui.background.checkbox.setAttribute('checked', 'true')
                } else {
                    toggleShowBackground()
                    ui.background.checkbox.removeAttribute('checked')
                }
            }
        })
        .catch((error) => {
            console.error('Error getting UI settings', error)
        })
}

function run() {
    browser.runtime.sendMessage(
        {
            requestImages: true,
            tabID: getTabIDForImages()
        }
    ).then((response) => {
        displayImages(response.images)
    })
    .catch((error) => {
        console.error('Error getting images', error)
    })
}

document.addEventListener('DOMContentLoaded', (event) => {
    run()
})
