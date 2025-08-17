// ==UserScript==
// @name         Add export functionality to MW Codesearch
// @namespace    http://tampermonkey.net/
// @version      2025-08-17
// @description  Adds an "Export" button that allows copying a list of repositories with matches
// @author       SomeRandomDeveloper
// @match        https://codesearch.wmcloud.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codesearch.wmcloud.org
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js
// @run-at       document-end
// ==/UserScript==

// make eslint shut up about $ not existing
/*global $*/
(function() {
    'use strict';

    const exportMenu = `
<div class="export card collapse" id="export">
  <h4 class="card-header">Export</h4>
  <div class="card-body">
    <div class="form-group row">
      <label for="export-result-repo-template" class="col-3 col-form-label">Repo Template</label>
      <div class="col-9">
        <textarea id="export-result-repo-template" name="textarea" cols="40" rows="1" aria-describedby="export-result-repo-template-help" class="form-control">- [ ] $1</textarea>
        <span id="export-result-repo-template-help" class="form-text text-muted">Placeholders: $1 - repo name</span>
      </div>
    </div>
    <div class="form-group row">
      <label for="export-result-file-template" class="col-3 col-form-label">File Template</label>
      <div class="col-9">
        <textarea id="export-result-file-template" name="textarea" cols="40" rows="1" aria-describedby="export-result-file-template-help" class="form-control">  - [ ] $1</textarea>
        <span id="export-result-file-template-help" class="form-text text-muted">Placeholders: $1 - file name</span>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-3">Options</label>
      <div class="col-9">
        <div class="custom-control custom-checkbox custom-control-inline">
          <input id="export-options-include-files" type="checkbox" class="custom-control-input" checked>
          <label for="export-options-include-files" class="custom-control-label">Include files</label>
        </div>
      </div>
    </div>
    <div class="form-group row">
      <div class="offset-3 col-9">
        <button name="submit" class="btn btn-primary" id="copy-export-result">Copy results to clipboard</button>
      </div>
    </div>
  </div>
</div>
    `;

    const button = `
 <button data-bs-toggle="collapse" data-bs-target="#export" class="btn btn-secondary">Export...</button>
    `


    function addButton(node) {
        $(node).find('#cs-result-Default').parent().append($(button));
        const $exportMenu = $(exportMenu);
        $(node).after($exportMenu);
        $exportMenu.find('#copy-export-result').click(() => {
            let result = "";
            const repoTemplate = $exportMenu.find('#export-result-repo-template').val();
            const fileTemplate = $exportMenu.find('#export-result-file-template').val();
            const exportFiles = $exportMenu.find('#export-options-include-files').is(':checked');
            $('.cs-results h2').each((_, repoTitle) => {
                const repoName = $(repoTitle).text();
                if (repoName && repoName !== '') {
                    result += repoTemplate.replace('$1', () => repoName) + '\n';
                }
                if (exportFiles) {
                    $(repoTitle).parent().find('.card-header > a.link-secondary').each((_, fileLink) => {
                        const fileName = $(fileLink).text();
                        if (fileName && fileName !== '') {
                            result += fileTemplate.replace('$1', () => fileName) + '\n';
                        }
                    });
                }
            });
            navigator.clipboard.writeText(result);
            console.log(result);
            $exportMenu.find('#copy-export-result').removeClass('btn-primary').addClass('btn-success');
        });

        $exportMenu.find('#export-options-include-files').change(function() {
            if (this.checked) {
                $('#export-result-file-template').removeAttr('disabled');
            } else {
                $('#export-result-file-template').attr('disabled', true);
            }
        });
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.matches('div:has(#cs-result-Default)')) {
                        addButton(node);
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();
