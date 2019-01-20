// Example schemas

// mongose is needed here for the definition
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = {
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
