// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {GenericAction} from 'mattermost-redux/types/actions';

import {deleteAndRemovePost} from 'actions/post_actions.jsx';

import DeletePostModal from './delete_post_modal';

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            deleteAndRemovePost,
        }, dispatch),
    };
}

export default withRouter(connect(null, mapDispatchToProps)(DeletePostModal));
