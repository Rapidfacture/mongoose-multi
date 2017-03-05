#mongoose-multi



## Installation

    npm install mongoose-multi --save

## Getting started

#### Use the module in your code

The syntay is mongoDB like to for maximum clarity.

```javascript
db.application.customers.find().exec(function(err, docs) {
  // do sth. here with customers
});
```
"customers" is a mongoose model and can use its'methods. See http://mongoosejs.com/docs/guide.html.


#### Start the Module - simple example for overview

```javascript
var mongooseMulti = require('mongoose-multi');

// specify the connections
var mongoose = require('mongoose'); // needed for schema definition
var Schema = mongoose.Schema;

var connections = {
  application: {
    name: "application",
    url: 'mongodb://192.169.18.59:27017/application',
    schemas: { // mongoose schemas
      customer: new Schema({
        age: {
          type: Number,
          required: false
        },
        // further collections here in db.application
      })
    }
  }
  // databases here
};


// start the connections
var db = mongooseMulti.start(connections);


```

#### Start the Module in Production

Ideas:
 * network configuration in config file
 * schemas in schema file


**Network config file**. You might integrate this your way.

 ```javascript
 module.exports = {
     "db":{
         "application": 'mongodb://localhost:27017/application',
         "books": 'mongodb://localhost:27017/books'
     }
 };
```

**Mongoose Schemas file**. You might integrate this your way.

 ```javascript
 // mongose is needed here for the definition
 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;


 module.exports = {
     application:{ // database

         customer: new Schema({ // collection
             mailaddress: {type: String},
         }),

         settings: new Schema({ // collection
             customerId: {type: String, required: false},
             options: {type: Array, required: false},
         }),

     },

     books:{ // database

         article: new Schema({ // collection
             description: {type: String},
             numOfPages: {type:Number, required: false},
             weight:{type:Number, required: false},
         }),

         paperback: new Schema({ // collection
             description: {type: String, required: false},
             numOfPages: {type:Number, required: false},
             weight:{type:Number, required: false},
         }),

     }
 };

```


**Start the module in the application**.

 ```javascript
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
     // mongoose connection options
     options : {}  // http://mongoosejs.com/docs/connections.html
   };
 }

 // start the connections
 var db = mongooseMulti.start(connections);


 // use in application
 db.application.customers.find().exec(function(err, docs) {
   // do sth. here with customers
 });


```
## ToDo
* gitHub project
* tests
