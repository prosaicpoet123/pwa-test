/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import throttle from 'lodash.throttle'
import classnames from 'classnames'

import * as headerActions from './actions'
import * as miniCartActions from '../../modals/mini-cart/actions'
import {openModal} from '../../modals/actions'
import {NAVIGATION_MODAL, MORE_MENU} from '../../modals/constants'
import * as selectors from './selectors'
import {isStandaloneApp} from 'progressive-web-sdk/dist/store/app/selectors'

import {HeaderBar} from 'progressive-web-sdk/dist/components/header-bar'
import Icon from 'progressive-web-sdk/dist/components/icon'
import Search from 'progressive-web-sdk/dist/components/search'
import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'

import NavigationAction from './partials/navigation-action'
import HeaderTitle from './partials/header-title'
import StoresAction from './partials/stores-action'
import CartAction from './partials/cart-action'
import SearchAction from './partials/search-action'
import BackAction from './partials/back-action'
import MoreMenuAction from './partials/more-action'
import UserAction from './partials/user-action'

import {isRunningInAstro} from '../app/selectors'

const SCROLL_CHECK_INTERVAL = 200

class Header extends React.Component {
    constructor(props) {
        super(props)

        this.handleScroll = throttle(this.handleScroll.bind(this), SCROLL_CHECK_INTERVAL)
        // Start off uncollapsed
        this.headerHeight = Number.MAX_VALUE

        this.onChangeSearchQuery = this.onChangeSearchQuery.bind(this)
        this.onSearchSubmit = this.onSearchSubmit.bind(this)
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    }

    onChangeSearchQuery(e) {
        const {value} = e.target
        this.props.searchQueryChanged(value)
    }

    onSearchSubmit(e) {
        e.preventDefault()

        const value = e.target.query.value
        this.props.searchSubmit(value)
    }

    handleScroll() {
        const {isCollapsed} = this.props
        const newIsCollapsed = window.pageYOffset > this.headerHeight

        // Don't trigger the action unless things have changed
        // Don't trigger on A2HS / Standalone mode
        if (newIsCollapsed !== isCollapsed && !this.props.isStandaloneApp) {
            this.props.toggleHeader(newIsCollapsed)
        }
    }

    render() {
        const {
            clearSuggestions,
            onMenuClick,
            onMiniCartClick,
            onMoreMenuClick,
            onSearchOpenClick,
            onSearchCloseClick,
            goBack,
            isCollapsed,
            isStandaloneApp,
            searchIsOpen,
            searchSuggestions,
            showBackButton,
            isRunningInAstro
        } = this.props

        if (isRunningInAstro) {
            return null
        }

        const innerButtonClassName = classnames('t-header__inner-button', 'u-padding-0', {
            't--hide-label': isCollapsed
        })

        const headerBarClassNames = classnames('t-header__bar', {
            't--standalone': isStandaloneApp
        })
        const searchIcon = <Icon name="search" title="Submit search" />
        const clearIcon = <Icon name="close" title="Clear search field" />

        return (
            <header className="t-header" ref={(el) => { this.headerHeight = el ? el.scrollHeight : Number.MAX_VALUE }}>
                <div className={headerBarClassNames}>
                    <HeaderBar>
                        {showBackButton ?
                            <BackAction innerButtonClassName={innerButtonClassName} onClick={goBack} />
                            :
                            <NavigationAction innerButtonClassName={innerButtonClassName} onClick={onMenuClick} />
                        }
                        <UserAction innerButtonClassName={innerButtonClassName} onClick={onSearchOpenClick} />
                        <HeaderTitle isCollapsed={isCollapsed} />
                        {!isStandaloneApp &&
                            <StoresAction innerButtonClassName={innerButtonClassName} />
                        }
                        <CartAction innerButtonClassName={innerButtonClassName} onClick={onMiniCartClick} />
                        {isStandaloneApp &&
                            <MoreMenuAction innerButtonClassName={innerButtonClassName} onClick={onMoreMenuClick} />
                        }
                    </HeaderBar>
                </div>

                <Search
                    className="t-header__search"
                    //isOverlay
                    onClickSuggestion={onSearchCloseClick}
                    //isOpen={searchIsOpen}
                    onChange={this.onChangeSearchQuery}
                    onClose={onSearchCloseClick}
                    onSubmit={this.onSearchSubmit}
                    onClear={clearSuggestions}
                    termSuggestions={searchSuggestions}
                    submitButtonProps={{
                        className: 'pw--secondary t-header__search-submit-button',
                        children: searchIcon
                    }}
                    inputProps={{
                        placeholder: 'Search the entire store',
                        name: 'query'
                    }}
                    closeButtonProps={{
                        className: 'u-visually-hidden',
                        children: 'Dismiss search'
                    }}
                    clearButtonProps={{
                        className: 'u-color-brand',
                        children: clearIcon
                    }}
                />
            </header>
        )
    }
}

Header.propTypes = {
    clearSuggestions: PropTypes.func,
    goBack: PropTypes.func,
    isCollapsed: PropTypes.bool,
    isRunningInAstro: PropTypes.bool,
    isStandaloneApp: PropTypes.bool,
    searchIsOpen: PropTypes.bool,
    searchQueryChanged: PropTypes.func,
    searchSubmit: PropTypes.func,
    searchSuggestions: PropTypes.array,
    showBackButton: PropTypes.bool,
    toggleHeader: PropTypes.func,
    onMenuClick: PropTypes.func,
    onMiniCartClick: PropTypes.func,
    onMoreMenuClick: PropTypes.func,
    onSearchCloseClick: PropTypes.func,
    onSearchOpenClick: PropTypes.func,
}

const mapStateToProps = createPropsSelector({
    isCollapsed: selectors.getIsCollapsed,
    isStandaloneApp,
    searchIsOpen: selectors.getSearchIsOpen,
    searchSuggestions: selectors.getSearchSuggestions,
    showBackButton: selectors.showBackButton,
    isRunningInAstro
})

const mapDispatchToProps = {
    onMenuClick: () => openModal(NAVIGATION_MODAL, UI_NAME.menu),
    onMiniCartClick: miniCartActions.requestOpenMiniCart,
    goBack: headerActions.goBack,
    onSearchOpenClick: headerActions.openSearchModal,
    onSearchCloseClick: headerActions.closeSearchModal,
    onMoreMenuClick: () => openModal(MORE_MENU, 'more_menu'),
    searchSubmit: headerActions.searchSubmit,
    toggleHeader: headerActions.toggleHeader,
    searchQueryChanged: headerActions.searchQueryChanged,
    clearSuggestions: headerActions.clearSuggestions
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header)
