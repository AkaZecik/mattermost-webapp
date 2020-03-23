// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {browserHistory} from 'utils/browser_history';
import {AnnouncementBarTypes, AnnouncementBarMessages, VerifyEmailErrors} from 'utils/constants';
import logoImage from 'images/logo.png';
import BackButton from 'components/common/back_button';
import LoadingScreen from 'components/loading_screen';

import * as GlobalActions from 'actions/global_actions.jsx';

type Props = {
    location: { // Object with validation parameters given in link
        search: string;
    };
    sitename?: string; // Title of the app or site.
    actions: { // Object with redux action creators
        verifyUserEmail: () => void; // Action creator to verify the user's email
        getMe: () => void; // Action creator to update the user in the redux store
        logError: () => void;
        clearErrors: () => void;
    };
    user?: { // Object representing the current user
        email_verifies: boolean;
    };
    isLoggedIn: boolean;
}

export default class DoVerifyEmail extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);

        this.state = {
            verifyStatus: 'pending',
            serverError: '',
        };
    }

    componentDidMount() {
        this.verifyEmail();
    }

    handleRedirect() {
        if (this.props.isLoggedIn) {
            GlobalActions.redirectUserToDefaultTeam();
        } else {
            browserHistory.push('/login?extra=verified&email=' + encodeURIComponent((new URLSearchParams(this.props.location.search)).get('email')));
        }
    }

    handleSuccess() {
        this.setState({verifyStatus: 'success'});
        this.props.actions.clearErrors();
        if (this.props.isLoggedIn) {
            this.props.actions.logError({
                message: AnnouncementBarMessages.EMAIL_VERIFIED,
                type: AnnouncementBarTypes.SUCCESS,
            }, true);
            trackEvent('settings', 'verify_email');
            this.props.actions.getMe().then(({data, error: err}) => {
                if (data) {
                    this.handleRedirect();
                } else if (err) {
                    this.handleError(VerifyEmailErrors.FAILED_USER_STATE_GET);
                }
            });
        } else {
            this.handleRedirect();
        }
    }

    handleError(type) {
        let serverError = '';
        if (type === VerifyEmailErrors.FAILED_EMAIL_VERIFICATION) {
            serverError = (
                <FormattedMessage
                    id='signup_user_completed.invalid_invite'
                    defaultMessage='The invite link was invalid. Please speak with your Administrator to receive an invitation.'
                />
            );
        } else if (type === VerifyEmailErrors.FAILED_USER_STATE_GET) {
            serverError = (
                <FormattedMessage
                    id='signup_user_completed.failed_update_user_state'
                    defaultMessage='Please clear your cache and try to log in.'
                />
            );
        }
        this.setState({
            verifyStatus: 'failure',
            serverError,
        });
    }

    verifyEmail = async () => {
        const hehe: URLSearchParams = new URLSearchParams('?hello=world');
        const {actions: {verifyUserEmail}} = this.props;
        const verify = await verifyUserEmail((new URLSearchParams(this.props.location.search)).get('token'));

        if (verify && verify.data) {
            this.handleSuccess();
        } else if (verify && verify.error) {
            this.handleError(VerifyEmailErrors.FAILED_EMAIL_VERIFICATION);
        }
    }

    render() {
        if (this.state.verifyStatus !== 'failure') {
            return (<LoadingScreen/>);
        }

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <img
                            alt={'signup team logo'}
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <div className='signup__content'>
                            <h1>{this.props.siteName}</h1>
                            <h4 className='color--light'>
                                <FormattedMessage
                                    id='web.root.signup_info'
                                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                                />
                            </h4>
                            {serverError}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

DoVerifyEmail.defaultProps = {
    location: {},
};
