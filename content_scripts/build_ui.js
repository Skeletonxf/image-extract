/**
 * Builds the Image Extract UI into the page to control
 * the display of the extracted images.
 * Returns an object of UI elements to be given function.
 */
function buildUI() {
  // creates a toggle and label wrapped in a container for
  // injecting a basic UI into the page
  function makeToggle(name, checked) {
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
  let center = makeToggle('Center', true)

  // create a checkbox to toggle image sizes
  let size = makeToggle('Real size', false)

  // create a checkbox to hide background images
  let background = makeToggle('Show background images', false)

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
  container.appendChild(center.container)
  container.appendChild(size.container)
  container.appendChild(background.container)

  // return checkboxes for applying logic on click to
  return {
    center: center,
    size: size,
    background: background
  }
}
