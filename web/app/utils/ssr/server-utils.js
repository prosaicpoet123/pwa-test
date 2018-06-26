/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* global WEBPACK_SITE_URL */


import uncss from 'uncss'
import path from 'path'
import fs from 'fs'
import URL from 'urlutils'
import proxy from 'http-proxy-middleware'
import mimeTypes from 'mime-types'
import {VIEWPORT_SIZE_NAMES} from './constants'

let bundleBaseURL
const bundleID = process.env.BUNDLE_ID

export const setBundleBaseUrl = (remote) => {
    bundleBaseURL = remote ? `/mobify/bundle/${bundleID}/` : 'https://localhost:3443/build/'
}

export const getBundleBaseUrl = () => bundleBaseURL

export const getAssetUrl = (path) => `${bundleBaseURL}${path}`

/**
* Given the HTML for a page, run uncss on it and return the
* optimized stylesheet.
* @param html {String} - the HTML (including links to the main stylesheet)
* @returns {Promise.<String>} optimized stylesheet.
*/
export const optimizeCSS = (html) => {
    return new Promise((resolve, reject) => {
        uncss(
           html,
            {
                stylesheets: ['./build/main.css']
            },
           (err, output) => {
               if (output) {
                   resolve(output)
               } else if (err) {
                   reject(err)
               }
           }
       )
    })
}

export const setPreconnectHeaders = (res, requestedProtocol) => {
    // Put preconnect links in the headers also, to give the browser
    // a chance to start them asap.
    const linkHeaderValues = []

    // Other preconnect/preload/prefetch link values should be pushed
    // onto linkHeaderValues here.
    linkHeaderValues.push(
        // Preconnect to the online checker
        `<${requestedProtocol}://online.mobify.net>;REL=preconnect`,
    )

    // Set all the link header values in one go (ExpressJS has issues
    // with setting the same header multiple times).
    res.set(
        'Link',
        linkHeaderValues.join(', ')
    )
}


/**
 * Set the headers for a bundle asset. This is used only in local
 * dev server mode.
 * @param res - the response object
 * @param assetPath - the path to the asset file (with no query string
 * or other URL elements)
 */
export const setAssetHeaders = (res, assetPath) => {
    const base = path.basename(assetPath)
    const contentType = mimeTypes.lookup(base)

    res.set('content-type', contentType) // || 'application/octet-stream'

    // Stat the file and return the last-modified Date
    // in RFC1123 format. Also use that value as the ETag
    // and Last-Modified
    const mtime = fs.statSync(assetPath).mtime
    const mtimeRFC1123 = mtime.toUTCString()
    res.set('date', mtimeRFC1123)
    res.set('last-modified', mtimeRFC1123)
    res.set('etag', mtime.getTime())

    // Set cache control. Because
    // we use cachebreakers set according to the most recently updated
    // file in the 'build' directory (see the logic in ssr() that
    // generates a cacheHashManifest), we can set relatively long cache
    // times (for a development server).
    res.set('cache-control', 'max-age=300, s-max-age=300')
}


export const originalSiteOrigin = () => (new URL(WEBPACK_SITE_URL)).origin

export const setBaseProxy = (proxyPath, targetDomain) => {
    return proxy({
        target: targetDomain,
        changeOrigin: true,
        pathRewrite: {
            [`^${proxyPath}`]: ''
        },
        onError: (err, req, res) => {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            })
            res.end('Something went wrong')
        }
    })
}

const isHeaderValueTrue = (req, headerKey) => (req.header(headerKey) || '').toLowerCase() === 'true'


export const getBrowserSize = (req, remote) => {
    let browserSize = VIEWPORT_SIZE_NAMES.LARGE
    if (remote) {
        if (isHeaderValueTrue(req, 'CloudFront-Is-Mobile-Viewer')) {
            browserSize = VIEWPORT_SIZE_NAMES.SMALL
        } else if (isHeaderValueTrue(req, 'CloudFront-Is-Tablet-Viewer')) {
            browserSize = VIEWPORT_SIZE_NAMES.MEDIUM
        }
    } else {
        const requestingUA = req.get('user-agent')
        if ((/ip(hone|od)/i.test(requestingUA) || /android.*mobile/i.test(requestingUA))) {
            browserSize = VIEWPORT_SIZE_NAMES.SMALL
        } else if ((/ipad/i.test(requestingUA) || /android/i.test(requestingUA))) {
            browserSize = VIEWPORT_SIZE_NAMES.MEDIUM
        }
    }

    return browserSize
}
