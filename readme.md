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
db.application.customers.find().exec(function(err, docs) {
  // do sth. here with customers
});
```
"customers" is the mongoose model and can use it's methods. See <http://mongoosejs.com/docs/guide.html>.


### Start the Module

Idea:
- network configuration in separate file (different modes for production, development, etc.)
- schemas in separate file

**Start the module in the application**.

```javascript
 var  dbConfig = require('./config.js'),  // external network file
      schemaFile = require('./schemas.js'),  // external schema file
      mongooseMulti = require('mongoose-multi'),
      db = mongooseMulti.start(dbConfig, schemaFile);


 // use it
 db.application.customers.find().exec(function(err, docs) {
   // do sth. here with customers
 });

 db.books.articles.findOneAndUpdate().exec(function(err, doc) {
   // do sth. here with article
 });

 db.application.customers.findExactOne({}, function(err, doc) {
    // err if no or more than one docs are found
    // do sth. here with customer
 });

 db.books.articles.findMinOne({}, function(err, doc) {
   // err if no docs are found
   // do sth. here with article
 });
```

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

         // this collection "files" will be gridfs
         files: "gridfs"
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
    books:{ // database

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
var writestream = db.cad.drawingBins.createWriteStream({
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
