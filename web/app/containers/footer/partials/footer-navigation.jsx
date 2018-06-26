/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'

import Link from 'progressive-web-sdk/dist/components/link'
import {supportedLanguages} from '../../../config/translations-config'
import {createPropsSelector} from 'reselect-immutable-helpers'
import * as appActions from '../../app/actions'

const buildLanguageLinks = () => {
    const languageLinks = []
    Object.keys(supportedLanguages).forEach((locale) => {
        languageLinks.push({text: supportedLanguages[locale], locale})
    })

    return languageLinks
}

const languageLinks = buildLanguageLinks()

const footerLinks = [
    {text: 'Home', href: '/'},
    {text: 'Privacy and Cookie Policy', href: '/privacy-policy-cookie-restriction-mode/'},
    {text: 'Search Terms', href: '/search/term/popular/'},
    {text: 'Contact Us', href: '/contact/'},
    {text: 'Orders and Returns', href: '/sales/guest/form/'},
    {text: 'Advanced Search', href: '/catalogsearch/advanced'}
]

const FooterNavigation = ({changeLocale}) => {
    return (
        <div className="t-footer__navigation u-padding-lg u-text-align-center">
            <div>
                {languageLinks.map(({text, locale}, index) => (
                    <Link
                        className="t-footer__navigation-link"
                        key={index}
                        onClick={() => { changeLocale(locale) }}
                        data-analytics-name={UI_NAME.setLanguage}
                        data-analytics-content={locale}
                    >
                        {text}
                    </Link>
                ))}
            </div>
            {footerLinks.map(({text, href}, index) => (
                <Link className="t-footer__navigation-link" href={href} key={index}>
                    {text}
                </Link>
            ))}
        </div>
    )
}

FooterNavigation.propTypes = {
    /**
    * Sets the current locale and updates translations for the site
    */
    changeLocale: PropTypes.func
}

const mapStateToProps = createPropsSelector({})
const mapDispatchToProps = {
    changeLocale: appActions.changeLocale
}

export default connect(mapStateToProps, mapDispatchToProps)(FooterNavigation)
