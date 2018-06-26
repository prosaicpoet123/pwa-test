/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* global WEBPACK_SITE_URL WEBPACK_PROXY1_HOST WEBPACK_PROXY2_HOST WEBPACK_PROXY1_PATH WEBPACK_PROXY2_PATH */
/* eslint import/no-commonjs:0 */

const compression = require('compression')
const express = require('express')
const expressLogging = require('morgan')
const fetch = require('node-fetch')
const simpleProxy = require('express-http-proxy')
const walkTree = require('walk')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const path = require('path')
const fs = require('fs')
const JsDom = require('jsdom')

import {Script} from 'vm'
import {WEBPACK_LOADER_SCRIPT} from './constants'
import {initCacheManifest} from 'progressive-web-sdk/dist/asset-utils'
import builtCacheHashManifest from '../../../tmp/cache-hash-manifest.json'
import {
    getAssetUrl,
    optimizeCSS,
    setPreconnectHeaders,
    setAssetHeaders,
    originalSiteOrigin,
    getBundleBaseUrl,
    setBundleBaseUrl,
    setBaseProxy,
    getBrowserSize
} from './server-utils'

const {JSDOM} = JsDom
global.fetch = fetch

// // The date when this module was loaded - this is used as a cachebreaker
// // for the local dev server (it's not used in remote mode).
// const MODULE_LOAD_DATE = Date.now()
const CWD = process.cwd()
const BUILD_DIR = path.resolve(CWD, 'build')

// Flag set when we're initialized - if true, we're running as a remote
// Lambda server. If false, we're running as a local development server.
let remote = false

// The base site origin (a proper Origin value)
const BASE_ORIGIN = originalSiteOrigin()

const JQUERY_JS = fs.readFileSync('./build/static/js/jquery.min.js', 'utf-8')
const VENDOR_JS = fs.readFileSync('./build/vendor.js', 'utf-8')
const MAIN_JS = fs.readFileSync('./build/main.js', 'utf-8')
const WHATWG_FETCH = fs.readFileSync('./node_modules/whatwg-fetch/fetch.js', 'utf-8')

const renderPage = (req, res, manifest) => {
    const resource = req.path
    const baseURL = `${BASE_ORIGIN}${resource}`

    const browserSize = getBrowserSize(req, remote)

    console.log(`SSR of page '${resource}'`)

    // Render the app.
    let renderedHeadContent
    let renderedAppContent
    let renderedAppState
    let serverSideApp
    const buildOrigin = getBundleBaseUrl()
    const renderPromise = new Promise((resolve, reject) => {
        serverSideApp = new JSDOM(`<html>
            <head>
                <script class="pw-remove">${WEBPACK_LOADER_SCRIPT}</script>
                <script class="pw-remove">
                    window.Progressive = {
                        isServerSide: true,
                        loaderLoadsPWA: false,
                        stylesheetLoaded: true,
                        buildOrigin: "${buildOrigin}",
                        isServerSideOrHydrating: true,
                        PerformanceTiming: {},
                        viewportSize: "${browserSize}"
                    }
                    window.scrollTo = function() {}
                    window.Mobify = {}
                </script>
            </head>
            <body>
                <div class="react-target"></div>
                <script id="capture-js" src="//cdn.mobify.com/capturejs/capture-latest.min.js"></script>
            </body>
        </html>`, {
            url: baseURL,
            runScripts: 'dangerously',
            resources: 'usable'
        })
        // Call these within the app to indicate either
        // enough rendering is complete and the HTML can be sent to the browser
        // or rendering has failed and the fallback page should be sent to the browser
        serverSideApp.window.document.defaultView.Progressive.initialRenderComplete = resolve
        serverSideApp.window.document.defaultView.Progressive.initialRenderFailed = reject

        // Execute these using the jsDom Script API since scripts containing comments or strings
        // with <script> in them will break JSDoms parsing
        const scripts = [WHATWG_FETCH, JQUERY_JS, VENDOR_JS, MAIN_JS]
        scripts.forEach((script) => serverSideApp.runVMScript(new Script(script)))
    })

    // Local dev server protocol is always https
    // Remote protocol could be either
    const requestedProtocol = (
        (remote && req.get('CloudFront-Forwarded-Proto')) || 'https'
    )
    setPreconnectHeaders(res, requestedProtocol)

    // Attribute for links that is set only for remote, where the
    // CDN is a separate origin. In a link, 'crossorigin' is equivalent
    // to 'crossorigin="anonymous"'
    const remoteXOrigin = remote ? 'crossorigin' : ''
    const headContent = [
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0">',
        `<link rel="manifest" href="${getAssetUrl('static/manifest.json')}">`,

        // Preconnect to the online checker
        `<link rel="preconnect" href="//online.mobify.net" crossorigin>`,

        // Prefetch links for some key assets, that will speed up the
        // PWA startup.
        `<link rel="prefetch" href="${getAssetUrl('static/svg/sprite-dist/sprite.svg')}" ${remoteXOrigin}>`,

        // The webpack loader as an inline script
        '<script>',
        WEBPACK_LOADER_SCRIPT,
        '</script>',
        `<link href="${getAssetUrl('main.css')}" rel="stylesheet" type="text/css">`,
        // The isUniversal flag used below is required for the scaffold to ensure we don't break the client-side PWA
        // Remove it for partner builds unless they need to maintain both PWA versions at the same time.
        `<script>
            window.Progressive = {
                stylesheetLoaded: true,
                cacheManifest: ${JSON.stringify(manifest)},
                isServerSideOrHydrating: true,
                isServerSide: false,
                buildOrigin: "${buildOrigin}",
                isUniversal: true,
                viewportSize: "${browserSize}"
            }
            window.Mobify = {}
        </script>`
    ]

    return renderPromise
        .then((appState) => {
            const head = serverSideApp.window.document.getElementsByTagName('head')[0]
            Array.from(head.getElementsByClassName('pw-remove')).forEach((node) => {
                head.removeChild(node)
            })
            // Rendering is complete, so prep the app state and app HTML for our response sent to the client
            renderedAppContent = serverSideApp.window.document.getElementsByClassName('react-target')[0].innerHTML
            renderedHeadContent = head.innerHTML
            renderedAppState = appState
            // By the time we use the app state again we'll be client side, so set isServerSide to false
            renderedAppState.app = appState.app.set('isServerSide', false)
            return
        })
        .then(() => {
            return [
                `<html><head></head>`,
                '<body><div id="content" class="react-target">',
                renderedAppContent,
                '</div></body></html>'
            ].join('\n')
        })
        .then(optimizeCSS)
        .then((optimizedCSS) => {
            headContent.push(`<style>${optimizedCSS}</style>`)
            headContent.push(renderedHeadContent)
            const html = [
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                '<html><head>',
                ...headContent,
                '</head><body>',
                `<div class="react-target">${renderedAppContent}</div>`,
                `<script id="mobify-v8-tag" src="${getAssetUrl('ssr-loader.js')}"></script>`,
                `<script>window.__PRELOADED_STATE__=${JSON.stringify(renderedAppState)}</script>`,
                '</body>',
                '</html>'
            ]

            return html
        })
        .catch((err) => {
            // Rendering Failed - send the client side app only
            const html = [
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                '<html><head>',
                ...headContent,
                '</head>',
                '<body>',
                `<script id="mobify-v8-tag" src="${getAssetUrl('loader.js')}"></script>`,
                '</body>',
                '</html>'
            ]
            console.log(`Could not load page: ${err.message}`)

            return html
        })
        .then((html) => {
            res.status(200)
            res.header('Content-Type', 'text/html')

            // Cache-Control
            if (remote) {
                // Caching for a remote server is a little more complex than
                // for local dev. When we redeploy, we invalidate the CDN that
                // serves the pages, so the CDN will revisit the origin. That allows
                // a developer to use Command-R to reload the page and bypass the
                // cache.
                res.set(
                    'cache-control',
                    'max-age=300, s-maxage=300'
                )
            } else {
                // For a local dev server, suppress caching of the page
                res.set('cache-control', 'max-age=0, nocache, nostore, must-revalidate')
            }
            // Send the page. To reduce memory use, we send each line rather
            // than join the whole thing.
            html.forEach(
                (chunk) => {
                    res.write(chunk)
                    res.write('\n')
                }
            )
            res.end()

            // global.gc is not available under serverless-offline
            if (global.gc) {
                global.gc()
            }
        })
        .catch((error) => {
            console.log(error)
        })
}

/**
 * Build and return a cacheHashManifest from the contents of the `./build`
 * directory. We don't return a complete manifest; the result is an object
 * with an empty 'hashes' table and a buildDate set to the most recent
 * modification time of anything in the build directory. Since the SDK and
 * loaders fall back to the buildDate if there is no match in the 'hashes'
 * mapping, this means that any change to a local file will invalidate
 * the whole set of local files, including the scripts that load them.
 *
 * We could generate a full set of hashes also, but that bulks out the
 * rendered page significantly.
 *
 * @returns Promise.<{*}> resolves to the resulting manifest object
 */
const buildCacheHashManifest = () => {
    const manifest = {
        hashes: {},
        buildDate: 0
    }
    return new Promise(
        (resolve) => {
            const walker = walkTree.walk('./build')
            walker.on('file', (root, fileStats, next) => {
                const mtime = fileStats.mtime.getTime()
                // Update the buildDate to that of the most recently
                // modified file
                if (mtime > manifest.buildDate) {
                    manifest.buildDate = mtime
                }

                next()
            })
            walker.on('end', () => {
                resolve(manifest)
            })
        }
    )
}

const ssr = (req, res) => {
    return remote ?
        Promise.resolve(builtCacheHashManifest) :
        buildCacheHashManifest()
        .then((manifest) => {
            initCacheManifest(manifest)
            return renderPage(req, res, manifest)
        })
}

/**
 * Serve the service-worker-loader file. We read this from the
 * file system on each request, but we don't expect the
 * requests to happen often.
 */
const serveServiceWorkerLoader = (req, res) => {
    res.set('content-type', 'application/javascript')
    res.send(
        fs.readFileSync(
            'build/worker.js',
            {
                encoding: 'utf8'
            }
        )
    )
}

const initApp = (options) => {
    remote = Boolean(options.remote)
    const app = express()


    setBundleBaseUrl(remote)

    if (remote) {
        // Hook in API Gateway support
        app.use(awsServerlessExpressMiddleware.eventContext())
    } else {
        // For local dev, we compress responses (for remote, we let the
        // CDN do it).
        app.use(compression({
            level: 9
        }))

        app.use(
            expressLogging(
                ':method :url :status :response-time ms - :res[content-length] :res[content-type]'
            )
        )

        app.get(
            '/main.css.map',
            express.static(
                `${BUILD_DIR}`,
                {
                    setHeaders: setAssetHeaders,
                    fallthrough: false
                }
            )
        )

        if (WEBPACK_PROXY1_HOST && WEBPACK_PROXY1_PATH) {
            console.log('SET UP PROXY FOR ', WEBPACK_PROXY1_HOST)
            const proxyPath = `/mobify/proxy/${WEBPACK_PROXY1_PATH}/`
            app.use(
                proxyPath,
                setBaseProxy(proxyPath, WEBPACK_PROXY1_HOST)
            )
        }

        if (WEBPACK_PROXY2_HOST && WEBPACK_PROXY2_PATH) {
            console.log('SET UP PROXY FOR ', WEBPACK_PROXY2_HOST)
            const proxyPath = `/mobify/proxy/${WEBPACK_PROXY2_PATH}/`
            app.use(
                proxyPath,
                setBaseProxy(proxyPath, WEBPACK_PROXY2_HOST)
            )
        }

        app.use(
            '/build',
            express.static(
                `${BUILD_DIR}`,
                {
                    setHeaders: setAssetHeaders,
                    fallthrough: false
                }
            )
        )
    }

    // Serve this asset directly (in both remote and local modes)
    app.get('/worker.js*', serveServiceWorkerLoader)

    // Always proxy favicon requests
    app.get(
        '/favicon.ico',
        simpleProxy(WEBPACK_SITE_URL)
    )

    app.get('/*', ssr)

    return app
}

export {initApp}
