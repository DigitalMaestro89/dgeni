var tagUtil = require('../utils/tags');
var _ = require('lodash');

module.exports = function extractTagsFactory(tagDefs) {
  
  return function(doc) {

    // Try to extract each of the tags defined in the tagDefs collection
    _.forEach(tagDefs, function(tagDef) {

      var tagProperty = tagDef.tagProperty || 'description';
      var docProperty = tagDef.docProperty || tagDef.name;

      // The function to get the property value from the tag to the doc
      var getProperty = tagDef.transformFn || function(doc, tag) { return tag[tagProperty]; };

      // Collect the tags for this tag def
      var tags = tagUtil.getTags(doc.tags, tagDef.name);
      
      // Also collect tags using alias names
      _.forEach(tagDef.aliases, function(alias) {
        tags = tags.concat(tagUtil.getTags(doc.tags, alias));
      });

      // No tags found for this tag def
      if ( tags.length === 0 ) {

        // This tag is required so throw an error
        if ( tagDef.required ) {
          throw new Error('Missing tag "' + tagDef.name + '" in file "' + doc.file + '" at line ' + doc.startingLine);
        }

        // Apply the default function if there is one
        if ( tagDef.defaultFn ) {
          tagDef.defaultFn(doc);
        }

      } else if ( tagDef.multi ) {

        // We may have multiple tags for this tag def, so we put them into an array
        doc[docProperty] = doc[docProperty] || [];
        _.forEach(tags, function(tag) {
          // Transform and add the tag to the array
          doc[docProperty].push(getProperty(doc, tag));
        });

      } else {

        // We only expect one tag for this tag def
        if ( tags.length > 1 ) {
          throw new Error('Only one of "' + tagDef.name + '" (or its aliases) allowed. There were ' + tags.length + ' in file "' + doc.file + '" at line ' + doc.startingLine);
        }

        // Transform and apply the tag to the document
        doc[docProperty] = getProperty(doc,tags[0]);
      }
    });
  }
};