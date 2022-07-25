// mongoose-multi connections

var fs = require('fs');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Register plugins
mongoose.plugin(require('./plugin/findMinOne'));
mongoose.plugin(require('./plugin/findExactOne'));


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
               var words = fileName.split('.');
               var dbName = words[0];
               var extension = words[words.length - 1];

               if (fs.statSync(filePath).isDirectory()) {
                  log.critical('tried to require ' + fileName + ', but path is a folder! Aborting. Please Check your Schema folder.');
               }

               if (extension === 'js') {
                  var dbSchema = require(filePath);
                  schemaFile[dbName] = dbSchema;
               }
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
      if (!name) return log.error('[mongoose-multi] Error - no name specified for db');
      if (!url) return log.error('[mongoose-multi] Error -  no url defined for db ' + name);
      if (!schemas) return log.error('[mongoose-multi] Error - no schema found for db ' + name);

      // merge options
      options = options || {};
      options.useUnifiedTopology = true;


      // connect database
      connections[name] = mongoose.createConnection(url, options);

      var dbcon = connections[name];

      // assemble the return object

      // return pure mongoose connection => use in other modules; use the events above
      db[name] = { mongooseConnection: dbcon };

      // create connections for this database
      for (var schemaName in schemas) {
         var pluralAddition = (schemaName[schemaName.length - 1] === 's') ? 'es' : 's';
         db[name][schemaName + pluralAddition] = dbcon.model(schemaName, schemas[schemaName]);
      }

      var prefix = '[mongoose-multi] DB ' + name;

      dbcon.on('connecting', function () {
         log.info(prefix + ' connecting to ' + url);
      });
      dbcon.on('error', function (error) {
         log.error(prefix + ' connection error: ', error);
         mongoose.disconnect();
      });
      dbcon.on('connected', function () {
         log.success(prefix + ' connected');
      });
      dbcon.once('open', function () {
         log.info(prefix + ' connection open');
      });
      dbcon.on('reconnected', function () {
         log.success(prefix + ' reconnected, ' + url);
      });
      dbcon.on('disconnected', function () {
         log.error(prefix + ' disconnected, ' + url);

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
