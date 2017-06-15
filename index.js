// mongoose-multi connections

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = {

    start: function (connections, logFunction) {

      var db = {};

      for (var conName in connections) {
        var con = connections[conName];
        startConnection(con.name, con.url, con.schemas, con.options);
      }

      function startConnection(name, url, schemas, options) {

        // check input data
        if (!name) {
          console.error("Error - no name specified for db");
          return;
        }else if (!url) {
          console.error("Error -  no url defined for db " + name);
          return;
        }else if (!schemas) {
          console.error("Error - no schema found for db " + name);
          return;
        }

        // merge options
        options = options || {};
        options.server = options.server || {};
        if(options.server.auto_reconnect !== false){
            options.server.auto_reconnect = true;
        }


        connections[name] = mongoose
          .createConnection(url, options);

        var dbcon = connections[name];

        dbcon.on('connecting', function() {
          log('DB ' + name + ' connecting to ' + url);
        });
        dbcon.on('error', function(error) {
          log('DB ' + name +  ' connection error: ', error);
          mongoose.disconnect();
        });
        dbcon.on('connected', function() {
          log('DB ' + name + ' connected');
        });
        dbcon.once('open', function() {
          log('DB ' + name + ' connection open');
        });
        dbcon.on('reconnected', function() {
          log('DB ' + name +' reconnected, ' + url);
        });
        dbcon.on('disconnected', function() {
          log('DB ' + name + ' disconnected, ' + url);
          // connect();
          // => not needed; auto_reconnect active
        });

        db[name] = { // also return mongoose Connection for use in other modules
           mongooseConnection: dbcon
        };

        for (var schemaName in schemas) {
          db[name][schemaName + "s"] = dbcon.model(schemaName, schemas[schemaName]);
        }

      }

      function log(text){
          text = '[mongoose-multi] ' + text;
          if (logFunction){ // plug in your log function
               logFunction(text);
          }else{
              console.log(text);
          }
      }

      return db;
    }

};
