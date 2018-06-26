/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'

import Icon from 'progressive-web-sdk/dist/components/icon'
import {Tabs, TabsPanel} from 'progressive-web-sdk/dist/components/tabs'
import InlineLoader from 'progressive-web-sdk/dist/components/inline-loader'
import * as messagingSelectors from 'progressive-web-sdk/dist/store/push-messaging/selectors'
import {MESSAGING_STATUS} from 'progressive-web-sdk/dist/store/push-messaging/constants'

import * as actions from '../actions'
import InlineAsk from 'progressive-web-sdk/dist/components/inline-ask'
import Link from 'progressive-web-sdk/dist/components/link'
import NewsletterForm from './newsletter-form'

// Cache the initial value of tabIndex, to avoid automatically switching tabs
// due to property changes
let tabIndex = -1

export class FooterNewsletterSubscription extends React.Component {
    getTabIndexAfterLoad() {
        if (tabIndex === -1) {
            // Notifications tab should only be open by default if the user is:
            // - eligible to be subscribed
            // - not already subscribed
            tabIndex = (this.props.canSubscribe && !this.props.isSubscribed) ? 0 : 1
        }

        return tabIndex
    }

    // In the case that we know Messaging is at least supported on the browser,
    // we render a tabbed navigation section
    renderTabs() {
        // Show a loader while the Messaging Client is initializing
        if (this.props.messagingStatus === MESSAGING_STATUS.LOADING) {
            return (
                <div className="t-footer__newsletter-loading">
                    <InlineLoader />
                </div>
            )
        }

        const tabsPanelClasses = 'u-padding-top-lg u-padding-start-md u-padding-end-md'

        return (
            <Tabs activeIndex={this.getTabIndexAfterLoad()}>
                <TabsPanel title="Push notifications" className={tabsPanelClasses}>
                    <InlineAsk
                        buttonText="Opt In"
                        descriptionText="We’ll notify you once in a while with new promotions and products."
                        successText="Successfully subscribed"
                    />

                    <p className="u-margin-top-md u-text-weight-thin u-color-neutral-50">
                        We don’t share personal data with any third parties and you can opt out at any time.
                        Find out more in our <Link href="/privacy-policy-cookie-restriction-mode/">Privacy policy</Link>
                    </p>
                </TabsPanel>
                <TabsPanel title="E-newsletter" className={tabsPanelClasses}>
                    <NewsletterForm onSubmit={this.props.onSubmit} />
                </TabsPanel>
            </Tabs>
        )
    }

    render() {
        const {
            isMessagingSupported,
            messagingStatus,
            onSubmit
        } = this.props

        return (
            <div className="t-footer__newsletter u-padding-top-lg u-padding-bottom-lg">
                <div className="u-margin-bottom-md u-padding-start-md u-padding-end-md u-flexbox u-align-center">
                    <Icon name="alert" title="Subscribe to Notifications" className="u-flex-none" />
                    <h2 className="u-h4 u-padding-start-md">
                        Subscribe to Merlins
                    </h2>
                </div>
                {!isMessagingSupported || messagingStatus === MESSAGING_STATUS.FAILED ?
                    <NewsletterForm onSubmit={onSubmit} className="u-padding-start-md u-padding-end-md" />
                :
                    this.renderTabs()
                }
            </div>
        )
    }
}

FooterNewsletterSubscription.propTypes = {
    canSubscribe: PropTypes.bool.isRequired,
    isMessagingSupported: PropTypes.bool.isRequired,
    isSubscribed: PropTypes.bool.isRequired,
    messagingStatus: PropTypes.number.isRequired,
    onSubmit: PropTypes.func
}

const mapStateToProps = createPropsSelector({
    canSubscribe: messagingSelectors.canSubscribe,
    isSubscribed: messagingSelectors.isSubscribed,
    messagingStatus: messagingSelectors.getStatus,
    isMessagingSupported: messagingSelectors.isSupported
})

const mapDispatchToProps = {
    onSubmit: actions.signUpToNewsletter
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FooterNewsletterSubscription)
