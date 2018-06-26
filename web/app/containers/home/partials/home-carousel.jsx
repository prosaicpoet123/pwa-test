/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {getAssetUrl} from 'progressive-web-sdk/dist/asset-utils'

import Carousel from 'progressive-web-sdk/dist/components/carousel'
import CarouselItem from 'progressive-web-sdk/dist/components/carousel/carousel-item'
import Image from 'progressive-web-sdk/dist/components/image'
import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'

// The ratio of the banner image width:height is 1:.75. Since the banner will be
// width=100%, we can use 75vw to predict the banner height.
const imageHeight = '75vw'
const placeholder = <SkeletonBlock height={imageHeight} />

const HomeCarousel = ({banners, isServerSideOrHydrating}) => {
    if (isServerSideOrHydrating) {
        return (<div className="t-home__carousel" />)
    }
    return (
        <div className="t-home__carousel">
            {banners.length > 0 ?
                <Carousel allowLooping={true} className="pw--hide-controls">
                    {banners.map(({src, href, alt}, index) => { // TODO: fix this when we put mobile assets on desktop
                        return (
                            <CarouselItem href={href} key={index}>
                                <Image
                                    src={getAssetUrl(`static/img/homepage_carousel/slide-${index + 1}.jpg`)}
                                    alt={alt}
                                    className="u-display-block"
                                    hidePlaceholder={true}
                                    loadingIndicator={placeholder}
                                    onImageLoaded={() => { window.dispatchEvent(new Event('resize')) }}     // TODO: SDK Carousel should manage resize of its slide images as they load
                                />
                            </CarouselItem>
                        )
                    })}
                </Carousel>
            :
                <div style={{paddingBottom: '30px'}}>
                    {placeholder}
                </div>
            }
        </div>
    )
}

HomeCarousel.propTypes = {
    banners: PropTypes.array,
    isServerSideOrHydrating: PropTypes.bool
}

export default HomeCarousel
