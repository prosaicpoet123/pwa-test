/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'

import Scroller from 'progressive-web-sdk/dist/components/scroller'
import Tile from 'progressive-web-sdk/dist/components/tile'
import {FormattedPrice} from '../../../components/intl/index'

const productState = (price) => {
    if (price) {
        return <FormattedPrice value={price} />
    } else {
        return <span className="u-color-error">Out of stock</span>
    }
}

const HomePopularProducts = ({products, isServerSideOrHydrating}) => {
    return (
        <div className="t-home__popular-items u-padding">
            <div className="u-margin-bottom-md u-padding-start-md u-padding-end-md u-flexbox u-align-center">
                <h2 className="u-h4">
                    Popular Items
                </h2>
            </div>
            <Scroller>
                {products.slice(0, 3).map((product, idx) => (
                    <Tile
                        key={idx}
                        isColumn
                        imageProps={isServerSideOrHydrating ?
                            {}
                            : {
                                src: product.image.link,
                                width: '142px',
                                alt: product.image.alt
                            }
                        }
                        title={product.productName}
                        price={productState(product.price)}
                        href={product.href}
                    />
                ))}
            </Scroller>
        </div>
    )
}

HomePopularProducts.propTypes = {
    isServerSideOrHydrating: PropTypes.bool,
    products: PropTypes.array
}

export default HomePopularProducts
