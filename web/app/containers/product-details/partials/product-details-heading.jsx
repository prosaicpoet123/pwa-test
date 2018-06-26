/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {
    getProductTitle,
    getProductPrice,
    getProductAvailability,
    getProductPageMeta,
    getProductHref,
    getProductId
} from 'progressive-web-sdk/dist/store/products/selectors'

import * as selectors from '../selectors'
import {getCartURL, getWishlistURL, isRunningInAstro} from '../../app/selectors'
import PageMeta from '../../../components/page-meta'

import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'
import Breadcrumbs from 'progressive-web-sdk/dist/components/breadcrumbs'
import {FormattedPrice} from '../../../components/intl/index'
import {MicrodataOffer} from '../../../components/microdata'

const ProductDetailsHeading = ({
    available,
    breadcrumbs,
    title,
    price,
    pageMeta,
    isInCheckout,
    cartURL,
    isInWishlist,
    wishlistURL,
    productHref,
    productID,
    isRunningInAstro
}) => {
    let breadcrumbItems = breadcrumbs

    if (isInCheckout) {
        breadcrumbItems = [{text: 'Cart', href: cartURL}]
    } else if (isInWishlist) {
        breadcrumbItems = [{text: 'Wishlist', href: wishlistURL}]
    }

    return (
        <div className="t-product-details-heading u-padding-md u-box-shadow u-position-relative u-z-index-1">
            <PageMeta {...pageMeta} />

            {!isRunningInAstro &&
                <div className="t-product-details__breadcrumbs u-margin-bottom-md">
                    <Breadcrumbs items={breadcrumbItems} includeMicroData />
                </div>
            }
            {title ?
                <h1 className="t-product-details-heading__title u-text-uppercase u-margin-bottom" itemProp="name">{title}</h1>
            :
                <SkeletonBlock width="50%" height="32px" className="u-margin-bottom" />
            }

            <MicrodataOffer available={available}>
                {(available !== null && available !== undefined && price !== null && price !== undefined) ?
                    (price.length > 0 &&
                        <span className="t-product-details-heading__price t-product-details__price u-color-accent u-text-weight-regular u-text-family-header u-text-letter-spacing-small">
                            <FormattedPrice value={price} />
                        </span>
                    )
                :
                    <SkeletonBlock width="25%" height="32px" />
                }
            </MicrodataOffer>
            <meta itemProp="productID" content={productID} />
            <meta itemProp="url" content={productHref} />
        </div>
    )
}

ProductDetailsHeading.propTypes = {
    available: PropTypes.bool,
    breadcrumbs: PropTypes.array,
    cartURL: PropTypes.string,
    isInCheckout: PropTypes.bool,
    isInWishlist: PropTypes.bool,
    isRunningInAstro: PropTypes.bool,
    pageMeta: PropTypes.object,
    price: PropTypes.string,
    productHref: PropTypes.string,
    productID: PropTypes.string,
    title: PropTypes.string,
    wishlistURL: PropTypes.string
}

const mapStateToProps = createPropsSelector({
    available: getProductAvailability,
    breadcrumbs: selectors.getProductDetailsBreadcrumbs,
    cartURL: getCartURL,
    title: getProductTitle,
    pageMeta: getProductPageMeta,
    price: getProductPrice,
    productHref: getProductHref,
    productID: getProductId,
    wishlistURL: getWishlistURL,
    isRunningInAstro
})

export default connect(mapStateToProps)(ProductDetailsHeading)
