import { MongoClient, ServerApiVersion } from 'mongodb';
export let UsersCollection;

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.PASSWORD}@cluster0.ceyoj.gcp.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

mongoClient.connect(err => {
  UsersCollection = mongoClient.db("user").collection("users");
});