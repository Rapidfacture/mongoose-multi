# mongoose-multi

Create multiple Mongoose connections to severals DBs. Store files through gridfs.

## Installation

```
npm install mongoose-multi --save
```

## Getting started

### Use the module in your code

The syntax is like 'database.collection' for maximum clarity.

```javascript
db.application.customer.find().exec(function(err, docs) {
  // do sth. here with customers
});
```
"customer" is the mongoose model and can use it's methods. See <http://mongoosejs.com/docs/guide.html>.


### Start the Module

Idea:
- network configuration in separate file (different modes for production, development, etc.)
- schemas in separate file

```javascript
// Start the module in the application
var   dbConfig = require('./config.js').db,  // external network file
      mongooseMulti = require('mongoose-multi'),
      db = mongooseMulti.start(dbConfig, node.env.PWD + './schemas.js'); // schema file path => mongoose-multi trys to require it


// wait for connection to be open
db.application.mongooseConnection.once('open', function () {

    // use it
    db.application.customer.find().exec(function(err, docs) {
      // do sth. here with customers
    });

    db.books.article.findOneAndUpdate().exec(function(err, doc) {
      // do sth. here with article
    });

    db.application.customer.findExactOne({}, function(err, doc) {
       // err if no or more than one docs are found
       // do sth. here with customer
    });

    db.books.article.findMinOne({}, function(err, doc) {
      // err if no docs are found
      // do sth. here with article
    });

 });
```

#### Network config file
You might integrate this your way in your config. mongoose-multi needs one object with all database urls to connect to.

```javascript
 module.exports = {
     "db":{
         "application": 'mongodb://localhost:27017/application',
         "book": 'mongodb://localhost:27017/books'
     }
 };
```

#### Mongoose Schemas file

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

     book:{ // database

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

         // this collection "files" will be gridfs
         files: "gridfs"
     }

 };
```

#### Advanced Schema file options

Option 1: If you need to modifie the schemas in your code, you can do so and then directly pass the object for all schemas.

```javascript
// Start the module
 var  dbConfig = require('./config.js'),  // external network file
      schemaFile = require('./schemas.js'),  // external schema file
      mongooseMulti = require('mongoose-multi'),
      db = mongooseMulti.start(dbConfig, schemaFile);   

// use "db" in your app  ..
```


Option 2: For bigger projects you can have a schema file folder. Each database has one file with it's name.

```javascript
// Start the module
 var  dbConfig = require('./config.js').db,  // external network file
      mongooseMulti = require('mongoose-multi'),
      db = mongooseMulti.start(dbConfig, node.env.PWD + './schemas'); // try to require all schema files within folder

// use "db" in your app  ..
```

`./schemas/application` looks like:

```javascript
 /** schemas for db application
 * @version 0.0.2
 */
 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;

 module.exports = {
    customer: new Schema({ // collection
        mailaddress: {type: String},
   }),

   settings: new Schema({ // collection
        customerId: {type: String, required: false},
        options: {type: Array, required: false},
   }),

 };
```

`./schemas/book` looks like:

```javascript
/** schemas for db book
* @version 0.0.4
*/
 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;

 module.exports = {

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

         // this collection "files" will be gridfs
         files: "gridfs"

 };
```


#### Network config file
The network file may include all urls to your databases:

```javascript
 module.exports = {
     "db":{
         "application": 'mongodb://localhost:27017/application',
         "book": 'mongodb://localhost:27017/books'
     }
 };
```

Alternative you can also pass options:

```javascript
 module.exports = {
    module.exports = {
        db: {
            online: {
                url: "mongodb://localhost:27017/auditoria",
                options : {useNewUrlParser: true}
            },
            history: {
                url: "mongodb://otheHost:27017/db_arquitectura",
                options : {}
            }
        }
    }
 };
```


## gridfs support

Why use gridfs?

- serve files over the network
- easy backup together with database
- no extra changes on mongoDB itselfe

This module uses mongoose-gridfs for addressing gridfs. In your schema file, use:

```javascript
// mongose is needed here for the definition
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    book:{ // database

      // this collection "files" will be gridfs
      // use `gridfs` as string instead of the mongoose schema
      files: "gridfs"

      // standard mongoose connection
      paperback: new Schema({ // collection
         description: {type: String, required: false},
         numOfPages: {type:Number, required: false},
         weight:{type:Number, required: false},
      }),

    }
};
```
Use gridfs-stream in your application like:

```javascript

// read
var readstream = db.books.files.createReadStream({
   _id: data
});
readstream.pipe(res); // pipe stream to your express response and send it to client



// write 'buffer' into gridfs
var writestream = db.cad.drawingBin.createWriteStream({
   contentType: 'application/octet-stream'
});
var stream = require('stream'); // stream from buffer
var bufferStream = new stream.PassThrough();
bufferStream.end(buffer);
bufferStream.pipe(writestream); // buffer to gridfs

writestream.on('close', function(file) {
   console.log(file);
});
writestream.on('error', function(err) {
   console.log(err);
});

```
See https://www.npmjs.com/package/gridfs-stream for further commands.


## Reuse the mongoose connection

The original mongoose connection is also returned for every DB to use it in other own modules, or especially the events like:

```javascript
   // we assume a database "application"

   db.application.mongooseConnection.once('open', function() {
      console('db application now open');
      startSomething(db); // start after db is ready
   });
```



## Mongoose reconnection issues

There have been several issues, that prevent a correct reconnect to the databse.
In many cases, one might never see a disconntect, but a app in production should reconnect reliable.
In this version we simple terminate the process after 10 seconds disconnect and restart it automatic with pm2.
This might be changed in the future, when there is a better and reliable workaround.
Check if this is for your process.


## Development
Install the dev tools with

> npm install

Then you can runs some test cases and eslint with:

> npm test

## ToDo

- tests
