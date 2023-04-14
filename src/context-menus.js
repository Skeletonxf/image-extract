const contextMenuId = 'image-extract-menu'

export default class ContextMenus {
    registerContextMenu(listener /* (Tab) -> () */) {
        this.#registerContextMenu(contextMenuId, listener)
    }

    addContextMenu(listener /* (Tab) -> () */) {
        this.#addContextMenu(contextMenuId, 'Extract Images', listener)
    }

    removeContextMenu(listener /* (Tab) -> () */) {
        this.#removeContextMenu(contextMenuId, listener)
    }

    #registerContextMenu(id, listener) {
        browser.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === id) {
                listener(tab)
            }
        })
    }

    #addContextMenu(id, title, listener) {
        browser.contextMenus.create({
            id: id,
            title: title,
            contexts: [ 'tab' ]
        })
    }

    #removeContextMenu(id, listener) {
        browser.contextMenus.remove(id)
    }
}
