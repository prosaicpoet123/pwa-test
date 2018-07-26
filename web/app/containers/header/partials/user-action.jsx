import React from 'react'
import PropTypes from 'prop-types'

import Button from 'progressive-web-sdk/dist/components/button'
import IconLabel from 'progressive-web-sdk/dist/components/icon-label'
import {HeaderBarActions} from 'progressive-web-sdk/dist/components/header-bar'
import {UI_NAME} from 'progressive-web-sdk/dist/analytics/data-objects/'

import {USER_URL} from '../../app/constants'

//need to import location url from '../../app/constants' (the destination needs to be named and defined in here)

const UserAction = ({innerButtonClassName}) => (
    <HeaderBarActions className="t-header-bar__user">
        <Button
            innerClassName={innerButtonClassName}
            className="t-header__link"
            href={USER_URL}
            data-analytics-name={UI_NAME.showMyAccount}
        >
            <IconLabel label="Account" iconName="user" iconSize="medium" />
        </Button>
    </HeaderBarActions>
)

UserAction.propTypes = {
    innerButtonClassName: PropTypes.string
}

export default UserAction