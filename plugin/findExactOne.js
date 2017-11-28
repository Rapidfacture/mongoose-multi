// plugin.js
module.exports = exports = function findExactOnePlugin (schema, options) {
   /**
    * Searches for one and only one document
    * If more docs are found, it would return an error
    * If no docs are found, it would return an error, too
    */
   schema.static('findExactOne', function (conditions, callback) {
      return this.find(conditions, function (err, data) {
         if (err) {
            callback(err, null)
         } else if (!data) {
            err = new Error('No docs found in schema "' + schema + '"!')
            err.code = 'RF001'
            callback(err, null)
         } else if (data.length > 1) {
            err = new Error('To many docs found in schema "' + schema + '"!')
            err.code = 'RF002'
            callback(err, null)
         } else {
            callback(err, data[0])
         }
      })
   })
}
