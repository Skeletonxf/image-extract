/**
 * Returns an array of image data objects of all images
 * found on the page.
 */
function extractImages() {
  console.log('extracting images')

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
    ;['backgroundImage', 'background'].forEach((rule) => {
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
    })
  })

  console.log('urls', urls)
  console.log('images', images)

  return images
}
