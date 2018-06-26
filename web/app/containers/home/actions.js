/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {createAction} from 'progressive-web-sdk/dist/utils/action-creation'
import IntegrationManager from 'mobify-integration-manager/dist/'

import {getHeroProductsSearchParams} from './constants'

export const receiveHomeData = createAction('Receive Home Data')

export const initialize = (url, routeName) => (dispatch) => {
    // Fetch information you need for the template here
    const fetchPageMeta = dispatch(IntegrationManager.custom.getPageMetaData(routeName))
        .then((pageMeta) => dispatch(receiveHomeData(pageMeta)))

    const searchParams = getHeroProductsSearchParams()
    const fetchProductsSearch = dispatch(IntegrationManager.productSearch.searchProducts(searchParams))

    return Promise.all([fetchPageMeta, fetchProductsSearch])
}
