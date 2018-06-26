/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Image from 'progressive-web-sdk/dist/components/image'
import ListTile from 'progressive-web-sdk/dist/components/list-tile'
import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'
import ProductItem from '../product-item'
import {FormattedPrice} from '../intl/index'
import {MicrodataOffer} from '../microdata'

/**
 * Product Tile represents a product and it's basic information: image,
 * link and price.
 */

const titleClassName = classNames(
    'c-product-tile__name',
    'u-h4',
    'u-text-family',
    'u-text-weight-medium',
    'u-color-neutral-60'
)

const ProductImage = ({src, alt}) => (
    <Image
        src={src}
        alt={alt}
        height="150px"
        width="120px"
        itemProp="image"
        />
)

ProductImage.propTypes = {
    alt: PropTypes.string,
    src: PropTypes.string
}

const ProductPrice = ({price}) => {
    return (
        <MicrodataOffer className="u-text-weight-bold u-color-error" available>
            <FormattedPrice value={price} />
        </MicrodataOffer>
    )
}

ProductPrice.propTypes = {
    price: PropTypes.string.isRequired,
    currency: PropTypes.object,
}

const OutOfStockPrice = () => {
    return (
        <MicrodataOffer className="u-text-weight-bold u-color-error" available={false}>
            Out of stock
        </MicrodataOffer>
    )
}

const ProductTile = ({className, thumbnail, href, price, title, onClick, productId, available}) => {
    const productImage = (<ProductImage {...thumbnail} />)

    const titleElement = title
        ? <h2 className={titleClassName} itemProp="name">{title}</h2>
        : <SkeletonBlock height="34px" />

    const priceElement = (price && price.length > 0 && <ProductPrice price={price} />) ||
        (!available) && <OutOfStockPrice /> ||
        <SkeletonBlock height="22px" width="50px" />

    return (
        <ListTile className="c-product-tile" onClick={onClick} href={href}>
            <ProductItem customWidth="45%"
                className={classNames('u-align-center', className)}
                title={titleElement}
                price={priceElement}
                image={productImage}
             />

            <meta itemProp="productID" content={productId} />
            <meta itemProp="url" content={href} />
        </ListTile>
    )
}

ProductTile.propTypes = {
    available: PropTypes.bool,
    /**
     * Optional className for the product tile
     */
    className: PropTypes.string,
    href: PropTypes.string,
    price: PropTypes.string,
    productId: PropTypes.string,
    thumbnail: PropTypes.shape({
        alt: PropTypes.string.isRequired,
        src: PropTypes.string.isRequired,
    }),
    title: PropTypes.string,
    onClick: PropTypes.func
}

export default ProductTile
