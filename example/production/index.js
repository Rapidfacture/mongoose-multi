var mongooseMulti = require('../../index.js');



// get all infos from external schema and config file
var config = require('./config.js');
var schemaFile = require('./schema.js');

// start the connections
var db = mongooseMulti.start(config.db, schemaFile);


// use in application
db.application.mongooseConnection.once('open', function () {

   db.application.customers.find({}).exec(function (err, docs) {
      // do sth. here with customers
      console.log(err, docs);
   });

   db.book.articles.find({}).exec(function (err, docs) {
      // "books" is the mongo database, "articles" is the collection
      console.log(err, docs);
   });
});
