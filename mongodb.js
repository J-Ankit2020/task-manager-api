// CRUD
const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'task-manger';
MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
  if (error) {
    return console.log('Unable to connect');
  }
  const db = client.db(dbName);
  // db.collection('users')
  //   .updateOne(
  //     {
  //       _id: ObjectId('61eacf81d7d992ab6aa54375'),
  //     },
  //     {
  //       $inc: {
  //         age: 2,
  //       },
  //     }
  // )
  // .then(result => console.log(result))
  // .catch(err => console.log(err));
  //   db.collection('tasks')
  //     .updateMany(
  //       {
  //         completed: false,
  //       },
  //       {
  //         $set: {
  //           completed: true,
  //         },
  //       }
  //     )
  //     .then(res => console.log(res.modifiedCount))
  //     .catch(err => console.log(err));
  // db.collection('users')
  //   .deleteMany({
  //     age: 28,
  //   })
  //   .then(res => console.log(res))
  //   .catch(err => console.log(err));
  db.collection('tasks')
    .deleteOne({
      description: 'Study',
    })
    .then(res => console.log(res.deletedCount))
    .catch(err => console.log(err));
});
