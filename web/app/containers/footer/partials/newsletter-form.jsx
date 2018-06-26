/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import * as ReduxForm from 'redux-form'
import isEmail from 'validator/lib/isEmail'

import Button from 'progressive-web-sdk/dist/components/button'
import Field from 'progressive-web-sdk/dist/components/field'
import FieldRow from 'progressive-web-sdk/dist/components/field-row'
import Link from 'progressive-web-sdk/dist/components/link'

import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'
import {NEWSLETTER_FORM_NAME} from '../../../store/form/constants'

const NewsletterForm = ({className, handleSubmit, disabled, submitting, onSubmit}) => {
    return (
        <form id={NEWSLETTER_FORM_NAME} className={className} data-analytics-name={UI_NAME.subscribe} onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="u-margin-bottom-md">Monthly email with news, top potion-making tips and promotions.</p>
            <FieldRow className="u-align-top">
                <ReduxForm.Field
                    component={Field}
                    name="email"
                    label="Email"
                >
                    <input
                        type="email"
                        placeholder="Enter your email..."
                        noValidate
                        data-analytics-name={UI_NAME.email}
                    />
                </ReduxForm.Field>

                <Button
                    type="submit"
                    className="pw--tertiary u-margin-0 u-text-uppercase"
                    disabled={submitting || disabled}
                    data-analytics-name={UI_NAME.subscribe}
                >
                    Sign Up
                </Button>
            </FieldRow>

            <p className="u-margin-top-md u-text-weight-thin u-color-neutral-50">
                We don't share your email address with any third parties and you can opt out at any time.
                Find out more in our <Link href="/privacy-policy-cookie-restriction-mode/">Privacy policy</Link>
            </p>
        </form>
    )
}

NewsletterForm.propTypes = {
    /**
     * Custom classes to apply to <form> element
     */
    className: PropTypes.string,
    /**
     * Whether the form is disabled or not
     */
    disabled: PropTypes.bool,
    /**
     * Redux-form internal
     */
    handleSubmit: PropTypes.func,
    /**
     * Redux-form internal
     */
    submitting: PropTypes.bool,
    /**
    * Submits the form
    */
    onSubmit: PropTypes.func
}

const validate = (values) => {
    const errors = {}
    if (values.email && !isEmail(values.email)) {
        errors.email = 'Enter a valid email address'
    }
    return errors
}

const NewsletterReduxForm = ReduxForm.reduxForm({
    form: NEWSLETTER_FORM_NAME,
    validate,
})(NewsletterForm)

export default NewsletterReduxForm
