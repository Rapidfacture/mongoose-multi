var mongooseMulti = require('mongoose-multi');



// get all infos from external schema and config file
var config = require('./config.js');
var schemaFile = require('./schemas.js');

var connections = {};
for (var databaseName in config.db) {
   connections[databaseName] = {
      name: databaseName,
      url: config.db[databaseName],
      schemas: schemaFile[databaseName]
      // options : null - not implemented yet
   };
}

// start the connections
var db = mongooseMulti.start(connections);



// use in application

db.application.customers.find().exec(function (err, docs) {
   // do sth. here with customers
});

db.books.articles.find().exec(function (err, docs) {
   // "books" is the mongo database, "articles" is the collection
});
