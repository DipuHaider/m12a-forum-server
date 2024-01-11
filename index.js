const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      //   "https://stunning-cassata-c2b035.netlify.app",
      //   "https://65530682e4bfd91903c02156--stunning-cassata-c2b035.netlify.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7lzpbmm.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const userCollection = client.db("forumDB").collection("user");
    const postCollection = client.db("forumDB").collection("post");
    const announcementCollection = client
      .db("forumDB")
      .collection("announcement");

    //announcement related apis

    //create announcement
    app.post("/announcement", async (req, res) => {
      const newAnnouncement = req.body;
      console.log(newAnnouncement);
      const result = await announcementCollection.insertOne(newAnnouncement);
      res.send(result);
    });

    //Read announcement
    app.get("/announcement", async (req, res) => {
      // const cursor = announcementCollection.find();
      const cursor = announcementCollection
        .find()
        .sort({ announcement_time: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    //post related apis

    //create post
    app.post("/post", async (req, res) => {
      const newPost = req.body;
      console.log(newPost);
      const result = await postCollection.insertOne(newPost);
      res.send(result);
    });

    //Read post with pagination and search
    app.get("/post", async (req, res) => {
      let queryObj = {};
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const post_tag = req.query.post_tag;
      // console.log("pagination", page, size);

      if (post_tag) {
        queryObj.post_tag = post_tag;
      }
      if (post_tag === "all") {
        queryObj = {};
      }

      const result = await postCollection
        .find(queryObj)
        .skip(page * size)
        .limit(size)
        .sort({ post_time: -1 })
        .toArray();
      res.send(result);
    });

    //Search post milestone 11 mastering CRUD with jwt day3 level 2 mentor part 1

    //Read single post
    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postCollection.findOne(query);
      res.send(result);
    });

    //Read All post
    app.get("/allposts", async (req, res) => {
      const cursor = postCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //post count for pagination
    app.get("/postsCount", async (req, res) => {
      const count = await postCollection.estimatedDocumentCount();
      res.send({ count });
    });

    //user related apis

    //create user
    app.post("/user", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    //read user
    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //Update user
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUser = req.body;

      const user = {
        $set: {
          isadmin: updatedUser.isadmin,
        },
      };

      const result = await userCollection.updateOne(filter, user, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("B8M12 Assignment Forum Server is running");
});

app.listen(port, () => {
  console.log(`B8M12 Assignment Forum is listening on port ${port}`);
});
