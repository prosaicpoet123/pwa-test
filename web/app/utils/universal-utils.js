import {VIEWPORT_SIZE_NAMES} from './ssr/constants'

/**
 * Caluculate the browsers viewportSize
 * @returns {String} the viewport size which will be either small, medium, large or xlarge
 *
 */
export const calculateViewportSize = () => {
    const viewportWidth = window.innerWidth

    if (viewportWidth >= 1280) {
        return VIEWPORT_SIZE_NAMES.XLARGE
    }

    if (viewportWidth >= 960) {
        return VIEWPORT_SIZE_NAMES.LARGE
    }

    if (viewportWidth >= 600) {
        return VIEWPORT_SIZE_NAMES.MEDIUM
    }
    return VIEWPORT_SIZE_NAMES.SMALL
}
