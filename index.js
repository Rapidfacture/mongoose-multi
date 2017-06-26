// mongoose-multi connections

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

module.exports = {

   start: function(connections, schemaFile, logFunction) {

      var db = {};

      for (var conName in connections) {
         var connection = connections[conName];

         var options = {}, url = connection;
         // obj holding url + options => transform
         if (typeof connection != "string"){
            options = connection.options || {};
            url = connection.url;
         }
         startConnection(conName, url, schemaFile[conName], options);
      }

      function startConnection(name, url, schemas, options) {

         // check input data
         if (!name) {
            console.error("Error - no name specified for db");
            return;
         } else if (!url) {
            console.error("Error -  no url defined for db " + name);
            return;
         } else if (!schemas) {
            console.error("Error - no schema found for db " + name);
            return;
         }

         // merge options
         options = options || {};
         options.server = options.server || {};
         if (options.server.auto_reconnect !== false) {
            options.server.auto_reconnect = true;
         }


         // connect database
         connections[name] = mongoose
            .createConnection(url, options);

         var dbcon = connections[name];

         // assemble the return object

         // return pure mongoose connection => use in other modules; use the events above
         db[name] = {
            mongooseConnection: dbcon
         };

         // create connections for this database
         for (var schemaName in schemas) {
            if (schemas[schemaName] != "gridfs") { // gridfs?
               db[name][schemaName + "s"] = dbcon.model(schemaName, schemas[schemaName]);
            }
         }


         dbcon.on('connecting', function() {
            log('DB ' + name + ' connecting to ' + url);
         });
         dbcon.on('error', function(error) {
            log('DB ' + name + ' connection error: ', error);
            mongoose.disconnect();
         });
         dbcon.on('connected', function() {
            log('DB ' + name + ' connected');
         });
         dbcon.once('open', function() {
            log('DB ' + name + ' connection open');

            for (var schemaName in schemas) {
               if (schemas[schemaName] == "gridfs") {
                  db[name][schemaName + "s"] = Grid(dbcon.db);
                  log('DB ' + name + ': Gridfs connected');
               }
            }
         });
         dbcon.on('reconnected', function() {
            log('DB ' + name + ' reconnected, ' + url);
         });
         dbcon.on('disconnected', function() {
            log('DB ' + name + ' disconnected, ' + url);
            // connect();
            // => not needed; auto_reconnect active
         });

      }

      function log(text) {
         text = '[mongoose-multi] ' + text;
         if (logFunction) { // plug in your log function
            logFunction(text);
         } else {
            console.log(text);
         }
      }

      return db;
   }

};
