/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import ProductList from '../page-objects/product-list'

const selectors = {
    productDetailsTemplateIdentifier: '.t-product-details',
    addItem: '.t-product-details__add-to-cart:not([disabled])',
    itemAdded: '.m-product-details__item-added-modal',
    goToCheckout: '.m-product-details__item-added-modal .pw--primary',
    productInStock: '.t-product-details__indicator'
}

let productList

const ProductDetails = function(browser) {
    this.browser = browser
    this.selectors = selectors
    productList = new ProductList(browser)
}

ProductDetails.prototype.checkInStock = function(productIndex) {
    const self = this
    self.browser
        .waitForElementVisible(selectors.productInStock)
        .element('css selector', selectors.addItem, (result) => {
            if (result.value && result.value.ELEMENT) {
                self.browser
                    .waitForElementVisible(selectors.addItem)
                    .log('Item is in stock')
            } else {
                self.browser.log('Item is not in stock. Choosing another.')
                productIndex += 1
                self.browser.back()
                productList.navigateToProductDetails(productIndex)
                self.checkInStock(productIndex)
            }
        })
    return this
}

ProductDetails.prototype.addItemToCart = function() {
    // Add an item to the cart
    this.browser
        .log('Adding item to cart')
        .waitForElementVisible(selectors.addItem)
        .triggerClick(selectors.addItem)
        .waitUntilMobified()
    return this
}

ProductDetails.prototype.navigateToCart = function() {
    // Navigate from ProductDetails to Checkout
    this.browser
        .log('Navigating to cart')
        .waitForElementVisible(selectors.goToCheckout)
        .triggerClick(selectors.goToCheckout)
        .waitUntilMobified()
    return this
}

export default ProductDetails
