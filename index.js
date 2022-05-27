const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w65ji.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const partsCollection = await client.db("car_parts").collection("parts");
    const reviewsCollection = await client
      .db("car_parts")
      .collection("reviews");

    app.get("/parts", async (req, res) => {
      const query = {};
      const options = {
        sort: { _id: -1 },
      };
      const cursor = partsCollection.find(query, options);
      const parts = await cursor.toArray();
      res.send(parts);
    });

    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const part = await partsCollection.findOne(query);
      res.send(part);
    });

    // get all reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const options = {
        sort: { _id: -1 },
      };
      const cursor = reviewsCollection.find(query, options);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // post a review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
