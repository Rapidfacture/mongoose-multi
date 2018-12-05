// mongoose-multi connections

var fs = require('fs');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Register plugins
mongoose.plugin(require('./plugin/findMinOne'));
mongoose.plugin(require('./plugin/findExactOne'));

var grid = require('gridfs-stream');
grid.mongo = mongoose.mongo;

// logging
var log;
try { // try using rf-log
   log = require(require.resolve('rf-log'));
} catch (e) {
   log = {
      error: console.log,
      info: console.log,
      success: console.log,
      critical: console.error
   };
}


// public vars
module.exports.db = {};
module.exports.schemaFile = {};
module.exports.connections = {};

module.exports.start = function (connections, schemaFile) {
   var db = module.exports.db;
   module.exports.connections = connections;


   if (typeof schemaFile === 'string') {
      var schemaPath = schemaFile;
      schemaFile = {};

      // extract all schemas from schemafile or folder with schema files
      try {
         if (fs.statSync(schemaPath).isDirectory()) {
         // require all files within folder,  extract db schema and sort in corresponding obj
         // NOTE: files need to have the same name as the database

            fs.readdirSync(schemaPath).forEach(function (fileName) {
               var filePath = schemaPath + '/' + fileName;

               if (fs.statSync(filePath).isDirectory()) {
                  log.critical('tried to require ' + fileName + ', but path is a folder! Aborting. Please Check your Schema folder.');
               }

               var dbSchema = require(filePath);
               var dbName = fileName.split('.js')[0];
               schemaFile[dbName] = dbSchema;
            });
         } else { //  path is the schmea file
            schemaFile = require(schemaPath);
         }
      } catch (error) {
         log.critical('tried extract schemas, please Check your Schema folder, an error occured: ' + error);
      }
   } // else => schemaFile is already the complete schema obj


   module.exports.schemaFile = schemaFile;


   for (var conName in connections) {
      var connection = connections[conName];

      var options = {}, url = connection;
      // obj holding url + options => transform
      if (typeof connection !== 'string') {
         options = connection.options || {};
         url = connection.url;
      }

      // add mongoose option for newer version to prevent deprecation warning
      options.useNewUrlParser = options.useNewUrlParser || true;

      startConnection(conName, url, schemaFile[conName], options);
   }

   function startConnection (name, url, schemas, options) {
      // check input data
      if (!name) {
         log.error('[mongoose-multi] Error - no name specified for db');
         return;
      } else if (!url) {
         log.error('[mongoose-multi] Error -  no url defined for db ' + name);
         return;
      } else if (!schemas) {
         log.error('[mongoose-multi] Error - no schema found for db ' + name);
         return;
      }

      // merge options
      options = options || {};
      if (options.auto_reconnect !== false) {
         options.auto_reconnect = true;
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
         if (schemas[schemaName] !== 'gridfs') { // gridfs?
            var pluralAddition = (schemaName[schemaName.length - 1] === 's') ? 'es' : 's';
            db[name][schemaName + pluralAddition] = dbcon.model(schemaName, schemas[schemaName]);
         }
      }

      dbcon.on('connecting', function () {
         log.info('[mongoose-multi] DB ' + name + ' connecting to ' + url);
      });
      dbcon.on('error', function (error) {
         log.error('[mongoose-multi] DB ' + name + ' connection error: ', error);
         mongoose.disconnect();
      });
      dbcon.on('connected', function () {
         log.success('[mongoose-multi] DB ' + name + ' connected');
      });
      dbcon.once('open', function () {
         log.info('[mongoose-multi] DB ' + name + ' connection open');

         for (var schemaName in schemas) {
            if (schemas[schemaName] === 'gridfs') {
               var pluralAddition = (schemaName[schemaName.length - 1] === 's') ? 'es' : 's';
               db[name][schemaName + pluralAddition] = grid(dbcon.db);
               log.info('[mongoose-multi] DB ' + name + ': Gridfs connected');
            }
         }
      });
      dbcon.on('reconnected', function () {
         log.success('[mongoose-multi] DB ' + name + ' reconnected, ' + url);
      });
      dbcon.on('disconnected', function () {
         log.error('[mongoose-multi] DB ' + name + ' disconnected, ' + url);

         // there have been several issues with reconnecting
         // we simple restart the whole process and try it again
         if (options.auto_reconnect !== false) {
            setTimeout(function () {
               log.error('[mongoose-multi] shutting down application for restart: Try to reconnet DB.');
               process.exit(0);
            }, 10000);
         }
      });
   }

   return db;
};
