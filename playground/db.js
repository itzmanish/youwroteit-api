const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
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
