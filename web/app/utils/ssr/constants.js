/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

export const WEBPACK_LOADER_SCRIPT = (
    `// Configure the module loader
    window.webpackJsonpAsync = function(module, exports, webpackRequire) {
        var runJsonpAsync = function() {
            if (window.webpackJsonp) {
                window.webpackJsonp(module, exports, webpackRequire)
            } else {
                setTimeout(runJsonpAsync, 50)
            }
        }
        runJsonpAsync()
    }`
)

export const VIEWPORT_SIZE_NAMES = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    XLARGE: 'xlarge'
}
