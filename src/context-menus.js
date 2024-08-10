const contextMenuId = 'image-extract-menu'

export default class ContextMenus {
    registerContextMenu(listener /* (Tab) -> () */) {
        // will be undefined on android
        if (browser.menus) {
            this.#registerContextMenu(contextMenuId, listener)
        }
    }

    addContextMenu(listener /* (Tab) -> () */) {
        // will be undefined on android
        if (browser.menus) {
            this.#addContextMenu(contextMenuId, 'Extract Images', listener)
        }
    }

    removeContextMenu(listener /* (Tab) -> () */) {
        // will be undefined on android
        if (browser.menus) {
            this.#removeContextMenu(contextMenuId, listener)
        }
    }

    #registerContextMenu(id, listener) {
        browser.menus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === id) {
                listener(tab)
            }
        })
    }

    #addContextMenu(id, title, listener) {
        browser.menus.create({
            id: id,
            title: title,
            contexts: [ 'tab' ]
        })
    }

    #removeContextMenu(id, listener) {
        browser.menus.remove(id)
    }
}
