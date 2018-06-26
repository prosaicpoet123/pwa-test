/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import classNames from 'classnames'
import {browserHistory} from 'progressive-web-sdk/dist/routing'
import * as selectors from '../selectors'
import {getAssetUrl} from 'progressive-web-sdk/dist/asset-utils'
import {PRODUCT_LIST_FILTER_MODAL} from '../../../modals/constants'
import {openModal} from '../../../modals/actions'

import Button from 'progressive-web-sdk/dist/components/button'
import List from 'progressive-web-sdk/dist/components/list'
import Image from 'progressive-web-sdk/dist/components/image'
import Pagination from 'progressive-web-sdk/dist/components/pagination'
import Field from 'progressive-web-sdk/dist/components/field'
import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'

import {receiveCurrentProductId} from 'mobify-integration-manager/dist/integration-manager/results'

import {isRunningInAstro} from '../../app/selectors'

import {PLACEHOLDER_PRODUCT} from '../constants'

import ProductTile from '../../../components/product-tile'
import Card from '../../../components/card'

import queryString from 'query-string'
import urlMapper from '../../../config/url-mapper'

const noResultsText = 'We can\'t find products matching the selection'
const emptySearchText = 'Your search returned no results. Please check your spelling and try searching again.'

const ResultList = ({products, setProductId}) => (
    <List className="pw--borderless">
        {products.map((product, idx) => (
            <Card hasShadow key={product.productId ? product.productId : idx} itemScope itemType="http://schema.org/Product">
                <ProductTile
                    {...product}
                    onClick={product ? () => setProductId(product.productId) : null}
                    price={product.price && product.price.toString()}
                    href={product.href || `/${product.productId}.html`}
                    title={product.productName}
                    description={false}
                    thumbnail={{
                        alt: product.image.alt,
                        src: product.image.link
                    }}
                />
            </Card>
        ))}
    </List>
)

ResultList.propTypes = {
    products: PropTypes.array,
    setProductId: PropTypes.func
}

const NoResultsList = ({routeName}) => (
    <div className="u-flexbox u-direction-column u-align-center">
        <Image
            className="u-flex-none"
            alt="Crystal Ball"
            width="122px"
            height="110px"
            src={getAssetUrl('static/img/global/no-results.png')}
        />

        <div className="t-product-list__no-results-text u-text-align-center">
            {routeName === 'searchResultPage' ? emptySearchText : noResultsText}
        </div>
    </div>
)

NoResultsList.propTypes = {
    routeName: PropTypes.string
}

const Skeleton = () => (
    <ResultList products={new Array(5).fill(PLACEHOLDER_PRODUCT)} />
)

const ProductListContents = ({
    productSearch,
    openModal,
    routeName,
    setProductId,
    uiState,
    isRunningInAstro
}) => {
    const {
        products = [],
        sortingOptions = [],
        filters = [],
        selectedFilters = [],
        start = 0,
        total = 0
    } = productSearch || {}

    const {count = 1} = uiState
    const contentsLoaded = !!productSearch

    const filteredSelectedFilters = selectedFilters.filter((filter) => !filter.query.includes('cgid'))
    const hasSelectedFilters = filteredSelectedFilters.length > 0
    const hasFilters = filters.length > 0

    const pageCount = Math.ceil(total / count)
    const pageNumber = Math.floor(start / count) + 1

    const goToURL = (url) => {
        if (url === window.location.href) { return }

        // Use a dom anchor as a parser.
        const anchor = document.createElement('a')
        anchor.href = url

        const historyEntry = {
            pathname: anchor.pathname,
            query: queryString.parse(anchor.search)
        }

        if (isRunningInAstro) {
            browserHistory.replace(historyEntry)
        } else {
            browserHistory.push(historyEntry)
        }
    }

    const clearFiltersUrl = urlMapper.getSearchUrl({
        ...uiState,
        start: 0,
        filters: {
            query: uiState.filters.query,
            cgid: uiState.filters.cgid
        }
    })

    const showListActionBar = !contentsLoaded || products.length > 0

    const filtersClasses = classNames('u-flexbox u-align-center u-border-light-top t-product-list__active-filter-container')
    return (
        <div>
            <div className={filtersClasses}>
                {hasSelectedFilters && [
                    <div key="ruleset" className="u-flex u-padding-start-md">
                        {filteredSelectedFilters
                            .map(({label, query, ruleset}) =>
                                <div className="t-product-list__active-filter" key={query}>
                                    <strong>{ruleset}</strong>: {label}
                                </div>
                        )}
                    </div>,
                    <div key="clear" className="u-flex-none">
                        <Button
                            className="u-color-brand"
                            icon="trash"
                            href={clearFiltersUrl}
                            data-analytics-name={UI_NAME.clearFilters}
                        >
                            Clear
                        </Button>
                    </div>
                ]}
            </div>

            <div className="t-product-list__container u-padding-end u-padding-bottom-lg u-padding-start">

                {/* Product List Header */}
                <div className="t-product-list__num-results u-padding-md u-padding-start-sm u-padding-end-sm">
                    {showListActionBar &&
                        <div className="u-flexbox">
                            <div className="t-product-list__filter u-flex u-margin-end-md">
                                <Field
                                    idForLabel="filterButton"
                                    label={contentsLoaded ? `${total} Items` : `Loading...`}
                                >
                                    <Button
                                        className="pw--tertiary u-width-full u-text-uppercase"
                                        onClick={openModal}
                                        id="filterButton"
                                        data-analytics-name={UI_NAME.showFilters}
                                        disabled={!hasFilters}
                                    >
                                        Filter
                                    </Button>
                                </Field>
                            </div>

                            <div className="t-product-list__sort u-flex">
                                <Field
                                    className="pw--has-select"
                                    idForLabel="sort"
                                    label="Sort by"
                                >
                                    <select
                                        className="u-color-neutral-60"
                                        onChange={(e) => (goToURL(e.target.value))}
                                        onBlur={(e) => (goToURL(e.target.value))}
                                        data-analytics-name={UI_NAME.sortBy}
                                        value={urlMapper.getSearchUrl({
                                            ...uiState,
                                            total
                                        })}
                                    >
                                        <option value="">Please Select One</option>
                                        {sortingOptions.map((choice, index) =>
                                            <option
                                                key={index}
                                                value={urlMapper.getSearchUrl({
                                                    ...uiState,
                                                    sort: choice.id,
                                                    total
                                                })}
                                                >
                                                {choice.label}
                                            </option>
                                        )}
                                    </select>
                                </Field>
                            </div>
                        </div>
                    }
                </div>

                {/* Product List Content */}
                {contentsLoaded ?
                    <div>
                        {products.length > 0 &&
                            <div>
                                <ResultList
                                    products={products}
                                    setProductId={setProductId}
                                />
                                <Pagination
                                    className="u-margin-top-lg"
                                    onChange={(pageIndex) => {
                                        const url = urlMapper.getSearchUrl({
                                            ...uiState,
                                            start: pageIndex <= pageNumber ? (pageIndex - 1) * count : pageNumber * count,
                                            count,
                                            total
                                        })

                                        goToURL(url)
                                    }}
                                    currentPage={pageNumber}
                                    pageCount={pageCount}
                                    showCurrentPageMessage={true}
                                    showPageButtons={false}
                                />
                            </div>
                        }

                        {products.length <= 0 &&
                            <NoResultsList routeName={routeName} />
                        }
                    </div>
                :
                    <Skeleton />
                }

            </div>
        </div>
    )
}

ProductListContents.propTypes = {
    isRunningInAstro: PropTypes.bool,
    location: PropTypes.object,
    openModal: PropTypes.func,
    productSearch: PropTypes.object,
    routeName: PropTypes.string,
    setProductId: PropTypes.func,
    uiState: PropTypes.object
}

const mapStateToProps = createPropsSelector({
    productSearch: selectors.getProductSearch,
    uiState: selectors.getUIState,
    isRunningInAstro
})

const mapDispatchToProps = {
    setProductId: receiveCurrentProductId,
    openModal: () => openModal(PRODUCT_LIST_FILTER_MODAL, UI_NAME.filters)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProductListContents)
