var _ = require('lodash');
var log = require('winston');
var walk = require('../../utils/walk');
var getLinkInfo = require('../../utils/link-info');
var INLINE_LINK = /\{@link\s+([^\s\}]+)(?:\s+([^}]+?))?\}/g;
var links;

module.exports = {
  name: 'process-links',

  before: function setup(docs) {
    links = {};
  },

  each: function parseLinks(doc) {
    // Walk the tags and parse the links
    walk(doc, function(property, key) {
      if ( _.isString(property) ) {
        return property.replace(INLINE_LINK, function(match, url, title) {
          var linkInfo = getLinkInfo(doc, url, title);
          links[linkInfo.url] = linkInfo;
          return linkInfo.anchorElement;
        });
      }
      return property;
    });
  },

  after: function checkLinks(docs) {
    log.debug('=== links ===');
    _.forEach(_.map(links, 'url'), function(url) {
      log.debug(url);
    });

    var docMap = {};
    _.forEach(docs, function(doc) {
      docMap[doc.path] = doc;
    });
    log.debug('=== docs ===');
    _.forEach(docMap, function(doc, path) {
      log.debug(path);
    });

    var errCount = 0;
    _.forEach(links, function(link, url) {
      if ( link.type === 'code' && !docMap[url.split('#')[0]] ) {
        log.warn('In doc "' + link.doc.file + '" at line ' + link.doc.startingLine + ': Invalid link, "' + url + '"');
        errCount += 1;
      }
    });
    if ( errCount > 0 ) {
      log.warn(errCount + ' invalid links');
    }
  }
};