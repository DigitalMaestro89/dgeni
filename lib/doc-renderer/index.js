var _ = require('lodash');
var Q = require('q');
var nunjucks = require('nunjucks');
var log = require('winston');
var writer = require('../utils/doc-writer');

module.exports = function docRendererFactory(templateFolder, outputFolder, customFilters, customTags) {

  var env = nunjucks.configure(templateFolder, {
    tags: {
      variableStart: '{$',
      variableEnd: '$}'
    }
  });

  _.forEach(customFilters, function(filter) {
    env.addFilter(filter.name, filter.process);
  });

  _.forEach(customTags, function(customTag) {
    env.addExtension(customTag.tags[0], customTag);
  });

  var helpers = {
  };

  /**
   * Render the set of documents to the output folder and extra data, using the templates found in the given folder
   * @param  {object} doc          The document to render
   * @param  {object} extra        Extra data to make available to the rendering
   * @returns {promise}            A promise to each of the output paths, resolved when all the docs have
   *                               been rendered and output
   */
  return function render(docs, extra) {
    var fileWritePromises = [];
    
    _.forEach(docs, function(doc) {
      var data = _.defaults({}, { doc: doc }, extra, helpers);
      var res = nunjucks.render(data.doc.docType + '.template.html', data);
      var outputPath = outputFolder + doc.filePath;
      
      fileWritePromises.push(writer.writeFile(outputPath, res).then(function() {
        log.debug('Rendered doc', outputPath);
        return outputPath;
      }));
    });

    return Q.all(fileWritePromises);
  };

};