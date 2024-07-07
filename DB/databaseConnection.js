import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb'


dotenv.config({ path: '../secrets.env' });
const MongoDB_URI = process.env.MONOGODB_URI;

const uri = MongoDB_URI || "";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  }
  
  let db = client.db("books");
  
  export default db;
