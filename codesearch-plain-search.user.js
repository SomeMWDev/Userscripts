// ==UserScript==
// @name         Allow plaintext searching in MediaWiki Codesearch
// @namespace    http://tampermonkey.net/
// @version      2025-08-17
// @description  Adds a "Plain" button next to the search button in MW Codesearch that escapes regex characters before submitting the query
// @author       SomeRandomDeveloper
// @match        https://codesearch.wmcloud.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codesearch.wmcloud.org
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @run-at       document-end
// ==/UserScript==

// make eslint shut up about $ not existing
/*global $*/
(function() {
    'use strict';

    const $queryField = $('input[name=q]');

    const $searchButton = $('#cs-form-submitIdle');
    const $newButton = $searchButton.clone().attr('id', 'plaintext-search').removeAttr('hidden').removeAttr('type').css('position', 'absolute').text('Plain');
    $searchButton.parent().append($newButton);

    $newButton.click((event) => {
        event.preventDefault();
        const query = $queryField.val();
        $queryField.val(query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'));
        $searchButton.click();
    });
})();
