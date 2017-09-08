// mongoose-multi connections
/* jshint node: true, esversion:6 */ "use strict";

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

// logging
var log = {
   error : console.log,
   info : console.log,
   success : console.log,
};
try { // try using rf-log
   log = require(require.resolve("rf-log"));
} catch (e) {}
function logError (err){
   throw new Error(err);
}

// public vars
module.exports.db = {};
module.exports.schemaFile = {};
module.exports.connections = {};

module.exports.start = function(connections, schemaFile) {

      var db = module.exports.db;
      module.exports.connections = connections;
      module.exports.schemaFile = schemaFile;


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
            log.error("[mongoose-multi] Error - no name specified for db");
            return;
         } else if (!url) {
            log.error("[mongoose-multi] Error -  no url defined for db " + name);
            return;
         } else if (!schemas) {
            log.error("[mongoose-multi] Error - no schema found for db " + name);
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
            log.info('[mongoose-multi] DB ' + name + ' connecting to ' + url);
         });
         dbcon.on('error', function(error) {
            log.error('[mongoose-multi] DB ' + name + ' connection error: ', error);
            mongoose.disconnect();
         });
         dbcon.on('connected', function() {
            log.success('[mongoose-multi] DB ' + name + ' connected');
         });
         dbcon.once('open', function() {
            log.info('[mongoose-multi] DB ' + name + ' connection open');

            for (var schemaName in schemas) {
               if (schemas[schemaName] == "gridfs") {
                  db[name][schemaName + "s"] = Grid(dbcon.db);
                  log.info('[mongoose-multi] DB ' + name + ': Gridfs connected');
               }
            }
         });
         dbcon.on('reconnected', function() {
            log.success('[mongoose-multi] DB ' + name + ' reconnected, ' + url);
         });
         dbcon.on('disconnected', function() {
            log.error('[mongoose-multi] DB ' + name + ' disconnected, ' + url);

            // there have been several issues with reconnecting
            // we simple restart the whole process and try it again
            if(options.server.auto_reconnect !== false){
               setTimeout(function () {
                  process.exit(0);
               }, 10000);
            }

         });

      }

      return db;
};
