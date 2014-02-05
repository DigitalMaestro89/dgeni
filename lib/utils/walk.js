var _ = require('lodash');

/**
 * Walk the properties in an object and items in array, recursively, calling a function on each
 * property
 * @param  {object|array} items The things to process
 * @param {function} fn The function (of the form `function(property, key) { return newProperty; }`) to apply to each property, recursively
 */
module.exports = function walk(items, fn) {

  // We need to track what objects have been walked to account for circular references
  var parents = [items];

  function processProperty(property, key) {
    if ( parents.indexOf(property) === -1 ) {
      if ( _.isArray(property) || _.isObject(property) ) {
        parents.push(property);
        _.forEach(_.keys(property), function(key) {
          property[key] = processProperty(property[key], key);
        });
        parents.pop();
      }
      return fn(property, key);
    }
    return property;
  }

  _.forEach(_.keys(items), function(key) {
    items[key] = processProperty(items[key], key);
  });

  return items;
};