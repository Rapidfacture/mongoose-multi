// plugin.js
module.exports = exports = function findExactOnePlugin (schema, options) {
   /**
    * Searches for one and only one document
    */
   schema.static('findExactOne', function (conditions, callback) {
      var q = this.find();
      q.findExactOne = true;
      return q.find(conditions, callback);
   });

   schema.post('find', function (docs, next) {
      if (this.findExactOne === true && (!docs || docs.length < 1)) {
         return next(new Error('No docs found!'));
      } else if (this.findExactOne === true && docs.length > 1) {
         return next(new Error('To many docs found!'));
      }
      return next();
   });
};
