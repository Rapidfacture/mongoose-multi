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
         return next({
            message: 'No docs found!',
            code: 'RF001'
         });
      } else if (this.findExactOne === true && docs.length > 1) {
         return next({
            message: 'To many docs found!',
            code: 'RF002'
         });
      }
      return next();
   });
};
