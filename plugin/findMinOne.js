// plugin.js
module.exports = exports = function findMinOnePlugin (schema, options) {
   /**
    * Searches for min one document
    * If docs not greater than 0 it would return an error
    */
   schema.static('findMinOne', function (conditions, callback) {
      return this.find(conditions, function (err, res) {
         if (err) {
            callback(err, res)
         } else if (!res || res.length <= 0) {
            err = new Error('No docs found in schema "' + schema.paths.settings.path + '"!')
            err.code = 'RF001'
            callback(err, res)
         } else {
            callback(err, res)
         }
      })
   })
}
