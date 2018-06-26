/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import Home from '../../page-objects/home'
import PushMessaging from '../../page-objects/push-messaging'

let home
let pushMessaging

module.exports = { // eslint-disable-line import/no-commonjs
    '@tags': ['e2e', 'messaging'],

    before: (browser) => {
        home = new Home(browser)
        pushMessaging = new PushMessaging(browser)
        // Allow pushMessaging.assertSubscribed to run for 2 seconds
        browser.timeoutsAsyncScript(2000)
    },

    after: () => {
        home.closeBrowser()
    },

    'Push Subscribe - Step 1 - Home': () => {
        home.openBrowserToHomepage(process.env.npm_package_siteUrl)
    },

    'Push Subscribe - Step 2 - Accept Inline Ask': (browser) => {
        browser.waitForElementVisible(pushMessaging.selectors.optIn)
        pushMessaging
            .acceptInlineAsk()
            .assertSubscribed()
    }
}
