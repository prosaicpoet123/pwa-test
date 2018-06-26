/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'

import {isRunningInAstro} from '../app/selectors'

import FooterNewsletterSubscription from './partials/footer-newsletter-subscription'
import FooterNavigation from './partials/footer-navigation'

const Footer = ({isRunningInAstro}) => {
    if (isRunningInAstro) {
        return null
    }

    return (
        <footer className="t-footer">
            <FooterNewsletterSubscription />
            <FooterNavigation />
        </footer>
    )
}

Footer.propTypes = {
    isRunningInAstro: PropTypes.bool
}

const mapStateToProps = createPropsSelector({
    isRunningInAstro
})

export default connect(mapStateToProps)(Footer)
