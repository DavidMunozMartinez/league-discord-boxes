// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASSWORD}@cluster0.ceyoj.gcp.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

export let UsersCollection;
mongoClient.connect(err => {
  UserCollection = mongoClient.db("user").collection("users");
});