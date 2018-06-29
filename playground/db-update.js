const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
  if(err) {
   return console.log('Error on connecting mongodb');
 }
   console.log('Connected to db');
   var db = client.db('todo');
   db.collection('Users').findOneAndUpdate({
     name: 'Manish'
   }, {
     $set:
      {
        name: 'Kvgh'
      },
       $inc:
        {
          age: 2
        }
      }, {
         returnOriginal: false
       }).then((result) => {
      console.log(result);
    });
   client.close();
});
