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
    const bookingCollection = await client
      .db("car_parts")
      .collection("bookings");
    const userCollection = await client.db("car_parts").collection("users");

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

    // upsert users
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
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

    // get bookings for specefic user
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });

    // post bookings
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
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
