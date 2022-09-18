import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

import { MongoClient, ServerApiVersion } from 'mongodb';
export let UsersCollection;

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASSWORD}@cluster0.ceyoj.gcp.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: false,
  serverApi: ServerApiVersion.v1,
});

mongoClient.connect((err, client) => {
  if (err) {
    console.log(err);
  } else {
    UsersCollection = client.db("user").collection("users");
    console.log('MongoDB Ready');
  }
});