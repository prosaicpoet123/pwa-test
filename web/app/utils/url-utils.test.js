/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-env jest */
import {getRequestPath} from './url-utils'

test('getRequestPath returns requestPath unchanged if running server side', () => {
    window.Progressive = {
        isServerSide: true
    }
    const requestPath = '/test/url'

    expect(getRequestPath('base/path', requestPath)).toBe(requestPath)
})

test('getRequestPath returns proxied base path', () => {
    window.Progressive = {
        isServerSide: false
    }
    const requestPath = '/test/url'

    expect(getRequestPath('base/path', requestPath)).toBe(`/mobify/proxy/base/path${requestPath}`)
})

test('getRequestPath returns proxied base path when request path has no leading /', () => {
    window.Progressive = {
        isServerSide: false
    }
    const requestPath = 'test/url'

    expect(getRequestPath('base/path', requestPath))
        .toBe(`/mobify/proxy/base/path/${requestPath}`)
})
