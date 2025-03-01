import settings from '/src/settings.js'
import console from '/src/logger.js'

export default class ImageExtract {
    async extractImages(tab /* Tab */) {
        try {
            let js = await browser.scripting.executeScript({
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

    // async showExtractedImages() {
    //     try {
    //         let tab = await browser.tabs.create({
    //             url: '/src/page/page.html',
    //             active: true,
    //             // TODO: Consider putting this new tab just after the old tab if
    //             // possible
    //         })
    //     } catch (error) {
    //         console.error('Error attempting to create extracted images tab', error)
    //     }
    // }
    //
    // async extractImages(tab /* Tab */) {
    //     try {
    //         let js = await browser.scripting.executeScript({
    //             target: {
    //                 tabId: tab.id,
    //             },
    //             files: [ "/src/extraction-script.js" ],
    //         })
    //         await js
    //     } catch (error) {
    //         console.error('Error attempting to extract images', error)
    //     }
    // }
}
