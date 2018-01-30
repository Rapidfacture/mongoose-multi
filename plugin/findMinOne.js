// plugin.js
module.exports = exports = function findMinOnePlugin (schema, options) {
   /**
    * Searches for min one document
    * Return an error otherwise
    */
   schema.static('findMinOne', function (conditions, callback) {
      var q = this.find();
      q.findMinOne = true;
      return q.find(conditions, callback);
   });

   schema.post('find', function (docs, next) {
      if (this.findMinOne === true && (!docs || docs.length < 1)) {
         return next({
            message: 'No docs found!',
            code: 'RF001'
         });
      }
      return next();
   });
};
