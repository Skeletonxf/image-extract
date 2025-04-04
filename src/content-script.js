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

/**
 * Builds the Image Extract UI into the page to control
 * the display of the extracted images.
 * Returns an object of UI elements to be given function.
 */
function buildUI() {
    // creates a toggle and label wrapped in a container for
    // injecting a basic UI into the page
    function makeToggle(name, checked, settingKey) {
        // make div to go around container
        let container = document.createElement("div")
        container.classList.add("imageExtractUI")
        // create an id from the setting key
        let id = settingKey + "ImageExtract"
        // make the checkbox
        let checkbox = document.createElement("input")
        checkbox.classList.add("imageExtractCheckbox")
        setAttributes(checkbox, [
            {
                name: 'type',
                value: 'checkbox'
            },
            {
                name: 'id',
                value: id
            }
        ])
        if (checked) {
            checkbox.setAttribute("checked", "true")
        }
        // make label
        let label = document.createElement("label")
        label.classList.add("imageExtractLabel")
        setAttributes(label, [
            {
                name: 'for',
                value: id
            }
        ])
        label.appendChild(document.createTextNode(name))
        // attatch the checkbox and label to the container
        container.appendChild(checkbox)
        container.appendChild(label)
        return {
            container: container,
            checkbox: checkbox
        }
    }

    // create a checkbox to toggle centering items
    let center = makeToggle('Center', true, 'centerImages')

    // create a checkbox to toggle image sizes
    let size = makeToggle('Real size', false, 'realSizeImages')

    // create a checkbox to hide background images
    let background = makeToggle('Show background images', false, 'showBackgroundImages')

    // create container for UI elements
    let container = document.createElement("div")
    setAttributes(container, [
        {
            name: 'id',
            value: 'imageExtractUIContainer'
        }
    ])

    // add UI to page
    document.body.appendChild(container)
    let firstRow = document.createElement("div")
    setAttributes(firstRow, [
        {
            name: 'id',
            value: 'imageExtractUIRow1'
        }
    ])
    let secondRow = document.createElement("div")
    setAttributes(secondRow, [
        {
            name: 'id',
            value: 'imageExtractUIRow2'
        }
    ])
    container.appendChild(firstRow)

    firstRow.appendChild(center.container)
    firstRow.appendChild(size.container)
    firstRow.appendChild(background.container)

    let confirm = makeToggle('Confirm before running', false, 'confirmBeforeRunningImageExtract')
    let info = document.createElement("p")
    info.textContent = "If set to confirm, Image Extract will display a confirmation dialog before running, allowing you to cancel if you didn't mean to. This can help prevent you from accidentally losing your tabs, but it adds an extra step."
    container.appendChild(info)
    container.appendChild(secondRow)
    secondRow.appendChild(confirm.container)

    // return checkboxes for applying logic on click to
    return {
        center: center,
        size: size,
        background: background,
        confirm: confirm
    }
}

/**
 * Returns an array of image data objects of all images
 * found on the page.
 */
function extractImages() {
    // get all elements in the body
    let elements = document.body.getElementsByTagName("*")

    // store copies of the data on the images in the body
    let images = []

    // avoid duplicates of the same background image
    let urls = new Set()

    Array.from(elements).forEach((element) => {
        if (element instanceof HTMLImageElement) {
            // detect image elements on the page
            let imageData = {
                url: element.src,
                width: element.offsetWidth,
                height: element.offsetHeight,
                type: 'element'
            }
            if (!urls.has(imageData.url)) {
                images.push(imageData)
                urls.add(imageData.url)
            }
        }

        // TODO Support data URIs
        // https://css-tricks.com/data-uris/

        let style = window.getComputedStyle(element)
        for (let rule of ['backgroundImage', 'background']) {
            if (style[rule]) {
                // match 'url' then '(' then as few characters as possible then ')'
                let re = /url\(.*?\)/
                let matches = style[rule].match(re)
                if (matches) {
                    matches.forEach((match) => {
                        // now we know exactly how the match is formatted we can pull
                        // the url out of it
                        let url = match.substring(5, match.length - 2)
                        let imageData = {
                            url: url,
                            width: element.offsetWidth,
                            height: element.offsetHeight,
                            type: 'background'
                        }
                        if (!urls.has(imageData.url)) {
                            images.push(imageData)
                            urls.add(imageData.url)
                        }
                    })
                }
            }
        }
    })

    return images
}

function run(imageDatas /* [ImageData] */, uiSettings) {
    // flag to avoid running twice
    window.hasRun = true

    // FIXME: This looks unused now?
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

    // add message to user
    document.title = 'Refresh page to return - ' + document.title

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

    if (uiSettings.centerImages) {
        toggleCenter()
        ui.center.checkbox.setAttribute('checked', 'true')
    } else {
        ui.center.checkbox.removeAttribute('checked')
    }
    if (uiSettings.realSizeImages) {
        toggleSize()
        ui.size.checkbox.setAttribute('checked', 'true')
    } else {
        ui.size.checkbox.removeAttribute('checked')
    }
    if (uiSettings.showBackgroundImages) {
        ui.background.checkbox.setAttribute('checked', 'true')
    } else {
        toggleShowBackground()
        ui.background.checkbox.removeAttribute('checked')
    }
    if (uiSettings.confirmBeforeRunningImageExtract) {
        ui.confirm.checkbox.setAttribute('checked', 'true')
    } else {
        ui.confirm.checkbox.removeAttribute('checked')
    }
}

function check() {
    if (window.hasRun) {
        // don't run twice
        return
    }

    let fetchingSettings = browser.runtime.sendMessage({getAllUISettings: true})

    // get all image data from the page
    let imageDatas = extractImages()

    fetchingSettings.then((response) => {
        if (response.uiSettings) {
            if (response.confirmBeforeRunningImageExtract) {
                if (window.confirm(`Run Image Extract and replace this tab's content with its ${imageDatas.length} images?`)) {
                    run(imageDatas, response)
                }
            } else {
                run(imageDatas, response)
            }
        } else {
            console.error('No UI settings returned in response', response)
        }
    })
    .catch((error) => {
        console.error('Error getting UI settings', error)
    })
}

// TODO: Add back in check for DOMContentLoaded here?
check()
