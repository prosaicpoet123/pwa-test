/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* global WEBPACK_PROXY1_PATH WEBPACK_PROXY2_PATH */

export const getRequestPath = (baseSitePath, requestPath) => {
    if (window.Progressive && window.Progressive.isServerSide) {
        return requestPath
    }

    baseSitePath = `/mobify/proxy/${baseSitePath}`

    return requestPath.startsWith('/') ?
        `${baseSitePath}${requestPath}`
        : `${baseSitePath}/${requestPath}`
}

export const getBaseRequestPath = (path) => getRequestPath(WEBPACK_PROXY1_PATH, path)

export const getBase2RequestPath = (path) => getRequestPath(WEBPACK_PROXY2_PATH, path)
