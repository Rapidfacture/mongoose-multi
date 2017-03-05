// mongoose multi connections

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = {

    start: function (connections) {

      var db = {};

      for (var conName in connections) {
        var con = connections[conName];
        startConnection(con.name, con.url, con.schemas, con.options);
      }

      function startConnection(name, url, schemas, options) {

        if (!name) {
          err("no name specified for db");
          return;
        }

        if (!url) {
          err("no url defined for db " + name);
          return;
        }

        if (!schemas) {
          err("no schema found for db " + name);
          return;
        }


        // to do: merge options
        options = {
          server: {
            auto_reconnect: true
          }
        };

        connections[name] = mongoose
          .createConnection(url, options);

        var dbcon = connections[name];

        dbcon.on('connecting', function() {
          log('MongoDB connecting to db' + name + 'at URL ' + url);
        });
        dbcon.on('error', function(error) {
          err('Error in MongoDb connection: ' + error);
          mongoose.disconnect();
        });
        dbcon.on('connected', function() {
          log('MongoDB ' + name + 'connected!');
        });
        dbcon.once('open', function() {
          log('MongoDB ' + name + ' connection opened!');
        });
        dbcon.on('reconnected', function() {
          log('MongoDB ' + name +' reconnected!');
        });
        dbcon.on('disconnected', function() {
          log('MongoDB ' + name + 'disconnected!');
          // connect();
          // => not needed; auto_reconnect active
        });

        db[name] = {};

        for (var schemaName in schemas) {
          db[name][schemaName + "s"] = dbcon.model(schemaName, schemas[schemaName]);
        }

      }

      function log(text){
          console.log('mongoose-multi: ' + text);
      }

      function err(text){
          console.error('mongoose-multi: ' + text);
      }

      return db;
    }

};
