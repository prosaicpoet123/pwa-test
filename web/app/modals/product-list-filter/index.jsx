/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import {PRODUCT_LIST_FILTER_MODAL} from '../constants'
import {closeModal, openModal} from '../actions'
import {isModalOpen} from 'progressive-web-sdk/dist/store/modals/selectors'
import * as selectors from '../../containers/product-list/selectors'
import {browserHistory} from 'progressive-web-sdk/dist/routing'
import {isRunningInAstro} from '../../containers/app/selectors'

import {Accordion, AccordionItem} from 'progressive-web-sdk/dist/components/accordion'
import Button from 'progressive-web-sdk/dist/components/button'
import Sheet from 'progressive-web-sdk/dist/components/sheet'
import {HeaderBar, HeaderBarActions, HeaderBarTitle} from 'progressive-web-sdk/dist/components/header-bar'
import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'
import IconLabelButton from '../../components/icon-label-button'

import queryString from 'query-string'
import urlMapper from '../../config/url-mapper'

const FILTER_QUERY = 'filter_is_open'

const goToURL = (url, isRunningInAstro) => {
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

class ProductListFilterModal extends React.Component {
    componentDidMount() {
        if (window.location.search.indexOf(FILTER_QUERY) > 0) {
            this.props.openModal()
        }
    }

    render() {
        const {closeModal, productSearch, isOpen, duration, uiState, isRunningInAstro} = this.props
        const {filters = []} = productSearch || {}

        return (
            <Sheet
                className="m-product-list__filter-modal"
                open={isOpen}
                onDismiss={closeModal}
                duration={duration}
                maskOpacity={0.7}
                effect="slide-right"
                shrinkToContent={false}
                coverage="85%"
            >
                <HeaderBar>
                    <HeaderBarTitle className="u-flex u-padding-start u-text-align-start">
                        <h1 className="u-h3 u-text-uppercase">
                            <span className="u-text-weight-extra-light">Filter Results By</span>
                        </h1>
                    </HeaderBarTitle>

                    <HeaderBarActions>
                        <IconLabelButton iconName="close" label="" onClick={closeModal} analyticsName={UI_NAME.dismissModal}>Close</IconLabelButton>
                    </HeaderBarActions>
                </HeaderBar>

                <Accordion initialOpenItems={[0]}>
                    {filters
                        .map(({label, ruleset, kinds}) =>
                            <AccordionItem header={label} key={ruleset} className="u-padding-0">
                                {/* disabling a11y lints because the below handler is
                                    for the bubbled events from the children button elements */}
                                {/* eslint-disable
                                    jsx-a11y/click-events-have-key-events,
                                    jsx-a11y/onclick-has-focus,
                                    jsx-a11y/onclick-has-role,
                                    jsx-a11y/no-static-element-interactions */}
                                <div
                                    className="m-product-list__filter-modal-items"
                                    role="presentation"
                                >
                                    {kinds
                                        .filter(({count}) => (count > 0))
                                        .map(({count, label, query, searchKey}) => {
                                            const searchState = {
                                                ...uiState,
                                                start: 0,
                                                filters: {
                                                    ...uiState.filters,
                                                    [ruleset]: searchKey
                                                }
                                            }

                                            return (
                                                <Button
                                                    key={query}
                                                    className="pw--link u-width-full u-text-letter-spacing-normal"
                                                    innerClassName="u-justify-start"
                                                    id={query}
                                                    onClick={() => goToURL(urlMapper.getSearchUrl(searchState), isRunningInAstro)}
                                                    data-analytics-name={UI_NAME.showFilters}
                                                >
                                                    <div>
                                                        <span className="u-color-brand">{label}</span> <span className="u-color-neutral-40">({count})</span>
                                                    </div>
                                                </Button>
                                            )
                                        }
                                    )}
                                </div>
                            </AccordionItem>
                    )}
                </Accordion>
            </Sheet>
        )
    }
}

ProductListFilterModal.propTypes = {
    /**
     * A function used to set the filter sheet's state to closed
     */
    closeModal: PropTypes.func,

    /**
     * Duration will define the time the animation takes to complete.
     */
    duration: PropTypes.number,

    /**
     * Whether the modal is open or not
     */
    isOpen: PropTypes.bool,

    isRunningInAstro: PropTypes.bool,

    /**
     * A function used to set the filter sheet's state to open
     */
    openModal: PropTypes.func,

    /**
     *
     */
    productSearch: PropTypes.object,

    /**
     *
     */
    uiState: PropTypes.object
}

const mapStateToProps = createPropsSelector({
    productSearch: selectors.getProductSearch,
    uiState: selectors.getUIState,
    isOpen: isModalOpen(PRODUCT_LIST_FILTER_MODAL),
    isRunningInAstro
})

const mapDispatchToProps = {
    closeModal: () => closeModal(PRODUCT_LIST_FILTER_MODAL, UI_NAME.filters),
    openModal: () => openModal(PRODUCT_LIST_FILTER_MODAL, UI_NAME.filters)
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProductListFilterModal)
