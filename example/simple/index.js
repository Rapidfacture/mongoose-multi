var mongooseMulti = require('../../index.js');



// this two lines are needed for mongoose schema definition below in "connections"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// specify the connections; this gives an overwie here
// for larger applications "connections" might be assembled from a network config file and a schmeas file
var connections = {
   application: {
      url: 'mongodb://localhost:27017/cad',
      options: {} // options for mongoose
   },
   book: 'mongodb://localhost:27017/book'
};

var schemas = { // mongoose schemas

   application: { // database
      customer: new Schema({ // collection
         mailaddress: {type: String}
      }),

      setting: new Schema({ // collection
         customerId: {type: String, required: false},
         options: {type: Array, required: false}
      })
   },

   book: { // database
      article: new Schema({ // collection
         description: {type: String},
         numOfPages: {type: Number, required: false},
         weight: {type: Number, required: false}
      }),

      paperback: new Schema({ // collection
         description: {type: String, required: false},
         numOfPages: {type: Number, required: false},
         weight: {type: Number, required: false}
      })

   }
};


// start the connections
var db = mongooseMulti.start(connections, schemas);


// use in application
db.application.mongooseConnection.once('open', function () {

   db.application.customers.find().exec(function (err, docs) {
      // do sth. here with customers
      console.log(err, docs);
   });

   db.book.articles.find().exec(function (err, docs) {
      // "book" is the mongo database, "articles" is the collection
      console.log(err, docs);
   });
});
