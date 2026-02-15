// ==UserScript==
// @name         Add mediawiki.org links to repo titles in CodeSearch
// @namespace    http://tampermonkey.net/
// @version      2026-02-15
// @description  Adds links pointing to the mediawiki.org pages of repos in MediaWiki Codesearch
// @author       SomeRandomDeveloper
// @match        https://codesearch.wmcloud.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codesearch.wmcloud.org
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // match extensions and skins hosted on gerrit
    const gerritRegex = /^(Extension|Skin):.+$/;
    // match projects on Github that follow the gerrit repo naming scheme, and unformatted gerrit repo names
    const alternativeRegex = /^[a-zA-Z0-9._-]*\/?mediawiki[-/](extensions|skins)[-/]([a-zA-Z0-9._-]+)$/;

    function createLink(text, href) {
        const a = document.createElement('a');
        a.innerText = text;
        a.href = href;
        return a.outerHTML;
    }

    function tryAddLink(sectionTitle) {
        const projectName = sectionTitle.textContent;

        if (gerritRegex.test(projectName)) {
            sectionTitle.innerHTML = createLink(projectName, `https://mediawiki.org/wiki/${projectName}`);
        } else if (alternativeRegex.test(projectName)) {
            const match = projectName.match(alternativeRegex);
            const type = match[1].charAt(0).toUpperCase() + match[1].slice(1, -1);
            const name = match[2];
            sectionTitle.innerHTML = createLink(projectName, `https://mediawiki.org/wiki/${type}:${name}`);
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const sectionTitles = node.querySelectorAll('section > h2');
                    sectionTitles.forEach(tryAddLink);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    document.querySelectorAll('section > h2').forEach(tryAddLink);
})();
