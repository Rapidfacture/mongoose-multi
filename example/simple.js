var mongooseMulti = require('mongoose-multi');


// this two lines are needed for mongoose schema definition below in "connections"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// specify the connections; this gives an overwie here
// for larger applications "connections" might be assembled from a network config file and a schmeas file
var connections = {
  application: {
    name: "application",
    url: 'mongodb://192.168.168.90:27017/cad',
    schemas: { // mongoose schemas
      customer: new Schema({ // NOTE: an "s" will be added for the collection name (customer => customers)
        age: {
          type: Number,
          required: false
        },
        // further collections here in db.application
      })
    },
    options: {} // options for mongoose
  }
  // databases here
};


// establish the connections
var db = mongooseMulti.start(connections);
// call functions: query any collection in the specified dbs
// examples:

db.application.customers.find().exec(function(err, docs) {
  // do sth. here with customers
});

db.application.admins.find().exec(function(err, docs) {
  // "application" is the mongo database, "admins" is the collection
});
