// plugin.js
module.exports = exports = function findMinOnePlugin (schema, options) {
   /**
    * Searches for min one document
    * Return an error otherwise
    */
   schema.static('findMinOne', function (conditions, callback) {
      return this.find(conditions, function (err, data) {
         if (!err && (!data || data.length < 1)) {
            err = {
               message: 'No docs found!',
               code: 'RF001'
            }
         }
         callback(err, data)
      })
   })
}
