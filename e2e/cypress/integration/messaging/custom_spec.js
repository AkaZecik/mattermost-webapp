// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

import users from '../../fixtures/users.json';

const userActive = users['user-1'];
const userInactive = users['user-2'];

// TODO change name
describe('Messages', () => {
    it('M23349 - Deactivated users are not shown in Direct Messages modal', () => {
        // TODO: delete a direct channel to ensure it does not exist?

        // # Deactivate "user-2"
        cy.apiLogin('sysadmin');
        cy.apiGetUserByEmail(userInactive.email).then((res) => {
            const user = res.body;
            cy.apiActivateUser(user.id, false);
        });

        // # Login as "user-1"
        cy.apiLogin(userActive.username);
        cy.visit('/ad-1/channels/town-square');

        // # click on '+' sign next to 'Direct Messages'
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.TINY);

        // * Assert that 'Direct Messages' modal appears
        cy.get('#moreDmModal').should('be.visible');

        // # Search for a user
        cy.get('#selectItems input').focus().type(userInactive.email, {force: true}).wait(TIMEOUTS.TINY);

        // * Assert that the input box contains searched email
        cy.get('#selectItems input').should('have.value', userInactive.email);

        // * Assert that the inactive user is not found
        cy.get('#moreDmModal .no-channel-message').should('be.visible').and('contain', 'No items found');
    });

    it('M23349 - Deactivated users are shown in Direct Messages modal after previous conversations', () => {
        // # Login as 'user-1'
        cy.apiLogin(userActive.username);

        // # Create a Direct Messages between 'user-2'
        cy.apiGetUsers([userActive.username, userInactive.username]).then((res) => {
            const usersInfo = res.body;
            cy.apiCreateDirectChannel(usersInfo.map((user) => user.id));
        });

        // # Send a message to 'user-2'
        cy.visit(`/ad-1/messages/@${userInactive.username}`);
        cy.postMessage('Hello world!');

        // # Deactivate 'user-2'
        cy.apiLogin('sysadmin');
        cy.apiLogout();
        cy.apiGetUserByEmail(userInactive.email).then((res) => {
            const user = res.body;
            cy.apiActivateUser(user.id, false);
        });

        // ##############

        // # Login again as 'user-1'
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/town-square');

        // # click on '+' sign next to 'Direct Messages'
        cy.get('#addDirectChannel').click().wait(TIMEOUTS.TINY);

        // * Assert that 'Direct Messages' modal appears
        cy.get('#moreDmModal').should('be.visible');

        // # Search for a user
        cy.get('#selectItems input').focus().type(userInactive.email, {force: true}).wait(TIMEOUTS.TINY);

        // * Assert that the input box contains searched email
        cy.get('#selectItems input').should('have.value', userInactive.email);

        // * Assert that the inactive user is not found
        cy.get('#moreDmModal .no-channel-message').should('be.visible').and('contain', userInactive.username);
    });

    // it('M13909 Escape should not close modal when an autocomplete drop down is in use', () => {
    //     // # and go to /
    //     cy.visit('/ad-1/channels/town-square');
    //
    //     // # Post message "Hello"
    //     cy.postMessage('Hello World!');
    //
    //     // # Hit the up arrow to open the "edit modal"
    //     cy.get('#post_textbox').type('{uparrow}');
    //
    //     // # In the modal type @
    //     cy.get('#edit_textbox').type(' @');
    //
    //     // * Assert user autocomplete is visible
    //     cy.get('#suggestionList').should('be.visible');
    //
    //     // # Press the escape key
    //     cy.get('#edit_textbox').wait(TIMEOUTS.TINY).focus().type('{esc}');
    //
    //     // * Check if the textbox contains expected text
    //     cy.get('#edit_textbox').should('have.value', 'Hello World! @');
    //
    //     // * Assert user autocomplete is not visible
    //     cy.get('#suggestionList').should('not.exist');
    //
    //     // # In the modal type ~
    //     cy.get('#edit_textbox').type(' ~');
    //
    //     // * Assert channel autocomplete is visible
    //     cy.get('#suggestionList').should('be.visible');
    //
    //     // # Press the escape key
    //     cy.get('#edit_textbox').wait(TIMEOUTS.TINY).type('{esc}');
    //
    //     // * Check if the textbox contains expected text
    //     cy.get('#edit_textbox').should('have.value', 'Hello World! @ ~');
    //
    //     // * Assert channel autocomplete is not visible
    //     cy.get('#suggestionList').should('not.exist');
    //
    //     // # In the modal click the emoji picker icon
    //     cy.get('#editPostEmoji').click();
    //
    //     // * Assert emoji picker is visible
    //     cy.get('#emojiPicker').should('be.visible');
    //
    //     // * Press the escape key
    //     cy.get('#edit_textbox').wait(TIMEOUTS.TINY).type('{esc}');
    //
    //     // * Assert emoji picker is not visible
    //     cy.get('#emojiPicker').should('not.exist');
    // });
    //
    // it('M13482 Display correct timestamp for edited message', () => {
    //     // # and go to /
    //     cy.visit('/ad-1/channels/town-square');
    //
    //     // # Post a message
    //     cy.postMessage('Checking timestamp');
    //
    //     cy.getLastPostId().then((postId) => {
    //         // # Mouseover post to display the timestamp
    //         cy.get(`#post_${postId}`).trigger('mouseover');
    //
    //         cy.get(`#CENTER_time_${postId}`).find('time').invoke('attr', 'title').then((originalTimeStamp) => {
    //             // # Click dot menu
    //             cy.clickPostDotMenu(postId);
    //
    //             // # Click the edit button
    //             cy.get(`#edit_post_${postId}`).click();
    //
    //             // # Edit modal should appear
    //             cy.get('.edit-modal').should('be.visible');
    //
    //             // # Edit the post
    //             cy.get('#edit_textbox').type('Some text {enter}');
    //
    //             // * Edit modal should disappear
    //             cy.get('.edit-modal').should('not.be.visible');
    //
    //             // # Mouseover the post again
    //             cy.get(`#post_${postId}`).trigger('mouseover');
    //
    //             // * Current post timestamp should have not been changed by edition
    //             cy.get(`#CENTER_time_${postId}`).find('time').should('have.attr', 'title').and('equal', originalTimeStamp);
    //
    //             // # Open RHS by clicking the post comment icon
    //             cy.clickPostCommentIcon(postId);
    //
    //             // * Check that the RHS is open
    //             cy.get('#rhsContainer').should('be.visible');
    //
    //             // * Check that the RHS timeStamp equals the original post timeStamp
    //             cy.get(`#CENTER_time_${postId}`).find('time').invoke('attr', 'title').should('be', originalTimeStamp);
    //         });
    //     });
    // });
    //
    // it('M15519 Open edit modal immediately after making a post when post is pending', () => {
    //     // # and go to /. We set fetch to null here so that we can intercept XHR network requests
    //     cy.visit('/ad-1/channels/town-square');
    //
    //     // # Enter first message
    //     cy.postMessage('Hello');
    //
    //     // * Verify first message is sent and not pending
    //     cy.getLastPostId().then((postId) => {
    //         const postText = `#postMessageText_${postId}`;
    //         cy.get(postText).should('have.text', 'Hello');
    //     });
    //
    //     // # Enter second message
    //     cy.postMessage('World!');
    //
    //     // * Verify second message is sent and not pending
    //     cy.getLastPostId().then((postId) => {
    //         const postText = `#postMessageText_${postId}`;
    //         cy.get(postText).should('have.text', 'World!');
    //
    //         // # Edit the last post
    //         cy.get('#post_textbox').type('{uparrow}');
    //
    //         // * Edit post modal should appear, and edit the post
    //         cy.get('#editPostModal').should('be.visible');
    //         cy.get('#edit_textbox').should('have.text', 'World!').type(' Another new message{enter}');
    //         cy.get('#editPostModal').should('be.not.visible');
    //
    //         // * Check the second post and verify that it contains new edited message.
    //         cy.get(postText).should('have.text', 'World! Another new message');
    //     });
    // });
});
