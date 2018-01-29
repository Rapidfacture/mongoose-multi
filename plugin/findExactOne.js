// plugin.js
module.exports = exports = function findExactOnePlugin (schema, options) {
   /**
    * Searches for one and only one document
    */
   schema.static('findExactOne', function (conditions, callback) {
      return this.find(conditions, function (err, data) {
         // error: database
         if (err) {
            callback(err, null)

         // error: no document
         } else if (!data || !data[0]) {
            callback({
               message: 'No docs found!',
               code: 'RF001'
            }, null)

         // error: several documents
         } else if (data.length > 1) {
            callback({
               message: 'To many docs found!',
               code: 'RF002'
            }, null)

         // fine
         } else {
            callback(null, data[0])
         }
      })
   })
}
