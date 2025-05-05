import settings from '/src/settings.js'
import console from '/src/logger.js'

export default class ImageExtract {
    async extractImages(tab /* Tab */) {
        try {
            let js = browser.scripting.executeScript({
                target: {
                    tabId: tab.id,
                },
                files: [ "/src/content-script.js" ],
            })
            let css = browser.scripting.insertCSS({
                target: {
                    tabId: tab.id,
                },
                files: [ "/src/content.css" ],
            })
            await js
            await css
        } catch (error) {
            console.error('Error attempting to extract images', error)
        }
    }
}
