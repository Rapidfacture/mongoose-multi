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
          log('MongoDB connecting to db ' + name + ' at URL ' + url);
        });
        dbcon.on('error', function(error) {
          log('Error in MongoDb connection: ' + error);
          mongoose.disconnect();
        });
        dbcon.on('connected', function() {
          log('MongoDB ' + name + ' connected at URL ' + url);
        });
        dbcon.once('open', function() {
          log('MongoDB ' + name + ' connection opened at URL ' + url);
        });
        dbcon.on('reconnected', function() {
          log('MongoDB ' + name +' reconnected at URL ' + url);
        });
        dbcon.on('disconnected', function() {
          log('MongoDB ' + name + ' disconnected at URL ' + url);
          // connect();
          // => not needed; auto_reconnect active
        });

        db[name] = {};

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
