/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2017 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import {loadScriptAsPromise} from 'progressive-web-sdk/dist/utils/utils'

export const prefetchLink = ({href}) => {
    const link = document.createElement('link')

    // Setting UTF-8 as our encoding ensures that certain strings (i.e.
    // Japanese text) are not improperly converted to something else. We
    // do this on the vendor scripts also just in case any libs we
    // import have localized strings in them.
    link.charset = 'utf-8'
    link.href = href
    link.rel = 'prefetch'

    document.getElementsByTagName('head')[0].appendChild(link)
}

const MESSAGING_PWA_CLIENT_PATH = 'https://webpush-cdn.mobify.net/pwa-messaging-client.js'

// Creating an early promise that users of the Messaging Client can
// chain from means they don't need to poll for its existence
const logMessagingSetupError = () => console.error('`LoaderUtils.createGlobalMessagingClientInitPromise` must be called before `setupMessagingClient`')
let clientInitResolver = logMessagingSetupError
let clientInitRejecter = logMessagingSetupError
export const createGlobalMessagingClientInitPromise = (messagingEnabled) => {
    if (!messagingEnabled || window.Progressive.MessagingClientInitPromise) {
        return
    }

    window.Progressive.MessagingClientInitPromise = new Promise((resolve, reject) => {
        clientInitResolver = resolve
        clientInitRejecter = reject
    })
}

/**
 * Start the asynchronous loading and intialization of the Messaging client,
 * storing a Promise in window.Progressive.MessagingClientInitPromise that
 * is resolved when the load and initialization is complete. If either load
 * or init fails, the Promise is rejected.
 * @returns {Promise.<*>} the same Promise
 */
export const loadAndInitMessagingClient = (debug, siteId, pwaMode) => {
    loadScriptAsPromise({
        id: 'progressive-web-messaging-client',
        src: MESSAGING_PWA_CLIENT_PATH,
        rejectOnError: true
    })
        .then(() => (
            // We assume window.Progressive will exist at this point.
            window.Progressive.MessagingClient
                .init({debug, siteId, pwaMode})
                .then(clientInitResolver)
        ))
        /**
         * Potential errors:
         * - URIError thrown by `loadScriptAsPromise` rejection
         * - TypeError from `messagingClient.init` being undefined
         * - expected error if Messaging is unavailable on the device (i.e. Safari)
         */
        .catch(clientInitRejecter)

    return window.Progressive.MessagingClientInitPromise
}


