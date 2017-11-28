// plugin.js
module.exports = exports = function findMinOnePlugin (schema, options) {
   /**
    * Searches for min one document
    * If docs not greater than 0 it would return an error
    */
   schema.static('findMinOne', function (conditions, callback) {
      return this.find(conditions, function (err, data) {
         if (!data || data.length <= 0) {
            err = new Error('No docs found in schema "' + schema + '"!')
            err.code = 'RF001'
         }
         callback(err, data)
      })
   })
}
