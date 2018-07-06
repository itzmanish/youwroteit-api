const {MongoClient, ObjectID} = require('mongodb');
const mongoose = require("mongoose");
mongoose.connect('mongodb://rudra:Rudra108@ds121461.mlab.com:21461/youwroteit', (err, client) => {
  if(err) {
   return console.log('Error on connecting mongodb');
 }
   console.log('Connected to db');
   var db = client.db('todo');
   // add db
   db.collection('Todos').insertOne({
     text:'something',
     completed: false
   }, (err, result) =>{
     if(err){
       console.log('Unable to insert data');
     }
     console.log(JSON.stringify(result.ops, undefined, 2));
   });

   // delete a collection
   // db.collection('Todos').findOneAndDelete({}).then((result) =>{
   //   console.log(result);
   // });
   client.close();
});
