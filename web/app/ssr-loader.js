/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/*
 The SSR-loader is a cut-down version of loader.js that sets up the correct
 environment for main.js.
 */

/* global MESSAGING_SITE_ID, MESSAGING_ENABLED, DEBUG, AJS_SLUG */
/* eslint import/no-commonjs:0 */

import {
    getAssetUrl,
    getBuildOrigin,
    initCacheManifest,
    loadAsset
} from 'progressive-web-sdk/dist/asset-utils'
import buildCacheHashManifest from '../tmp/loader-cache-hash-manifest.json'
import {
    loadAndInitMessagingClient
} from './utils/loader-utils'
import {
    setPerformanceValues,
    trackFirstPaints,
    trackTTI,
    triggerSandyAppStartEvent
} from 'progressive-web-sdk/dist/utils/loader-utils/performance-timing'
import {loadWorker} from 'progressive-web-sdk/dist/utils/loader-utils/service-worker-setup'
import {
    loaderLog,
    setLoaderDebug
} from 'progressive-web-sdk/dist/utils/loader-utils/loader-logging'
import {loadScript, browserSupportsMessaging} from 'progressive-web-sdk/dist/utils/utils'


const BUILD_ORIGIN = getBuildOrigin()
const messagingEnabled = MESSAGING_ENABLED  // replaced at build time
// Set this flag according to whether this browser is capable of
// supporting Messaging. This is a separate check from whether
// Messaging has been enabled (in package.json).
const MESSAGING_SUPPORTED = browserSupportsMessaging()


export const debugLog = (...args) => {
    if (DEBUG) {
        console.log('[ssr-loader]', ...args)
    }
}

setLoaderDebug(DEBUG)

loaderLog(`Build origin is '${BUILD_ORIGIN}'`)

// Polyfills - requiring them will install them if needed. We always include
// them, since loading them asynchronously is slow, and unless they're
// installed by the time main.js is evaluated, it's possible that module
// initialization code will fail if it relies on a polyfilled feature.
import 'core-js/es6/array' // Array.fill and Array.find
import 'core-js/es6/promise'    // Promise
import 'core-js/es6/string' // string.includes
import 'whatwg-fetch'                   // window.fetch
import 'url-polyfill'

// Configure window.Progressive fully
window.Progressive = window.Progressive || {}
Object.assign(
    window.Progressive,
    {
        AstroPromise: Promise.resolve({}),
        Messaging: {
            enabled: MESSAGING_ENABLED, // replaced at build time
        },
        // resolve this with an undefined value to make the
        // client load the original page (i.e., there is no
        // captured text).
        capturedDocHTMLPromise: Promise.resolve()
    }
)

setPerformanceValues()

// Get the cacheHashManifest that we're going to use. A local dev server
// will have embedded one in window.Progressive, but for a non-local
// server, we'll use the one imported into this file.
const cacheHashManifest = (
    window.Progressive.cacheHashManifest || buildCacheHashManifest
)

initCacheManifest(cacheHashManifest)

// Track First Paint and First Contentful Paint for PWA and non-PWA
trackFirstPaints()

/**
 * Do the preloading preparation for the Messaging client.
 * This includes any work that does not require a network fetch or
 * otherwise slow down initialization.
 *
 * If either messagingEnabled or MESSAGING_SUPPORTED are false,
 * then we don't load the Messaging PWA client. The Messaging
 * service worker code is still included, but won't be configured
 * and will do nothing.
 *
 * @param serviceWorkerSupported {Boolean} true if the service worker
 * has successfully loaded and is ready. False if there was a failure.
 * @param pwaMode {Boolean} passed to the Messaging client initialization.
 * @returns {Promise.<*>} that resolves when the client is loaded and
 * initialized, with the initial messaging state value (from
 * the Messaging client's init()). If messaging is not enabled,
 * returns a Promise that resolves to null (we don't reject because
 * that would lead to console warnings about uncaught rejections)
 */
const setupMessagingClient = (serviceWorkerSupported, pwaMode) => {
    if (serviceWorkerSupported) {
        // We need to create window.Mobify.WebPush.PWAClient
        // at this point. If a project is configured to use
        // non-progressive Messaging, it will load the
        // webpush-client-loader, which will then detect that
        // window.Mobify.WebPush.PWAClient exists and do nothing.
        window.Mobify = window.Mobify || {}
        window.Mobify.WebPush = window.Mobify.WebPush || {}
        window.Mobify.WebPush.PWAClient = {}

        if (messagingEnabled && MESSAGING_SUPPORTED) {
            // We know we're not running in Astro, that the service worker is
            // supported and loaded, and messaging is enabled and supported,
            // so we can load and initialize the Messaging client, returning
            // the promise from init().
            return loadAndInitMessagingClient(DEBUG, MESSAGING_SITE_ID, pwaMode)
        }
    }

    return Promise.resolve(null)
}

const initializeApp = () => {
    debugLog('initializeApp')
    try {
        trackTTI()
    } catch (e) {
        if (typeof console !== 'undefined') {
            console.error(e.message)
        }
    }

    // Load the service worker
    // Attempt to load the worker, in PWA mode
    (('serviceWorker' in navigator)
        ? loadWorker(true, MESSAGING_ENABLED, cacheHashManifest, true)
        : Promise.resolve(false)
    ).then((serviceWorkerSupported) => {
        // Start the process of fetching and initializing the
        // Messaging client, in PWA mode.
        setupMessagingClient(serviceWorkerSupported, true)
    })

    // Schedule Sandy setup
    triggerSandyAppStartEvent(true, AJS_SLUG)

    loadAsset('link', {
        href: getAssetUrl('main.css'),
        rel: 'stylesheet',
        type: 'text/css',
        // Tell us when the stylesheet has loaded so we know when it's safe to
        // display the app! This prevents a flash of unstyled content.
        onload: 'window.Progressive.stylesheetLoaded = true;'
    })

    loadScript({
        id: 'progressive-web-jquery',
        src: getAssetUrl('static/js/jquery.min.js')
    })

    loadScript({
        id: 'capture-js',
        src: '//cdn.mobify.com/capturejs/capture-latest.min.js'
    })

    loadScript({
        id: 'progressive-web-main',
        src: getAssetUrl('main.js')
    })

    loadScript({
        id: 'progressive-web-vendor',
        src: getAssetUrl('vendor.js')
    })
}

initializeApp()
