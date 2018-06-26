import {initCacheManifest, getBuildOrigin} from 'progressive-web-sdk/dist/asset-utils'
import cacheHashManifest from '../tmp/cache-hash-manifest.json'

let origin = getBuildOrigin()

if (!/\/$/.test(origin)) {
    origin += '/'
}

// Set publicPath so bundle chunks will be loaded from the correct location
__webpack_public_path__ = origin // eslint-disable-line camelcase, no-undef

// React
import React from 'react'
import {render, hydrate} from 'react-dom'

// Router
import Router from './router'

// Redux
import configureStore from './store'

import {convertStateObjectToStateImmutable} from 'progressive-web-sdk/dist/utils/store-utils'

// Stylesheet: importing it here compiles the SCSS into CSS. The CSS is actually
// added to the markup in `loader.js`
import Stylesheet from './stylesheet.scss' // eslint-disable-line no-unused-vars

// DO NOT USE! Merlins Connector is an example connector that is for demo only
import initConnector from './init-merlins-connector'
// import initConnector from './init-sfcc-connector'
// import initConnector from './init-hybris-connector'
// import initConnector from './init-stub-connector'

initConnector()

initCacheManifest(cacheHashManifest)

let initialState

if (window.__PRELOADED_STATE__) {
    initialState = convertStateObjectToStateImmutable(window.__PRELOADED_STATE__)
    delete window.__PRELOADED_STATE__
}

const store = configureStore(initialState)

const rootEl = document.getElementsByClassName('react-target')[0]

if (window.Progressive.isUniversal && !window.Progressive.isServerSide) {
    hydrate(<Router store={store} />, rootEl)
} else {
    render(<Router store={store} />, rootEl)
}
