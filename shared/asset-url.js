/**
 * Shared asset URL builder and manifest loader.
 * All modules use these instead of constructing GitHub raw URLs directly.
 *
 * To switch from GitHub raw to a CDN, change the single line in getAssetUrl().
 * Load this script before any module scripts.
 */
(function() {
  'use strict';

  /**
   * Build a full URL for a repo-hosted file.
   * @param {Object} config  - { owner, repo, branch }
   * @param {string} [filepath] - path relative to repo root (e.g. "data/N4/lessons/N4.7.json")
   * @returns {string} full URL
   */
  window.getAssetUrl = function(config, filepath) {
    // >>> To switch from GitHub raw to a CDN, change this single line <<<
    var base = 'https://raw.githubusercontent.com/' + config.owner + '/' + config.repo + '/' + config.branch;
    return filepath ? base + '/' + filepath : base;
  };

  // Shared manifest cache (one fetch per page load)
  var _manifestCache = null;
  var _manifestPromise = null;

  /**
   * Fetch and cache manifest.json.  Multiple callers share a single request.
   * @param {Object} config - { owner, repo, branch }
   * @returns {Promise<Object>} parsed manifest
   */
  window.getManifest = function(config) {
    if (_manifestCache) return Promise.resolve(_manifestCache);
    if (_manifestPromise) return _manifestPromise;

    var url = window.getAssetUrl(config, 'manifest.json') + '?t=' + Date.now();
    console.log('[asset-url] Fetching manifest:', url);

    _manifestPromise = fetch(url)
      .then(function(r) {
        if (!r.ok) throw new Error('Failed to load manifest.json: ' + r.status);
        return r.json();
      })
      .then(function(data) {
        _manifestCache = data;
        console.log('[asset-url] Manifest loaded — levels:', data.levels);
        return data;
      });

    return _manifestPromise;
  };
})();
