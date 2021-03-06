/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React from 'react'
import PropTypes from 'prop-types'
import {Field as ReduxFormField} from 'redux-form'

import Field from 'progressive-web-sdk/dist/components/field'
import FieldRow from 'progressive-web-sdk/dist/components/field-row'
import PasswordInput from 'progressive-web-sdk/dist/components/password-input'
import Link from 'progressive-web-sdk/dist/components/link'

export const LoginFieldLabel = ({label, forgotPassword}) => (
    <span>
        {label}

        {forgotPassword &&
            <Link className="u-float-end u-text-weight-regular" href={forgotPassword.href}>
                Forgot Your Password?
            </Link>
        }
    </span>
)

LoginFieldLabel.propTypes = {
    forgotPassword: PropTypes.shape({
        href: PropTypes.string,
        title: PropTypes.string
    }),
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
}

export const LoginField = ({label, type, forgotPassword, name, tooltip, analyticsName, isPassword}) => (
    <FieldRow>
        <ReduxFormField
            name={name}
            label={<LoginFieldLabel label={label} forgotPassword={forgotPassword} />}
            component={Field}
            >
            {isPassword ?
                <PasswordInput isText buttonTextHide="Hide" buttonTextShow="Show" analyticsName={analyticsName} />
            :
                <input type={type} data-analytics-name={analyticsName} />
            }
        </ReduxFormField>

        {tooltip}
    </FieldRow>
)

LoginField.propTypes = {
    analyticsName: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    forgotPassword: PropTypes.object,
    isPassword: PropTypes.bool,
    tooltip: PropTypes.node
}
