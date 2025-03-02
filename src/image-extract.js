import settings from '/src/settings.js'
import console from '/src/logger.js'

export default class ImageExtract {
    #imagesTabID = null
    #imagesTabIndex = null
    #images = []

    async extractImages(tab /* Tab */) {
        try {
            this.#imagesTabID = tab.id
            this.#images = []
            this.#imagesTabIndex = tab.index
            let js = await browser.scripting.executeScript({
                target: {
                    tabId: tab.id,
                },
                files: [ '/src/extraction-script.js' ],
            })
            await js
        } catch (error) {
            console.error('Error attempting to extract images', error)
        }
    }

    async receiveImages(images /* [ImageData] */) {
        this.#images = images
        let tabID = this.#imagesTabID
        let tabIndex = this.#imagesTabIndex
        if (tabID === null) {
            console.error('Unable to find tab ID for ', images)
            return
        }
        console.log('Images: ', images, 'for tab ', tabID)
        try {
            let newTab = await browser.tabs.create({
                url: `/src/page/page.html?sourceid=${tabID}`,
                active: true,
                index: tabIndex + 1,
            })
        } catch (error) {
            console.error('Error attempting to create extracted images tab', error)
        }
    }

    retrieveImages(tabID /* String */) /* -> [ImageData] */ {
        // Note that if the user manually refreshes a page with the Image
        // Extract UI, it will ask us again for the same tab ID, so we should
        // not clear our cache of the last extracted images as we could be asked
        // multiple times.
        if (parseInt(tabID, 10) === this.#imagesTabID) {
            return this.#images ?? []
        } else {
            return []
        }
    }
}
